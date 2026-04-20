export function cloneTableDefinition<T extends Record<string, any>>(table: T): T {
  const cloned: Record<string, any> = {};

  Object.keys(table).forEach((key: string) => {
    cloned[key] = { ...table[key] };
  });

  return cloned as T;
}
