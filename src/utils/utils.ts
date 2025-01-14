import { SelectQueryBuilder } from 'typeorm';

export function applyFilters<T>(
  queryBuilder: SelectQueryBuilder<T>,
  filters: { [key: string]: any },
): void {
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryBuilder.andWhere(key, value);
    }
  });
}
