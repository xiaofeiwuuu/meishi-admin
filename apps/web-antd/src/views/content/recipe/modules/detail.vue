<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Divider, Image, Tag } from 'ant-design-vue';

import { getRecipeDetail } from '#/api/content/recipe';

interface RecipeDetail {
  id: string;
  name: string;
  author: string;
  description: string;
  cover: string;
  tips: string;
  status: number;
  source: string;
  categoryId?: string;
  ingredients: { main: { name: string; amount: string }[]; sub: { name: string; amount: string }[] };
  steps: { step: number; desc: string; img: string }[];
}

const detail = ref<RecipeDetail>();

const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  async onOpenChange(open) {
    if (!open) {
      detail.value = undefined;
      return;
    }
    const row = drawerApi.getData<{ id: string }>();
    if (!row?.id) return;
    detail.value = (await getRecipeDetail(row.id)) as unknown as RecipeDetail;
  },
});
</script>
<template>
  <Drawer :title="detail?.name || '菜谱详情'" class="w-[600px]">
    <div v-if="detail" class="space-y-4">
      <Image v-if="detail.cover" :src="detail.cover" class="max-h-60 rounded" />
      <div class="text-sm text-gray-500">
        作者:{{ detail.author || '—' }}
        <Tag class="ml-2">{{ detail.status === 1 ? '上架' : '下架' }}</Tag>
      </div>
      <p v-if="detail.description">{{ detail.description }}</p>

      <Divider orientation="left">食材</Divider>
      <div class="flex flex-wrap gap-2">
        <Tag v-for="(i, idx) in detail.ingredients.main" :key="`m${idx}`" color="orange">
          {{ i.name }} {{ i.amount }}
        </Tag>
        <Tag v-for="(i, idx) in detail.ingredients.sub" :key="`s${idx}`">
          {{ i.name }} {{ i.amount }}
        </Tag>
      </div>

      <Divider orientation="left">步骤</Divider>
      <div v-for="s in detail.steps" :key="s.step" class="flex gap-3">
        <div class="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
          {{ s.step }}
        </div>
        <div class="flex-auto space-y-2">
          <p class="text-sm">{{ s.desc }}</p>
          <Image v-if="s.img" :src="s.img" class="max-h-40 rounded" />
        </div>
      </div>

      <template v-if="detail.tips">
        <Divider orientation="left">小贴士</Divider>
        <p class="whitespace-pre-line text-sm text-gray-600">{{ detail.tips }}</p>
      </template>
    </div>
  </Drawer>
</template>
