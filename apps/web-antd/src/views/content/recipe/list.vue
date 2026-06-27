<script lang="ts" setup>
import type { OnActionClickParams, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ContentRecipeApi } from '#/api/content/recipe';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRecipe, getRecipeList, updateRecipe } from '#/api/content/recipe';

import { useColumns, useGridFormSchema } from './data';
import Detail from './modules/detail.vue';
import Form from './modules/form.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: useGridFormSchema(), submitOnChange: true },
  gridOptions: {
    columns: useColumns(
      onActionClick,
      hasAccessByCodes(['recipe:edit']) ? onStatusChange : undefined,
    ),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) =>
          getRecipeList({ page: page.currentPage, pageSize: page.pageSize, ...formValues }),
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, export: false, refresh: { code: 'query' }, search: true, zoom: true },
  } as VxeTableGridOptions<ContentRecipeApi.Recipe>,
});

function onActionClick(e: OnActionClickParams<ContentRecipeApi.Recipe>) {
  if (e.code === 'detail') detailDrawerApi.setData(e.row).open();
  if (e.code === 'edit') formDrawerApi.setData(e.row).open();
  if (e.code === 'delete') onDelete(e.row);
}

async function onStatusChange(newStatus: number, row: ContentRecipeApi.Recipe) {
  const text = newStatus === 1 ? '上架' : '下架';
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      content: `确定${text}「${row.name}」吗？`,
      title: '切换状态',
      onOk: async () => {
        await updateRecipe(row.id, { status: newStatus as 0 | 1 });
        resolve(true);
      },
      onCancel: () => resolve(false),
    });
  });
}

function onDelete(row: ContentRecipeApi.Recipe) {
  deleteRecipe(row.id).then(() => {
    message.success(`已删除「${row.name}」`);
    gridApi.query();
  });
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="() => gridApi.query()" />
    <DetailDrawer />
    <Grid table-title="菜谱管理" />
  </Page>
</template>
