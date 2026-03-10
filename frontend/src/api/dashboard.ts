/**
 * Dashboard API - summary, categories, trends
 */

import api from './client';

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}

export interface CategoryStat {
  category: string;
  totalAmount: number;
}

export interface TrendPoint {
  month: string;
  totalExpenses: number;
}

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/dashboard/summary'),
  categories: () => api.get<{ categories: CategoryStat[] }>('/dashboard/categories'),
  trends: () => api.get<{ trends: TrendPoint[] }>('/dashboard/trends'),
};

