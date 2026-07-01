<script lang="ts" setup>
import { onUnmounted, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, message, Spin } from 'ant-design-vue';

import { getVideoTask, uploadVideo } from '#/api/content/video-import';

const emits = defineEmits(['review']);

const fileInput = ref<HTMLInputElement>();
const uploading = ref(false);
const task = ref<any>(null);
let timer: any = null;

const STAGE: Record<string, string> = {
  '': '排队中…',
  asr: '① 语音转写中…',
  frames: '② 抽取关键画面…',
  vl: '③ AI 生成菜谱中…',
  done: '完成',
};

function stopPoll() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
onUnmounted(stopPoll);

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange(open) {
    if (!open) {
      stopPoll();
      task.value = null;
      uploading.value = false;
    }
  },
});

function pick() {
  fileInput.value?.click();
}

async function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  uploading.value = true;
  task.value = null;
  try {
    const { taskId } = await uploadVideo(file);
    poll(taskId);
  } catch {
    message.error('上传失败');
    uploading.value = false;
  }
}

function poll(id: string) {
  stopPoll();
  timer = setInterval(async () => {
    try {
      const t: any = await getVideoTask(id);
      task.value = t;
      if (t.status === 'done' || t.status === 'failed') {
        stopPoll();
        uploading.value = false;
      }
    } catch {
      // 网络抖动,继续轮询
    }
  }, 3000);
}

function review() {
  emits('review', task.value.result);
  drawerApi.close();
}
</script>
<template>
  <Drawer :footer="false" class="w-[520px]" title="视频导入菜谱">
    <input
      ref="fileInput"
      accept="video/*"
      class="hidden"
      type="file"
      @change="onFilePicked"
    />
    <div class="space-y-4">
      <div class="text-sm text-gray-500">
        上传一段做菜视频,AI 自动识别语音 + 画面,生成菜谱草稿供你审核修改后发布。
      </div>
      <Button :disabled="uploading" type="primary" @click="pick">
        选择视频上传
      </Button>

      <div v-if="task || uploading" class="rounded border p-4">
        <template
          v-if="!task || task.status === 'pending' || task.status === 'processing'"
        >
          <div class="flex items-center">
            <Spin />
            <span class="ml-2">{{ STAGE[task?.stage ?? ''] ?? '处理中…' }}</span>
          </div>
          <div class="mt-1 text-xs text-gray-400">
            视频较长时约需 1-2 分钟,期间请勿关闭本弹层
          </div>
        </template>
        <template v-else-if="task.status === 'done'">
          <div class="font-medium">
            ✅ 已生成:{{ task.result?.name || '未命名' }}
          </div>
          <div class="mt-1 text-xs text-gray-500">
            {{ task.result?.ingredients?.main?.length ?? 0 }} 种食材 ·
            {{ task.result?.steps?.length ?? 0 }} 个步骤
          </div>
          <Button class="mt-3" type="primary" @click="review">
            审核并编辑
          </Button>
        </template>
        <template v-else>
          <div class="text-red-500">
            ❌ 处理失败:{{ task.error || '未知错误' }}
          </div>
        </template>
      </div>
    </div>
  </Drawer>
</template>
