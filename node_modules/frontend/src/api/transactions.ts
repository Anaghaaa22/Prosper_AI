/**
 * Transactions API - List, upload CSV
 */

import api from './client';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: string;
}

export const transactionsApi = {
  list: (startDate?: string, endDate?: string) =>
    api.get<{ transactions: Transaction[] }>('/transactions', {
      params: { startDate, endDate },
    }),

  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ message: string; total: number; inserted: number }>(
      '/transactions/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};
