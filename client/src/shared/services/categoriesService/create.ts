import { httpClient } from '../httpClient';

export interface CreateCategoryParams {
  name: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
}

export async function create(categoryData: CreateCategoryParams) {
  const { data } = await httpClient.post('/categories', categoryData);

  return data;
}
