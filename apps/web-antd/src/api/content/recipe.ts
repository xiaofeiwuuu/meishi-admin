import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ContentRecipeApi {
  export interface Recipe {
    [key: string]: any;
    id: string;
    name: string;
    cover?: string;
    author?: string;
    categoryId?: string;
    categoryName?: string;
    source?: string;
    status: 0 | 1;
    createTime?: string;
  }
}

async function getRecipeList(params: Recordable<any>) {
  return requestClient.get<{ items: ContentRecipeApi.Recipe[]; total: number }>(
    '/admin/recipes/list',
    { params },
  );
}

async function getRecipeDetail(id: string) {
  return requestClient.get(`/admin/recipes/${id}`);
}

async function updateRecipe(id: string, data: Partial<ContentRecipeApi.Recipe>) {
  return requestClient.put(`/admin/recipes/${id}`, data);
}

async function deleteRecipe(id: string) {
  return requestClient.delete(`/admin/recipes/${id}`);
}

export { deleteRecipe, getRecipeDetail, getRecipeList, updateRecipe };
