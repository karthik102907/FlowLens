import {
  Dataset,
  DataQualityCheck,
  DataCleaningOptions,
  DataCleaningResult,
  AnalysisHistoryItem,
  AnalyticsBundle,
  SimulationResult,
  AIChatResponse,
  NotificationItem,
} from '../types';

// Dynamic production vs development API endpoint resolver
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In development Vite dev server mode (port 5173), route to local FastAPI backend
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return 'http://127.0.0.1:8000/api';
  }
  // In production unified deployment, route to same-origin /api
  return '/api';
};

const API_BASE = getApiBaseUrl();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (arg1: any, password?: string, full_name?: string, role?: string) => {
    const payload = typeof arg1 === 'object'
      ? arg1
      : { email: arg1, password, full_name, role: role || 'Process Analyst' };

    return request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async () => {
    return request<any>('/auth/me');
  },

  // Datasets
  getDatasets: async (): Promise<Dataset[]> => {
    return request<Dataset[]>('/datasets');
  },

  getDataset: async (id: string): Promise<Dataset> => {
    return request<Dataset>(`/datasets/${id}`);
  },

  getDatasetPreview: async (id: string, limit: number = 25) => {
    return request<any>(`/datasets/${id}/preview?limit=${limit}`);
  },

  uploadDataset: async (
    file: File,
    name?: string,
    processType?: string
  ): Promise<{ dataset: Dataset; quality: DataQualityCheck; analytics: AnalyticsBundle }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (processType) formData.append('process_type', processType);

    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let err = 'Failed to upload dataset';
      try {
        const json = await res.json();
        if (json.detail) err = json.detail;
      } catch (_) {}
      throw new Error(err);
    }
    return res.json();
  },

  loadDemoDataset: async (
    demoType: string
  ): Promise<{ dataset: Dataset; quality: DataQualityCheck; analytics: AnalyticsBundle }> => {
    return request<{ dataset: Dataset; quality: DataQualityCheck; analytics: AnalyticsBundle }>(
      `/datasets/demo/${demoType}`,
      { method: 'POST' }
    );
  },

  mapColumns: async (datasetId: string, mapping: Record<string, string>) => {
    return request<any>(`/datasets/${datasetId}/map-columns`, {
      method: 'POST',
      body: JSON.stringify(mapping),
    });
  },

  cleanDataset: async (datasetId: string, options: DataCleaningOptions): Promise<DataCleaningResult> => {
    return request<DataCleaningResult>(`/datasets/${datasetId}/clean`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  // Analyses Execution & History
  runAnalysis: async (
    datasetId: string,
    columnMapping?: Record<string, string>,
    cleaningOptions?: DataCleaningOptions,
    weights?: Record<string, number>
  ): Promise<{ analysis_id: string; analytics: AnalyticsBundle }> => {
    return request<{ analysis_id: string; analytics: AnalyticsBundle }>('/analyses/run', {
      method: 'POST',
      body: JSON.stringify({
        dataset_id: datasetId,
        column_mapping: columnMapping,
        cleaning_options: cleaningOptions,
        weights,
      }),
    });
  },

  getAnalyses: async (): Promise<AnalysisHistoryItem[]> => {
    return request<AnalysisHistoryItem[]>('/analyses');
  },

  getAnalysisById: async (analysisId: string): Promise<AnalyticsBundle> => {
    return request<AnalyticsBundle>(`/analyses/${analysisId}`);
  },

  // Analytics & Recalculate
  getAnalytics: async (datasetId: string): Promise<AnalyticsBundle> => {
    return request<AnalyticsBundle>(`/process/${datasetId}/all`);
  },

  getAllAnalytics: async (datasetId: string): Promise<AnalyticsBundle> => {
    return request<AnalyticsBundle>(`/process/${datasetId}/all`);
  },

  recalculateWeights: async (
    datasetId: string,
    weights: {
      duration_weight: number;
      waiting_weight: number;
      volume_weight: number;
      rework_weight: number;
      sla_weight: number;
      variability_weight: number;
    }
  ): Promise<AnalyticsBundle> => {
    return request<AnalyticsBundle>(`/process/${datasetId}/recalculate`, {
      method: 'POST',
      body: JSON.stringify(weights),
    });
  },

  recalculateBottlenecks: async (
    datasetId: string,
    weights: {
      duration_weight: number;
      waiting_weight: number;
      volume_weight: number;
      rework_weight: number;
      sla_weight: number;
      variability_weight: number;
    }
  ): Promise<AnalyticsBundle> => {
    return request<AnalyticsBundle>(`/process/${datasetId}/recalculate`, {
      method: 'POST',
      body: JSON.stringify(weights),
    });
  },

  // Simulation
  runSimulation: async (scenario: {
    dataset_id: string;
    stage_adjustments: Record<string, number>;
    staffing_increase_pct: number;
    sla_target_change_pct: number;
    rework_reduction_pct: number;
  }): Promise<SimulationResult> => {
    return request<SimulationResult>('/simulation/run', {
      method: 'POST',
      body: JSON.stringify(scenario),
    });
  },

  // AI Analyst
  askAI: async (datasetId: string, question: string): Promise<AIChatResponse> => {
    return request<AIChatResponse>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ dataset_id: datasetId, question }),
    });
  },

  askAIAnalyst: async (
    datasetId: string,
    question: string,
    contextFilters?: Record<string, any>
  ): Promise<AIChatResponse> => {
    return request<AIChatResponse>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ dataset_id: datasetId, question, context_filters: contextFilters }),
    });
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    return request<NotificationItem[]>('/notifications');
  },

  markNotificationRead: async (id: string) => {
    return request<any>(`/notifications/${id}/read`, { method: 'POST' });
  },

  getOrganization: async () => {
    return request<any>('/organization');
  },
};
