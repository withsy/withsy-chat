// #region Helpers

type MaybePromise<T> = T | Promise<T>;

type Merged<A extends object, B extends object> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
    ? A[K]
    : never;
};

type Simplified<T extends object> = T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

// #endregion Helpers

// #region Common types

interface ProviderContext<InjectableMap extends AnyInjectableMap> {
  inject: Injector<InjectableMap>;
}

interface Provider<InjectableMap extends AnyInjectableMap, Injectable> {
  (context: ProviderContext<InjectableMap>): Injectable;
}

interface Destroyer<Injectable> {
  (injectable: Injectable): MaybePromise<void>;
}

interface Options<Injectable> {
  destroy?: Destroyer<Injectable>;
}

interface Injector<InjectableMap extends AnyInjectableMap> {
  <Name extends keyof InjectableMap>(name: Name): InjectableMap[Name];
}

type AnyInjectable = any;

type AnyInjectableMap = Record<string, AnyInjectable>;

type ProviderMap<InjectableMap extends AnyInjectableMap> = Map<
  keyof InjectableMap,
  Provider<InjectableMap, InjectableMap[keyof InjectableMap]>
>;

type AnyOptionsMap = Map<string, Options<AnyInjectable>>;

// #endregion Common

// #region Container

export class DiContainer<InjectableMap extends AnyInjectableMap> {
  readonly #providerMap: ProviderMap<InjectableMap>;
  readonly #optionsMap: AnyOptionsMap;
  readonly #instanceMap = new Map<string, AnyInjectable>();
  readonly #currentInitOrders = new Set<string>();
  #destroyed = false;

  constructor(builderContext: BuilderContext<InjectableMap>) {
    this.#providerMap = builderContext.providerMap;
    this.#optionsMap = builderContext.optionsMap;
  }

  #checkNotDestroyed() {
    if (this.#destroyed) {
      throw new Error("DI Container is destroyed.");
    }
  }

  init() {
    this.#checkNotDestroyed();

    this.#providerMap.keys().forEach((name) => this.get(name));
  }

  async destroy() {
    if (this.#destroyed) {
      return;
    }

    this.#destroyed = true;

    await this.#destroyInstances();

    this.#optionsMap.clear();
    this.#providerMap.clear();
  }

  async #destroyInstances() {
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

  get<Name extends keyof InjectableMap>(name: Name): InjectableMap[Name] {
    this.#checkNotDestroyed();

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

      const provider = this.#providerMap.get(nameString);
      if (!provider) {
        throw new Error(`Provider name '${nameString}' not exists.`);
      }

      this.#currentInitOrders.add(nameString);

      const instance = provider({ inject: this.get.bind(this) });
      this.#instanceMap.set(nameString, instance);

      return instance as any;
    } finally {
      this.#currentInitOrders.clear();
    }
  }

  static newBuilder(this: void): Builder<object> {
    const providerMap: ProviderMap<AnyInjectableMap> = new Map();
    return new Builder({
      providerMap,
      optionsMap: new Map(),
    });
  }
}

// #endregion Container

// #region Builder types

interface BuilderContext<InjectableMap extends AnyInjectableMap> {
  readonly providerMap: ProviderMap<InjectableMap>;
  readonly optionsMap: AnyOptionsMap;
}

type NoDuplicatedName<
  T extends string,
  InjectableMap extends AnyInjectableMap
> = T extends keyof InjectableMap
  ? { error: `Provider name '${T}' already exists.` } & T
  : T;

// #endregion Builder types

// #region Builder

class Builder<InjectableMap extends AnyInjectableMap> {
  readonly #context: BuilderContext<InjectableMap>;

  constructor(context: BuilderContext<InjectableMap>) {
    this.#context = context;
  }

  add<Name extends string, Injectable>(
    name: NoDuplicatedName<Name, InjectableMap>,
    provider: Provider<InjectableMap, Injectable>,
    options?: Options<Injectable>
  ): Builder<
    Simplified<
      Merged<
        InjectableMap,
        {
          [key in Name]: Injectable;
        }
      >
    >
  > {
    if (this.#context.providerMap.has(name)) {
      throw new Error(`Provider name '${name}' already exists.`);
    }

    this.#context.providerMap.set(name, provider as any);
    if (options) {
      this.#context.optionsMap.set(name, options);
    }

    return new Builder(this.#context as any);
  }

  build(): DiContainer<InjectableMap> {
    return new DiContainer<InjectableMap>(this.#context);
  }
}

// #endregion Builder
