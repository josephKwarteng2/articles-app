import { User } from 'src/model/user.entity';
import { SelectQueryBuilder } from 'typeorm';

export function applyFilters<T>(
  queryBuilder: SelectQueryBuilder<T>,
  filters: { [key: string]: string | number | boolean },
): void {
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryBuilder.andWhere(`${key} = :${key}`, { [key]: value });
    }
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
export interface ApiResponse<T> {
  data: T;
}

export interface UserResponse {
  user: User;
}
