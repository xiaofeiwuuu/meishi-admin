import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ContentIngredientApi } from '#/api/content/ingredient';

import { useAccess } from '@vben/access';

/** 新增/编辑表单 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '食材名称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'category',
      label: '分类',
      componentProps: { placeholder: '如 蔬菜、肉类、水产' },
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

/** 顶部搜索 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    { component: 'Input', fieldName: 'keyword', label: '食材名称' },
    { component: 'Input', fieldName: 'category', label: '分类' },
    {
      component: 'Select',
      fieldName: 'hidden',
      label: '状态',
      componentProps: {
        allowClear: true,
        options: [
          { label: '显示中', value: '0' },
          { label: '已隐藏', value: '1' },
        ],
        placeholder: '全部',
      },
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<ContentIngredientApi.Ingredient>,
  onVisibleChange?: (
    newHidden: boolean,
    row: ContentIngredientApi.Ingredient,
  ) => Promise<boolean>,
): VxeTableGridOptions['columns'] {
  const { hasAccessByCodes } = useAccess();
  return [
    { field: 'name', title: '食材名称', minWidth: 160 },
    { field: 'category', title: '分类', minWidth: 160 },
    {
      cellRender: {
        attrs: { beforeChange: onVisibleChange },
        name: onVisibleChange ? 'CellSwitch' : 'CellTag',
        props: {
          checkedChildren: '显示',
          checkedValue: false,
          unCheckedChildren: '隐藏',
          unCheckedValue: true,
        },
      },
      field: 'hidden',
      title: '状态',
      width: 120,
    },
    { field: 'sort', title: '排序', width: 90 },
    {
      align: 'center',
      cellRender: {
        attrs: { nameField: 'name', nameTitle: '食材', onClick: onActionClick },
        name: 'CellOperation',
        options: [
          { code: 'edit', show: hasAccessByCodes(['ingredient:edit']) },
          { code: 'delete', show: hasAccessByCodes(['ingredient:delete']) },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 130,
    },
  ];
}
