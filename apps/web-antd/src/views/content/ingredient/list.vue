<script lang="ts" setup>
import type { OnActionClickParams, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ContentIngredientApi } from '#/api/content/ingredient';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteIngredient,
  getIngredientList,
  updateIngredient,
} from '#/api/content/ingredient';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: useGridFormSchema(), submitOnChange: true },
  gridOptions: {
    columns: useColumns(
      onActionClick,
      hasAccessByCodes(['ingredient:edit']) ? onVisibleChange : undefined,
    ),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) =>
          getIngredientList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, export: false, refresh: { code: 'query' }, search: true, zoom: true },
  } as VxeTableGridOptions<ContentIngredientApi.Ingredient>,
});

function onActionClick(e: OnActionClickParams<ContentIngredientApi.Ingredient>) {
  if (e.code === 'edit') formDrawerApi.setData(e.row).open();
  if (e.code === 'delete') onDelete(e.row);
}

async function onVisibleChange(
  newHidden: boolean,
  row: ContentIngredientApi.Ingredient,
) {
  await updateIngredient(row.id, { hidden: newHidden });
  message.success(newHidden ? `已隐藏「${row.name}」` : `已显示「${row.name}」`);
  return true;
}

function onDelete(row: ContentIngredientApi.Ingredient) {
  deleteIngredient(row.id).then(() => {
    message.success(`已删除「${row.name}」`);
    gridApi.query();
  });
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="() => gridApi.query()" />
    <Grid table-title="食材管理">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['ingredient:create'])"
          type="primary"
          @click="formDrawerApi.setData({}).open()"
        >
          <Plus class="size-5" />
          新增食材
        </Button>
      </template>
    </Grid>
  </Page>
</template>
