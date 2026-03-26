import ElectronStore from 'electron-store';

/**
 * electron-store v11 + conf v15: với TS 4.5 và moduleResolution "node",
 * class ElectronStore<T> không kế thừa đúng method get/set/delete trên kiểu.
 * Helper này giữ runtime ElectronStore, chỉ cố định lại kiểu API.
 */
export type TypedStore<T extends Record<string, unknown>> = {
  get<K extends keyof T>(key: K): T[K] | undefined;
  set<K extends keyof T>(key: K, value: T[K]): void;
  delete(key: keyof T): void;
};

type StoreCtorConfig<T extends Record<string, unknown>> = {
  name: string;
  defaults?: Partial<T>;
};

export function createTypedStore<T extends Record<string, unknown>>(
  config: StoreCtorConfig<T>,
): TypedStore<T> {
  const Ctor = ElectronStore as unknown as new (
    cfg: StoreCtorConfig<T>,
  ) => unknown;
  return new Ctor(config) as TypedStore<T>;
}
