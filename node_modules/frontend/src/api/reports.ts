/**
 * Reports API - Monthly summary, financial overview
 */

import api from './client';

export interface MonthlySummary {
  totalExpenses: number;
  totalIncome: number;
  transactionCount: number;
  byCategory: { category: string; total: number }[];
}

export const reportsApi = {
  monthly: (year: number, month: number) =>
    api.get<MonthlySummary>('/reports/monthly', { params: { year, month } }),

  summary: () => api.get<MonthlySummary>('/reports/summary'),
};
