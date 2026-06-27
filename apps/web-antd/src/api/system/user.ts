import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: string;
    username: string;
    realName: string;
    avatar?: string;
    status: 0 | 1;
    roles: string[]; // 角色 id 数组
    password?: string;
    createTime?: string;
  }
}

/** 用户列表(分页) */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<{
    items: SystemUserApi.SystemUser[];
    total: number;
  }>('/system/user/list', { params });
}

/** 新建用户 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return requestClient.post('/system/user', data);
}

/** 更新用户(password 留空表示不改) */
async function updateUser(
  id: string,
  data: Partial<Omit<SystemUserApi.SystemUser, 'id'>>,
) {
  return requestClient.put(`/system/user/${id}`, data);
}

/** 删除用户 */
async function deleteUser(id: string) {
  return requestClient.delete(`/system/user/${id}`);
}

export { createUser, deleteUser, getUserList, updateUser };
