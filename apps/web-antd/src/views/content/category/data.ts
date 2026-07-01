import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ContentCategoryApi } from '#/api/content/category';

import { useAccess } from '@vben/access';

/** 新建/编辑表单(isEdit 时 id 不可改) */
export function useFormSchema(isEdit = false): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: '分类标识',
      componentProps: { disabled: isEdit, placeholder: '英文 slug,如 recai' },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '分类名称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'parent',
      label: '上级分类',
      componentProps: { placeholder: '可空,如 常见菜式' },
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: '排序',
      defaultValue: 0,
      componentProps: { class: 'w-full' },
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [{ component: 'Input', fieldName: 'name', label: '分类名称' }];
}

export function useColumns(
  onActionClick: OnActionClickFn<ContentCategoryApi.Category>,
): VxeTableGridOptions['columns'] {
  const { hasAccessByCodes } = useAccess();
  return [
    { field: 'name', title: '分类名称', minWidth: 160 },
    { field: 'id', title: '标识', minWidth: 160 },
    { field: 'parent', title: '上级分类', minWidth: 140 },
    { field: 'recipeCount', title: '菜谱数', width: 100 },
    { field: 'sort', title: '排序', width: 80 },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间', minWidth: 200 },
    {
      align: 'center',
      cellRender: {
        attrs: { nameField: 'name', nameTitle: '分类', onClick: onActionClick },
        name: 'CellOperation',
        options: [
          { code: 'edit', show: hasAccessByCodes(['category:edit']) },
          { code: 'delete', show: hasAccessByCodes(['category:delete']) },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 130,
    },
  ];
}
