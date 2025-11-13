interface Provider<TInjectable> {
  (): TInjectable;
}

type AnyProviderMap = Record<string, Provider<any>>;

interface Injector<TProviderMap extends AnyProviderMap> {
  <TName extends keyof TProviderMap>(name: TName): ReturnType<
    TProviderMap[TName]
  >;
}

export class Container<TProviderMap extends AnyProviderMap> {
  readonly #injectableMap: Record<string, any> = {};
  readonly #providerMap: TProviderMap;
  readonly #callStack = new Set<string>();

  constructor(providerMap: TProviderMap) {
    this.#providerMap = providerMap;
  }

  getInjectable<TName extends keyof TProviderMap>(
    name: TName
  ): ReturnType<TProviderMap[TName]> {
    const nameString = name.toString();

    if (nameString in this.#injectableMap) {
      return this.#injectableMap[nameString];
    }

    const provider = this.#providerMap[nameString];
    if (!provider) {
      throw new Error(`[${nameString}] provider not exists.`);
    }

    if (this.#callStack.has(nameString)) {
      const callStack = this.#callStack.keys().toArray();
      callStack.push(nameString);
      throw new Error(
        `Circular call detected. call stack: [${callStack.join(" -> ")}]`
      );
    }

    try {
      this.#callStack.add(nameString);
      const injectable = provider();
      if (!injectable) {
        throw new Error(`[${nameString}] provider is invalid.`);
      }

      this.#injectableMap[nameString] = injectable;
      return injectable;
    } finally {
      this.#callStack.clear();
    }
  }

  getInjector(): Injector<TProviderMap> {
    return this.getInjectable.bind(this);
  }

  static newBuilder(this: void): ContainerBuilder<{}> {
    return new ContainerBuilder({});
  }
}

class ContainerBuilder<TProviderMap extends AnyProviderMap> {
  readonly #providerMap: TProviderMap;

  constructor(providerMap: TProviderMap) {
    this.#providerMap = providerMap;
  }

  addProvider<TName extends string, TInjectable>(
    name: TName,
    provider: Provider<TInjectable>
  ): ContainerBuilder<
    TProviderMap & {
      [key in TName]: Provider<TInjectable>;
    }
  > {
    if (name in this.#providerMap) {
      throw new Error(`[${name}] provider exists.`);
    }

    return new ContainerBuilder({
      ...this.#providerMap,
      [name]: provider,
    });
  }

  build(): Container<TProviderMap> {
    return new Container<TProviderMap>(this.#providerMap);
  }
}
