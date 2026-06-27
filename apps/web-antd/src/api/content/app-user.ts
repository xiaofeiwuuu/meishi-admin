import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace AppUserApi {
  export interface AppUser {
    [key: string]: any;
    id: string;
    email: string;
    nickname: string;
    avatar?: string;
    emailVerified: boolean;
    status: 0 | 1;
    createTime?: string;
  }
}

async function getAppUserList(params: Recordable<any>) {
  return requestClient.get<{ items: AppUserApi.AppUser[]; total: number }>(
    '/admin/app-users/list',
    { params },
  );
}

async function updateAppUserStatus(id: string, status: 0 | 1) {
  return requestClient.put(`/admin/app-users/${id}`, { status });
}

export { getAppUserList, updateAppUserStatus };
