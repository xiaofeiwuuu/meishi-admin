import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ContentRecipeApi } from '#/api/content/recipe';

import { useAccess } from '@vben/access';

import { getCategoryList } from '#/api/content/category';

const STATUS_OPTIONS = [
  { label: '上架', value: 1 },
  { label: '下架', value: 0 },
];

/** 编辑表单(基本字段;名称/分类/状态/描述/小贴士) */
export function useFormSchema(): VbenFormSchema[] {
  return [
    { component: 'Input', fieldName: 'name', label: '菜名', rules: 'required' },
    {
      component: 'ApiSelect',
      fieldName: 'categoryId',
      label: '分类',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        api: getCategoryList,
        resultField: 'items',
        labelField: 'name',
        valueField: 'id',
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: '状态',
      componentProps: { buttonStyle: 'solid', optionType: 'button', options: STATUS_OPTIONS },
      defaultValue: 1,
    },
    { component: 'Textarea', fieldName: 'description', label: '描述' },
    { component: 'Textarea', fieldName: 'tips', label: '小贴士' },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    { component: 'Input', fieldName: 'keyword', label: '菜名' },
    {
      component: 'ApiSelect',
      fieldName: 'category',
      label: '分类',
      componentProps: {
        allowClear: true,
        api: getCategoryList,
        resultField: 'items',
        labelField: 'name',
        valueField: 'id',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: { allowClear: true, options: STATUS_OPTIONS },
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<ContentRecipeApi.Recipe>,
  onStatusChange?: (newStatus: any, row: ContentRecipeApi.Recipe) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  const { hasAccessByCodes } = useAccess();
  return [
    { cellRender: { name: 'CellImage' }, field: 'cover', title: '封面', width: 80 },
    { field: 'name', title: '菜名', minWidth: 160 },
    { field: 'categoryName', title: '分类', width: 100 },
    { field: 'author', title: '作者', width: 120 },
    {
      cellRender: {
        options: [
          { color: 'processing', label: '爬虫', value: 'crawled' },
          { color: 'success', label: 'AI', value: 'ai' },
          { color: 'default', label: '手动', value: 'manual' },
        ],
        name: 'CellTag',
      },
      field: 'source',
      title: '来源',
      width: 90,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: '上架',
      width: 90,
    },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间', width: 170 },
    {
      align: 'center',
      cellRender: {
        attrs: { nameField: 'name', nameTitle: '菜谱', onClick: onActionClick },
        name: 'CellOperation',
        options: [
          { code: 'edit', text: '编辑', show: hasAccessByCodes(['recipe:edit']) },
          { code: 'delete', show: hasAccessByCodes(['recipe:delete']) },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 130,
    },
  ];
}
