export type LazyObject<TObject extends Record<string, unknown>> = {
  [K in keyof TObject]: TObject[K];
};

export type LazyObjectPropertyFactory<TObject extends Record<string, unknown>> =
  {
    [K in keyof TObject]: (self: LazyObject<TObject>) => TObject[K];
  };

export function createLazyObject<TObject extends Record<string, unknown>>(
  propertyFactory: LazyObjectPropertyFactory<TObject>
): LazyObject<TObject> {
  const factoryStack: (keyof TObject)[] = [];
  const target: Partial<TObject> = {};
  const proxy = new Proxy(target, {
    set() {
      throw new Error("Use createLazyObject function.");
    },
    get(t: typeof target, p: string) {
      if (p === "then") return undefined;

      if (Reflect.has(t, p)) return Reflect.get(t, p);

      if (!Reflect.has(propertyFactory, p))
        throw new Error(`Factory must exist. property: ${p.toString()}`);
      const factoryFn = Reflect.get(propertyFactory, p);

      if (factoryStack.find((v) => v === p))
        throw new Error(
          `Circular dependency detected while creating. property: ${p.toString()} factory stack: ${factoryStack}`
        );
      factoryStack.push(p);

      try {
        const value = factoryFn(proxy as LazyObject<TObject>);
        Reflect.set(t, p, value);

        return value;
      } finally {
        const last = factoryStack.pop();
        if (last !== p)
          throw new Error(
            `Invalid factory stack. property: ${p.toString()} last: ${last?.toString()}`
          );
      }
    },
  });

  return proxy as LazyObject<TObject>;
}
