<script lang="ts" setup>
import type { OnActionClickParams, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ContentCategoryApi } from '#/api/content/category';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteCategory, getCategoryList } from '#/api/content/category';

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
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) =>
          getCategoryList({ page: page.currentPage, pageSize: page.pageSize, ...formValues }),
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, export: false, refresh: { code: 'query' }, search: true, zoom: true },
  } as VxeTableGridOptions<ContentCategoryApi.Category>,
});

function onActionClick(e: OnActionClickParams<ContentCategoryApi.Category>) {
  if (e.code === 'edit') formDrawerApi.setData(e.row).open();
  if (e.code === 'delete') onDelete(e.row);
}

function onDelete(row: ContentCategoryApi.Category) {
  deleteCategory(row.id).then(() => {
    message.success(`已删除「${row.name}」`);
    gridApi.query();
  });
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="() => gridApi.query()" />
    <Grid table-title="分类管理">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['category:create'])"
          type="primary"
          @click="formDrawerApi.setData({}).open()"
        >
          <Plus class="size-5" />
          新增分类
        </Button>
      </template>
    </Grid>
  </Page>
</template>
