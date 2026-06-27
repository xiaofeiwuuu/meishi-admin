import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ContentCategoryApi {
  export interface Category {
    [key: string]: any;
    id: string;
    name: string;
    parent?: string;
    sort: number;
    recipeCount?: number;
    createTime?: string;
  }
}

async function getCategoryList(params?: Recordable<any>) {
  return requestClient.get<{ items: ContentCategoryApi.Category[]; total: number }>(
    '/admin/categories/list',
    { params },
  );
}

async function createCategory(data: ContentCategoryApi.Category) {
  return requestClient.post('/admin/categories', data);
}

async function updateCategory(id: string, data: Partial<ContentCategoryApi.Category>) {
  return requestClient.put(`/admin/categories/${id}`, data);
}

async function deleteCategory(id: string) {
  return requestClient.delete(`/admin/categories/${id}`);
}

export { createCategory, deleteCategory, getCategoryList, updateCategory };
