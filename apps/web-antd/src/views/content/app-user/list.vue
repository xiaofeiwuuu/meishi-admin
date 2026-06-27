<script lang="ts" setup>
import type { OnActionClickParams, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AppUserApi } from '#/api/content/app-user';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAppUserList, updateAppUserStatus } from '#/api/content/app-user';

import { useColumns, useGridFormSchema } from './data';

const { hasAccessByCodes } = useAccess();

const [Grid] = useVbenVxeGrid({
  formOptions: { schema: useGridFormSchema(), submitOnChange: true },
  gridOptions: {
    columns: useColumns(
      onActionClick,
      hasAccessByCodes(['appuser:edit']) ? onStatusChange : undefined,
    ),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) =>
          getAppUserList({ page: page.currentPage, pageSize: page.pageSize, ...formValues }),
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, export: false, refresh: { code: 'query' }, search: true, zoom: true },
  } as VxeTableGridOptions<AppUserApi.AppUser>,
});

function onActionClick(_e: OnActionClickParams<AppUserApi.AppUser>) {}

async function onStatusChange(newStatus: number, row: AppUserApi.AppUser) {
  const text = newStatus === 1 ? '解封' : '封禁';
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      content: `确定${text}用户「${row.email}」吗？`,
      title: '切换状态',
      onOk: async () => {
        await updateAppUserStatus(row.id, newStatus as 0 | 1);
        resolve(true);
      },
      onCancel: () => resolve(false),
    });
  });
}
</script>
<template>
  <Page auto-content-height>
    <Grid table-title="App 用户" />
  </Page>
</template>
