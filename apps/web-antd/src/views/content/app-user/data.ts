import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AppUserApi } from '#/api/content/app-user';

const STATUS_OPTIONS = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 },
];

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    { component: 'Input', fieldName: 'keyword', label: '邮箱/昵称' },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: { allowClear: true, options: STATUS_OPTIONS },
    },
  ];
}

export function useColumns(
  _onActionClick: OnActionClickFn<AppUserApi.AppUser>,
  onStatusChange?: (newStatus: any, row: AppUserApi.AppUser) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    { field: 'email', title: '邮箱', minWidth: 200 },
    { field: 'nickname', title: '昵称', width: 140 },
    {
      cellRender: {
        options: [
          { color: 'success', label: '已验证', value: true },
          { color: 'warning', label: '未验证', value: false },
        ],
        name: 'CellTag',
      },
      field: 'emailVerified',
      title: '邮箱验证',
      width: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: '状态',
      width: 100,
    },
    { field: 'createTime', formatter: 'formatDateTime', title: '注册时间', width: 180 },
  ];
}
