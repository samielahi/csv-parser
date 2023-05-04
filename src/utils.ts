function createFrequencyMap<T>(array: T[]) {
  const map = new Map<T, number>();
  for (const value of array) {
    const count = map.get(value);
    if (count) {
      map.set(value, count + 1);
    } else {
      map.set(value, 1);
    }
  }
  return map;
}

function toRecord<T extends (string | number | symbol)[]>(
  array: T
): Record<keyof T, string | null> {
  return array.reduce(
    (acc, item) => ((acc[item as keyof T] = null), acc),
    {} as Record<keyof T, string | null>
  );
}

export { createFrequencyMap, toRecord };
