import type { MaybePromise } from "@/types/common";

type FactoryMap<TDefinition extends Record<string, unknown>> = {
  [K in keyof TDefinition]: (
    registry: LazyRegistry<TDefinition>
  ) => MaybePromise<TDefinition[K]>;
};

export class LazyRegistry<TDefinition extends Record<string, unknown>> {
  private readonly map = new Map<
    keyof TDefinition,
    TDefinition[keyof TDefinition]
  >();
  private readonly creationStack: (keyof TDefinition)[] = [];

  constructor(private readonly factoryMap: FactoryMap<TDefinition>) {}

  async get<K extends keyof TDefinition>(
    key: K
  ): Promise<MaybePromise<TDefinition[K]>> {
    const value = this.map.get(key);
    if (value !== undefined) return value as TDefinition[K];
    if (!Reflect.has(this.factoryMap, key))
      throw new Error(`Factory must exist. key: ${key.toString()}`);
    if (this.creationStack.find((v) => v === key))
      throw new Error(
        `Circular dependency detected while creating. key: ${key.toString()} creation stack: ${
          this.creationStack
        }`
      );
    this.creationStack.push(key);
    try {
      const factory = Reflect.get(
        this.factoryMap,
        key
      ) as FactoryMap<TDefinition>[K];
      const value = await factory(this);
      this.map.set(key, value);
      return value;
    } finally {
      const last = this.creationStack.pop();
      if (last !== key)
        throw new Error(
          ` creation stack is invalid. key: ${key.toString()} last: ${last?.toString()}`
        );
    }
  }
}
