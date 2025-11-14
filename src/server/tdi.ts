interface InjectableProvider<Injectable> {
  (): Injectable;
}

export type InjectableDestroyer = () => void | Promise<void>;

export interface InjectableContext<Injectable> {
  injectable: Injectable;
  destroy?: InjectableDestroyer;
}

export abstract class InjectableContextProvider<Injectable> {
  abstract provide(): InjectableContext<Injectable>;
}

type InjectableProviderLike<Injectable> =
  | InjectableProvider<Injectable>
  | InjectableContextProvider<Injectable>;

type InferInjectable<T> = T extends InjectableProvider<infer I>
  ? I
  : T extends InjectableContextProvider<infer I>
  ? I
  : never;

type AnyInjectableProviderMap = Record<string, InjectableProviderLike<any>>;

interface Injector<ProviderMap extends AnyInjectableProviderMap> {
  <Name extends keyof ProviderMap>(name: Name): InferInjectable<
    ProviderMap[Name]
  >;
}

export class Container<ProviderMap extends AnyInjectableProviderMap> {
  readonly #providerMap: ProviderMap;
  readonly #providerAddedOrders: Set<string>;
  readonly #injectableContextMap = new Map<string, InjectableContext<any>>();
  readonly #injectableInitOrders = new Set<string>();

  constructor(providerMap: ProviderMap, providerAddedOrders: Set<string>) {
    this.#providerMap = providerMap;
    this.#providerAddedOrders = providerAddedOrders;
  }

  init() {
    this.#providerAddedOrders.forEach((name) => this.getInjectable(name));
  }

  async destroy() {
    await this.destroyInjectables();

    this.#providerAddedOrders.clear();
    Object.keys(this.#providerMap).forEach(
      (key) => delete this.#providerMap[key]
    );
  }

  private async destroyInjectables() {
    const injectableContextEntries = this.#injectableContextMap
      .entries()
      .toArray()
      .reverse();
    this.#injectableContextMap.clear();

    for (const [_, context] of injectableContextEntries) {
      if (context.destroy) {
        await context.destroy();
      }
    }
  }

  getInjectable<Name extends keyof ProviderMap>(
    name: Name
  ): InferInjectable<ProviderMap[Name]> {
    const nameString = name.toString();

    const injectableContext = this.#injectableContextMap.get(nameString);
    if (injectableContext) {
      return injectableContext.injectable;
    }

    const provider = this.#providerMap[nameString];
    if (!provider) {
      throw new Error(`[${nameString}] provider not exists.`);
    }

    if (this.#injectableInitOrders.has(nameString)) {
      const injectableInitOrders = this.#injectableInitOrders.keys().toArray();
      injectableInitOrders.push(nameString);

      throw new Error(
        `Circular call detected. init order: [${injectableInitOrders.join(
          " -> "
        )}]`
      );
    }

    try {
      this.#injectableInitOrders.add(nameString);

      const injectableContext = provideInjectableContext(nameString, provider);
      this.#injectableContextMap.set(nameString, injectableContext);

      return injectableContext.injectable;
    } finally {
      this.#injectableInitOrders.clear();
    }
  }

  getInjector(): Injector<ProviderMap> {
    return this.getInjectable.bind(this);
  }

  static newBuilder(this: void): Builder<{}> {
    return new Builder({
      providerMap: {},
      providerAddedOrders: new Set(),
    });
  }
}

interface BuilderContext<ProviderMap extends AnyInjectableProviderMap> {
  readonly providerMap: ProviderMap;
  readonly providerAddedOrders: Set<string>;
}

class Builder<ProviderMap extends AnyInjectableProviderMap> {
  readonly #context: BuilderContext<ProviderMap>;

  constructor(context: BuilderContext<ProviderMap>) {
    this.#context = context;
  }

  addProvider<Name extends string, Injectable>(
    name: Name,
    provider: InjectableProviderLike<Injectable>
  ): Builder<
    ProviderMap & {
      [key in Name]: InjectableProviderLike<Injectable>;
    }
  > {
    if (name in this.#context.providerMap) {
      throw new Error(`[${name}] provider exists.`);
    }

    Reflect.set(this.#context.providerMap, name, provider);
    this.#context.providerAddedOrders.add(name);

    return new Builder(this.#context);
  }

  build(): Container<ProviderMap> {
    return new Container<ProviderMap>(
      this.#context.providerMap,
      this.#context.providerAddedOrders
    );
  }
}

function provideInjectableContext<Injectable>(
  name: string,
  provider: InjectableProviderLike<Injectable>
): InjectableContext<Injectable> {
  let injectableContext: InjectableContext<Injectable> | undefined = undefined;
  if (provider instanceof InjectableContextProvider) {
    injectableContext = provider.provide();
  } else {
    const injectable = provider();
    injectableContext = { injectable };
  }

  if (!injectableContext) {
    throw new Error(`[${name}] injectable context is invalid.`);
  }

  return injectableContext;
}
