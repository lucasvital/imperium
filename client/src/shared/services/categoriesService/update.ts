import { httpClient } from '../httpClient';

export interface EditCategoryParams {
  id: string;
  name: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
}

export async function update(params: EditCategoryParams) {
  const { id, ...categoryData } = params;

  const { data } = await httpClient.patch(`/categories/${id}`, categoryData);

  return data;
}
