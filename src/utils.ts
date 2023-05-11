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

function toObject<T = any>(cols: T[], keys: string[]) {
  return keys.reduce((acc, curr, index) => {
    acc[curr] = cols[index];
    return acc;
  }, {} as Record<string, T>);
}

export { createFrequencyMap, toObject };
