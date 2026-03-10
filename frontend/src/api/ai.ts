/**
 * AI API - Financial advice, savings, budget suggestions, combined insights
 */

import api from './client';

export interface AiInsightsResponse {
  summary: string;
  recommendations: string[];
}

export const aiApi = {
  advice: (year?: number, month?: number) =>
    api.post<{ advice: string }>('/ai/advice', { year, month }),

  savings: (year?: number, month?: number) =>
    api.post<{ recommendations: string }>('/ai/savings', { year, month }),

  // New REST-style endpoint for budget suggestions
  budget: () => api.get<{ suggestions: string }>('/budget-suggestions'),

  insights: () => api.post<AiInsightsResponse>('/ai-insights', {}),
};

