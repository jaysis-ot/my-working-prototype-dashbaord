// src/shared/utils/helpers/arrayHelpers.ts
export const arrayHelpers = {
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = (groups[item[key] as string] = groups[item[key] as string] || []);
      group.push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  unique: <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
  },

  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
};