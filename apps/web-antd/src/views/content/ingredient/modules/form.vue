<script lang="ts" setup>
import type { ContentIngredientApi } from '#/api/content/ingredient';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createIngredient, updateIngredient } from '#/api/content/ingredient';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);
const formData = ref<ContentIngredientApi.Ingredient>();

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
      ? updateIngredient(id.value, values)
      : createIngredient(values);
    action
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => drawerApi.unlock());
  },
  onOpenChange(open) {
    if (!open) return;
    const data = drawerApi.getData<ContentIngredientApi.Ingredient>();
    formApi.resetForm();
    if (data?.id) {
      formData.value = data;
      id.value = data.id;
      formApi.setValues(data);
    } else {
      formData.value = undefined;
      id.value = undefined;
    }
  },
});

const title = computed(() => (formData.value?.id ? '编辑食材' : '新增食材'));
</script>
<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
