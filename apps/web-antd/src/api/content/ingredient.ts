import { requestClient } from '#/api/request';

export namespace ContentIngredientApi {
  export interface Ingredient {
    id: string;
    name: string;
    category: string;
    hidden: boolean;
    sort: number;
  }
}

async function getIngredientList(params: Record<string, any>) {
  return requestClient.get('/admin/ingredients/list', { params });
}

async function getIngredientCategories() {
  return requestClient.get<string[]>('/admin/ingredients/categories');
}

async function createIngredient(data: Record<string, any>) {
  return requestClient.post('/admin/ingredients', data);
}

async function updateIngredient(id: string, data: Record<string, any>) {
  return requestClient.put(`/admin/ingredients/${id}`, data);
}

async function deleteIngredient(id: string) {
  return requestClient.delete(`/admin/ingredients/${id}`);
}

export {
  createIngredient,
  deleteIngredient,
  getIngredientCategories,
  getIngredientList,
  updateIngredient,
};
