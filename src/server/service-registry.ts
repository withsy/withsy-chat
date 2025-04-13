class ServiceRegistry<TServiceMap extends Record<string, unknown>> {
  private data = new Map<keyof TServiceMap, unknown>();

  set<K extends keyof TServiceMap>(key: K, value: TServiceMap[K]) {
    if (this.data.has(key)) throw new Error(`${String(key)} already exists.`);
    this.data.set(key, value);
  }

  get<K extends keyof TServiceMap>(key: K): TServiceMap[K] {
    const value = this.data.get(key);
    if (value === undefined) throw new Error(`${String(key)} does not exist.`);
    return value as TServiceMap[K];
  }
}

export function createServiceRegistry<
  TServiceMap extends Record<string, unknown>
>() {
  return new Proxy(new ServiceRegistry<TServiceMap>(), {
    set(target, p: string, newValue) {
      target.set(p, newValue);
      return true;
    },
    get(target, p: string) {
      return target.get(p);
    },
  }) as unknown as TServiceMap;
}
