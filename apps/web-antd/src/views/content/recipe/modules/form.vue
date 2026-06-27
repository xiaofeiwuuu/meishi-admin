<script lang="ts" setup>
import type { ContentRecipeApi } from '#/api/content/recipe';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getRecipeDetail, updateRecipe } from '#/api/content/recipe';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);
const id = ref<string>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    updateRecipe(id.value!, values)
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => drawerApi.unlock());
  },
  async onOpenChange(open) {
    if (!open) return;
    const row = drawerApi.getData<ContentRecipeApi.Recipe>();
    formApi.resetForm();
    if (!row?.id) return;
    id.value = row.id;
    // 列表行没有 description/tips,拉详情补全
    const detail: any = await getRecipeDetail(row.id);
    formApi.setValues({
      name: detail.name,
      categoryId: detail.categoryId,
      status: detail.status,
      description: detail.description,
      tips: detail.tips,
    });
  },
});
</script>
<template>
  <Drawer title="编辑菜谱">
    <Form />
  </Drawer>
</template>
