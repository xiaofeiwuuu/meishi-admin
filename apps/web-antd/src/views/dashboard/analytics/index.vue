<script lang="ts" setup>
import type { StatsOverview } from '#/api/content/stats';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Card, Col, Progress, Row, Statistic } from 'ant-design-vue';

import { getStatsOverview } from '#/api/content/stats';

const data = ref<StatsOverview>();

const cards = computed(() => [
  { title: '菜谱总数', value: data.value?.recipeCount ?? 0, color: '#ff9f43' },
  { title: '分类数', value: data.value?.categoryCount ?? 0, color: '#54a0ff' },
  { title: 'App 注册用户', value: data.value?.appUserCount ?? 0, color: '#5f27cd' },
]);

const maxCount = computed(() =>
  Math.max(1, ...(data.value?.recipesByCategory ?? []).map((c) => c.count)),
);

onMounted(async () => {
  data.value = (await getStatsOverview()) as unknown as StatsOverview;
});
</script>
<template>
  <Page title="数据概览">
    <Row :gutter="16">
      <Col v-for="c in cards" :key="c.title" :span="8">
        <Card>
          <Statistic :title="c.title" :value="c.value" :value-style="{ color: c.color }" />
        </Card>
      </Col>
    </Row>

    <Card class="mt-4" title="各分类菜谱分布">
      <div
        v-for="c in data?.recipesByCategory ?? []"
        :key="c.name"
        class="mb-3 flex items-center gap-3"
      >
        <span class="w-20 flex-shrink-0 text-sm">{{ c.name }}</span>
        <Progress
          :percent="Math.round((c.count / maxCount) * 100)"
          :format="() => `${c.count}`"
          class="flex-auto"
        />
      </div>
    </Card>
  </Page>
</template>
