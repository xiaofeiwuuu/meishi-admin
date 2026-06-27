import { requestClient } from '#/api/request';

export interface StatsOverview {
  recipeCount: number;
  categoryCount: number;
  appUserCount: number;
  recipesByCategory: Array<{ name: string; count: number }>;
}

export async function getStatsOverview() {
  return requestClient.get<StatsOverview>('/admin/stats/overview');
}
