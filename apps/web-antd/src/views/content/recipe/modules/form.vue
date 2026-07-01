<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Button,
  Divider,
  Image,
  Input,
  message,
  RadioGroup,
  Select,
  Textarea,
} from 'ant-design-vue';

import { getCategoryList } from '#/api/content/category';
import {
  createRecipe,
  getRecipeDetail,
  updateRecipe,
  uploadRecipeImage,
} from '#/api/content/recipe';

const emits = defineEmits(['success']);

interface Ing {
  name: string;
  amount: string;
}
interface Step {
  desc: string;
  img: string;
}

const id = ref<string>();
const catOptions = ref<{ label: string; value: string }[]>([]);
const fileInput = ref<HTMLInputElement>();
const uploadTarget = ref<{ index: number; type: 'cover' | 'step' }>();

const form = reactive({
  name: '',
  categoryId: undefined as string | undefined,
  status: 1,
  cover: '',
  description: '',
  tips: '',
  main: [] as Ing[],
  sub: [] as Ing[],
  steps: [] as Step[],
});

function reset() {
  form.name = '';
  form.categoryId = undefined;
  form.status = 1;
  form.cover = '';
  form.description = '';
  form.tips = '';
  form.main = [];
  form.sub = [];
  form.steps = [];
}

async function loadCategories() {
  if (catOptions.value.length) return;
  const res: any = await getCategoryList({ page: 1, pageSize: 100 });
  catOptions.value = (res.items ?? []).map((c: any) => ({ label: c.name, value: c.id }));
}

const title = computed(() => (id.value ? '编辑菜谱' : '新增菜谱'));

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (!form.name.trim()) {
      message.warning('请填写菜名');
      return;
    }
    drawerApi.lock();
    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId ?? null,
      status: form.status,
      cover: form.cover,
      description: form.description,
      tips: form.tips,
      ingredients: {
        main: form.main.filter((i) => i.name.trim()),
        sub: form.sub.filter((i) => i.name.trim()),
      },
      steps: form.steps
        .filter((s) => s.desc.trim() || s.img)
        .map((s, i) => ({ step: i + 1, desc: s.desc, img: s.img })),
    };
    const action = id.value
      ? updateRecipe(id.value, payload)
      : createRecipe(payload);
    action
      .then(() => {
        message.success('已保存');
        emits('success');
        drawerApi.close();
      })
      .catch(() => drawerApi.unlock());
  },
  async onOpenChange(open) {
    if (!open) return;
    reset();
    await loadCategories();
    const row = drawerApi.getData<{ id?: string }>();
    if (row?.id) {
      id.value = row.id;
      const d: any = await getRecipeDetail(row.id);
      form.name = d.name ?? '';
      form.categoryId = d.categoryId ?? undefined;
      form.status = d.status ?? 1;
      form.cover = d.cover ?? '';
      form.description = d.description ?? '';
      form.tips = d.tips ?? '';
      form.main = (d.ingredients?.main ?? []).map((i: any) => ({ ...i }));
      form.sub = (d.ingredients?.sub ?? []).map((i: any) => ({ ...i }));
      form.steps = (d.steps ?? []).map((s: any) => ({ desc: s.desc ?? '', img: s.img ?? '' }));
    } else {
      id.value = undefined;
    }
  },
});

function pickImage(target: { index: number; type: 'cover' | 'step' }) {
  uploadTarget.value = target;
  fileInput.value?.click();
}

async function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file || !uploadTarget.value) return;
  try {
    const res: any = await uploadRecipeImage(file);
    if (uploadTarget.value.type === 'cover') form.cover = res.url;
    else form.steps[uploadTarget.value.index]!.img = res.url;
  } catch {
    message.error('上传失败');
  }
}
</script>
<template>
  <Drawer :title="title" class="w-[640px]">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFilePicked"
    />
    <div class="space-y-4">
      <!-- 封面 -->
      <div>
        <div class="mb-1 text-sm">封面</div>
        <div
          class="flex h-28 w-28 cursor-pointer items-center justify-center rounded border border-dashed"
          @click="pickImage({ type: 'cover', index: 0 })"
        >
          <Image
            v-if="form.cover"
            :src="form.cover"
            :preview="false"
            class="h-28 w-28 rounded object-cover"
          />
          <span v-else class="text-gray-400">+ 上传</span>
        </div>
      </div>

      <div>
        <div class="mb-1 text-sm">菜名 *</div>
        <Input v-model:value="form.name" placeholder="菜名" />
      </div>
      <div class="flex gap-4">
        <div class="flex-1">
          <div class="mb-1 text-sm">分类</div>
          <Select
            v-model:value="form.categoryId"
            :options="catOptions"
            allow-clear
            class="w-full"
            placeholder="选择分类"
          />
        </div>
        <div>
          <div class="mb-1 text-sm">状态</div>
          <RadioGroup
            v-model:value="form.status"
            button-style="solid"
            option-type="button"
            :options="[
              { label: '上架', value: 1 },
              { label: '下架', value: 0 },
            ]"
          />
        </div>
      </div>

      <!-- 主料 -->
      <Divider orientation="left">主料</Divider>
      <div v-for="(ing, idx) in form.main" :key="`m${idx}`" class="mb-2 flex gap-2">
        <Input v-model:value="ing.name" placeholder="食材" class="flex-1" />
        <Input v-model:value="ing.amount" placeholder="用量" class="w-28" />
        <Button danger @click="form.main.splice(idx, 1)">删</Button>
      </div>
      <Button block dashed @click="form.main.push({ name: '', amount: '' })">
        + 添加主料
      </Button>

      <!-- 辅料 -->
      <Divider orientation="left">辅料</Divider>
      <div v-for="(ing, idx) in form.sub" :key="`s${idx}`" class="mb-2 flex gap-2">
        <Input v-model:value="ing.name" placeholder="食材" class="flex-1" />
        <Input v-model:value="ing.amount" placeholder="用量" class="w-28" />
        <Button danger @click="form.sub.splice(idx, 1)">删</Button>
      </div>
      <Button block dashed @click="form.sub.push({ name: '', amount: '' })">
        + 添加辅料
      </Button>

      <!-- 步骤 -->
      <Divider orientation="left">步骤</Divider>
      <div v-for="(step, idx) in form.steps" :key="`st${idx}`" class="mb-3 flex gap-2">
        <div class="pt-2 text-sm text-gray-400">{{ idx + 1 }}</div>
        <div class="flex-1">
          <Textarea v-model:value="step.desc" :rows="2" placeholder="这一步做什么" />
        </div>
        <div
          class="flex h-16 w-16 flex-shrink-0 cursor-pointer items-center justify-center rounded border border-dashed"
          @click="pickImage({ type: 'step', index: idx })"
        >
          <Image
            v-if="step.img"
            :src="step.img"
            :preview="false"
            class="h-16 w-16 rounded object-cover"
          />
          <span v-else class="text-xs text-gray-400">图</span>
        </div>
        <Button danger @click="form.steps.splice(idx, 1)">删</Button>
      </div>
      <Button block dashed @click="form.steps.push({ desc: '', img: '' })">
        + 添加步骤
      </Button>
    </div>
  </Drawer>
</template>
