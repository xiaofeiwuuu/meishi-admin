<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getRoleList } from '#/api/system/role';
import { createUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemUserApi.SystemUser>();
const rolesLoaded = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    // 编辑时密码留空 → 不提交,避免覆盖
    if (id.value && !values.password) {
      delete values.password;
    }
    drawerApi.lock();
    (id.value ? updateUser(id.value, values) : createUser(values as any))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    await loadRoleOptions();
    const data = drawerApi.getData<SystemUserApi.SystemUser>();
    formApi.resetForm();
    if (data && data.id) {
      formData.value = data;
      id.value = data.id;
      formApi.setValues(data);
      // 编辑:用户名不可改、密码非必填
      formApi.updateSchema([
        { fieldName: 'username', componentProps: { disabled: true } },
      ]);
    } else {
      id.value = undefined;
      // 新建:密码必填
      formApi.updateSchema([
        { fieldName: 'username', componentProps: { disabled: false } },
        { fieldName: 'password', rules: 'required' },
      ]);
    }
  },
});

async function loadRoleOptions() {
  if (rolesLoaded.value) return;
  const res: any = await getRoleList({ page: 1, pageSize: 100 });
  const options = (res.items ?? []).map((r: any) => ({
    label: r.name,
    value: r.id,
  }));
  formApi.updateSchema([{ fieldName: 'roles', componentProps: { options } }]);
  rolesLoaded.value = true;
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.user.name'))
    : $t('common.create', $t('system.user.name'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
