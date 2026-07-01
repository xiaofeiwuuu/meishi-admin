import { requestClient } from '#/api/request';

export namespace VideoImportApi {
  export interface Task {
    id: string;
    filename: string;
    status: 'done' | 'failed' | 'pending' | 'processing';
    stage: string;
    transcript?: string;
    result?: any;
    error?: string;
    recipeId?: string;
  }
}

/** 上传视频 → 返回 taskId(大文件,超时放宽到 10 分钟) */
async function uploadVideo(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return requestClient.post<{ taskId: string }>('/admin/video-import', fd, {
    timeout: 600_000,
  });
}

/** 轮询任务状态/结果 */
async function getVideoTask(id: string) {
  return requestClient.get<VideoImportApi.Task>(`/admin/video-import/${id}`);
}

export { getVideoTask, uploadVideo };
