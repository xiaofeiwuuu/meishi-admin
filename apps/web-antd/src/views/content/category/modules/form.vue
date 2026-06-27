<script lang="ts" setup>
import type { ContentCategoryApi } from '#/api/content/category';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createCategory, updateCategory } from '#/api/content/category';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);
const formData = ref<ContentCategoryApi.Category>();
const isEdit = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    const action = id.value
      ? updateCategory(id.value, values)
      : createCategory(values as any);
    action
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => drawerApi.unlock());
  },
  onOpenChange(open) {
    if (!open) return;
    const data = drawerApi.getData<ContentCategoryApi.Category>();
    isEdit.value = !!data?.id;
    formApi.setState({ schema: useFormSchema(isEdit.value) });
    formApi.resetForm();
    if (data?.id) {
      formData.value = data;
      id.value = data.id;
      formApi.setValues(data);
    } else {
      id.value = undefined;
    }
  },
});

const title = computed(() => (formData.value?.id ? '编辑分类' : '新增分类'));
</script>
<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
