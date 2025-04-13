export class ServiceRegistryBase<Defs extends Record<string, unknown>> {
  private map = new Map<keyof Defs, unknown>();

  set<K extends keyof Defs>(key: K, value: Defs[K]) {
    if (this.map.has(key)) throw new Error(`${String(key)} already exists.`);
    this.map.set(key, value);
  }

  get<K extends keyof Defs>(key: K): Defs[K] {
    const value = this.map.get(key);
    if (value === undefined) throw new Error(`${String(key)} does not exist.`);
    return value as Defs[K];
  }
}
