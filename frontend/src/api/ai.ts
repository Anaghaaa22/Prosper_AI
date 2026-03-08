/**
 * AI API - Financial advice, savings, budget suggestions
 */

import api from './client';

export const aiApi = {
  advice: (year?: number, month?: number) =>
    api.post<{ advice: string }>('/ai/advice', { year, month }),

  savings: (year?: number, month?: number) =>
    api.post<{ recommendations: string }>('/ai/savings', { year, month }),

  budget: (year?: number, month?: number) =>
    api.post<{ suggestions: string }>('/ai/budget', { year, month }),
};
