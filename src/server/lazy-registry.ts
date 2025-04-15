export type LazyRegistryProxy<TDefinition extends Record<string, unknown>> = {
  [K in keyof TDefinition]: TDefinition[K];
};

export type FactoryMap<TDefinition extends Record<string, unknown>> = {
  [K in keyof TDefinition]: (
    registry: LazyRegistryProxy<TDefinition>
  ) => TDefinition[K];
};

export function createLazyRegistry<TDefinition extends Record<string, unknown>>(
  factoryMap: FactoryMap<TDefinition>
): LazyRegistryProxy<TDefinition> {
  const factoryStack: (keyof TDefinition)[] = [];
  const target: Partial<TDefinition> = {};
  const proxy = new Proxy(target, {
    set() {
      throw new Error("Use createLazyRegistry function.");
    },
    get(t: typeof target, p: string) {
      if (p === "then") return undefined;
      if (Reflect.has(t, p)) return Reflect.get(t, p);
      if (!Reflect.has(factoryMap, p))
        throw new Error(`Factory must exist. property: ${p.toString()}`);
      if (factoryStack.find((v) => v === p))
        throw new Error(
          `Circular dependency detected while creating. property: ${p.toString()} factory stack: ${factoryStack}`
        );
      factoryStack.push(p);
      try {
        const factory = Reflect.get(factoryMap, p);
        const value = factory(proxy as LazyRegistryProxy<TDefinition>);
        Reflect.set(t, p, value);
        return value;
      } finally {
        const last = factoryStack.pop();
        if (last !== p)
          throw new Error(
            ` factory stack is invalid. property: ${p.toString()} last: ${last?.toString()}`
          );
      }
    },
  });
  return proxy as LazyRegistryProxy<TDefinition>;
}
