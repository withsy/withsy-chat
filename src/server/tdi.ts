// #region Helpers

type MaybePromise<T> = T | Promise<T>;

type Merged<A extends object, B extends object> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
    ? A[K]
    : never;
};

type Simplify<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// #endregion Helpers

// #region Common types

interface InjectableProvider<Injectable> {
  (): Injectable;
}

type InjectableDestroyer<Injectable> = (
  injectable: Injectable
) => MaybePromise<void>;

interface InjectableOptions<Injectable> {
  destroy?: InjectableDestroyer<Injectable>;
}

type InferInjectable<T> = T extends InjectableProvider<infer I> ? I : never;

type AnyInjectable = any;
type AnyProviderMap = Record<string, InjectableProvider<AnyInjectable>>;
type AnyOptionsMap = Map<string, InjectableOptions<AnyInjectable>>;

interface Injector<ProviderMap extends AnyProviderMap> {
  <Name extends keyof ProviderMap>(name: Name): InferInjectable<
    ProviderMap[Name]
  >;
}

// #endregion Common

// #region Container

export class Container<ProviderMap extends AnyProviderMap> {
  readonly #providerMap: ProviderMap;
  readonly #optionsMap: AnyOptionsMap;
  readonly #instanceMap = new Map<string, AnyInjectable>();
  readonly #currentInitOrders = new Set<string>();

  constructor(builderContext: BuilderContext<ProviderMap>) {
    this.#providerMap = builderContext.providerMap;
    this.#optionsMap = builderContext.optionsMap;
  }

  init() {
    this.#optionsMap.keys().forEach((name) => this.getInjectable(name));
  }

  async destroy() {
    await this.destroyInstances();

    this.#optionsMap.clear();
    Object.keys(this.#providerMap).forEach(
      (key) => delete this.#providerMap[key]
    );
  }

  private async destroyInstances() {
    const instances = this.#instanceMap.entries().toArray().reverse();
    this.#instanceMap.clear();

    for (const [name, instance] of instances) {
      const options = this.#optionsMap.get(name);
      if (options) {
        const { destroy } = options;
        if (destroy) {
          await destroy(instance);
        }
      }
    }
  }

  getInjectable<Name extends keyof ProviderMap>(
    name: Name
  ): InferInjectable<ProviderMap[Name]> {
    const nameString = name.toString();

    if (this.#instanceMap.has(nameString)) {
      return this.#instanceMap.get(nameString);
    }

    try {
      if (this.#currentInitOrders.has(nameString)) {
        const currentInitOrders = this.#currentInitOrders.keys().toArray();
        currentInitOrders.push(nameString);
        const order = currentInitOrders.join(" -> ");
        throw new Error(`Circular initialization detected. order: [${order}]`);
      }

      const provider = this.#providerMap[nameString];
      if (!provider) {
        throw new Error(`Provider name '${nameString}' not exists.`);
      }

      this.#currentInitOrders.add(nameString);

      const injectable = provider();
      this.#instanceMap.set(nameString, injectable);

      return injectable;
    } finally {
      this.#currentInitOrders.clear();
    }
  }

  getInjector(): Injector<ProviderMap> {
    return this.getInjectable.bind(this);
  }

  static newBuilder(this: void): Builder<{}> {
    return new Builder({
      providerMap: {},
      optionsMap: new Map(),
    });
  }
}

// #endregion Container

// #region Builder types

interface BuilderContext<ProviderMap extends AnyProviderMap> {
  readonly providerMap: ProviderMap;
  readonly optionsMap: AnyOptionsMap;
}

type NoDuplicatedName<
  T extends string,
  ProviderMap extends object
> = T extends keyof ProviderMap
  ? { error: `Provider name '${T}' already exists.` } & T
  : T;

type MergedProviderMap<
  ProviderMap extends AnyProviderMap,
  Name extends string,
  Injectable
> = Merged<
  ProviderMap,
  {
    [key in Name]: InjectableProvider<Injectable>;
  }
>;

// #endregion Builder types

// #region Builder

class Builder<ProviderMap extends AnyProviderMap> {
  readonly #context: BuilderContext<ProviderMap>;

  constructor(context: BuilderContext<ProviderMap>) {
    this.#context = context;
  }

  add<Name extends string, Injectable>(
    name: NoDuplicatedName<Name, ProviderMap>,
    provider: InjectableProvider<Injectable>,
    options?: InjectableOptions<Injectable>
  ): Builder<Simplify<MergedProviderMap<ProviderMap, Name, Injectable>>> {
    if (name in this.#context.providerMap) {
      throw new Error(`Provider name '${name}' already exists.`);
    }

    Reflect.set(this.#context.providerMap, name, provider);
    if (options) {
      this.#context.optionsMap.set(name, options);
    }

    return new Builder(this.#context as any);
  }

  build(): Container<ProviderMap> {
    return new Container<ProviderMap>(this.#context);
  }
}

// #endregion Builder
