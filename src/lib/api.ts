const API_BASE = import.meta.env['VITE_API_URL'] || 'http://localhost:5000';

// Token management
let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('polaris_token') : null;

export function setToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('polaris_token', token);
    else localStorage.removeItem('polaris_token');
  }
}

export function getToken() {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>('/api/auth/me'),
  register: (data: { email: string; password: string; name: string; role: string }) =>
    request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Items
export const items = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ items: Item[]; total: number; page: number; totalPages: number }>(`/api/items${qs}`);
  },
  get: (id: number) => request<Item & { tags: string[]; related: Item[] }>(`/api/items/${id}`),
};

// Search
export const search = {
  query: (q: string, mode = 'keyword', page = 1) =>
    request<{ items: Item[]; total: number }>(`/api/search?q=${encodeURIComponent(q)}&mode=${mode}&page=${page}`),
};

// Stats
export const stats = {
  get: () => request<Stats>('/api/stats'),
  facets: () => request<Facets>('/api/stats/facets'),
};

// Pulse
export const pulse = {
  get: () => request<PulseData>('/api/pulse'),
};

// Map
export const map = {
  get: () => request<MapData>('/api/map'),
};

// Expeditions
export const expeditions = {
  list: () => request<{ expeditions: Expedition[] }>('/api/expeditions'),
  get: (id: number) => request<Expedition>(`/api/expeditions/${id}`),
  create: (data: Partial<Expedition>) =>
    request<{ id: number }>('/api/expeditions', { method: 'POST', body: JSON.stringify(data) }),
};

// Approvals
export const approvals = {
  list: () => request<{ items: Item[]; drafts: Draft[] }>('/api/approvals'),
  approve: (type: string, id: number, reason?: string) =>
    request<{ success: boolean }>(`/api/approvals/${type}/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  reject: (type: string, id: number, reason?: string) =>
    request<{ success: boolean }>(`/api/approvals/${type}/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Upload
export const upload = {
  file: (formData: FormData) =>
    request<{ id: number; type: string; status: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    }),
};

// Studio
export const studio = {
  generate: (data: { itemId: number; channels: string[]; language: string; readingLevel: string }) =>
    request<{ results: Record<string, { draftId: number; body: string }>; source: string }>('/api/studio/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  drafts: (status?: string) =>
    request<{ drafts: Draft[] }>(`/api/studio/drafts${status ? `?status=${status}` : ''}`),
  updateDraft: (id: number, body: string, hashtags?: string) =>
    request<{ success: boolean }>(`/api/studio/drafts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ body, hashtags }),
    }),
  submitDraft: (id: number) =>
    request<{ success: boolean }>(`/api/studio/drafts/${id}/submit`, { method: 'POST' }),
};

// Ask the Archive
export const ask = {
  query: (query: string, language = 'en') =>
    request<AskResponse>('/api/ask', {
      method: 'POST',
      body: JSON.stringify({ query, language }),
    }),
};

// Analytics
export const analytics = {
  get: () => request<AnalyticsData>('/api/analytics'),
};

// Admin ingestion
export const admin = {
  ingestAll: () => request<{ message: string }>('/api/admin/ingest/all', { method: 'POST' }),
  ingestSource: (source: string) =>
    request<{ message: string }>(`/api/admin/ingest/${source}`, { method: 'POST' }),
};

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface Item {
  id: number;
  type: string;
  title: string;
  abstract?: string;
  summary?: string;
  source?: string;
  source_id?: string;
  url?: string;
  file_path?: string;
  thumbnail_url?: string;
  licence?: string;
  credit?: string;
  authors: string[];
  published_at?: string;
  region?: string;
  discipline?: string;
  lat?: number;
  lon?: number;
  status: string;
  quality_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total: number;
  publications: number;
  datasets: number;
  photos: number;
  videos: number;
  reports: number;
  expeditions: number;
  users: number;
  regionCounts: { region: string; count: number }[];
  disciplineCounts: { discipline: string; count: number }[];
  recentItems: Item[];
  ingestRuns?: { id: number; source: string; started_at: string; finished_at: string | null; fetched: number | null; inserted: number | null; updated: number | null; error: string | null }[];
}

export interface Facets {
  types: { type: string; count: number }[];
  regions: { region: string; count: number }[];
  disciplines: { discipline: string; count: number }[];
  years: { year: string; count: number }[];
}

export interface PulseData {
  stations: StationData[];
  seaIce: any;
  latestItems: Item[];
  stats: { totalItems: number; totalPublications: number; totalDatasets: number; totalPhotos: number };
}

export interface StationData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
  weather: any;
  stale: boolean;
}

export interface MapData {
  stations: StationData[];
  items: any[];
  expeditions: any[];
}

export interface Expedition {
  id: number;
  name: string;
  region: string;
  status: string;
  start_date?: string;
  end_date?: string;
  vessel_or_station?: string;
  summary?: string;
  lat?: number;
  lon?: number;
}

export interface Draft {
  id: number;
  item_id: number;
  item_title?: string;
  channel: string;
  language: string;
  reading_level: string;
  body: string;
  hashtags?: string;
  status: string;
  reason?: string;
  created_at: string;
}

export interface AskResponse {
  answer: string;
  citations: { itemId: number; title: string; url: string; snippet: string }[];
  grounded: boolean;
  suggestions?: { id: number; title: string; type: string }[];
}

export interface AnalyticsData {
  itemsByType: any[];
  topViewed: any[];
  ingestHealth: any[];
  metadataGaps: { missingRegion: number; missingLicence: number };
  draftFunnel: any[];
  byRegion: { region: string; count: number }[];
  byDiscipline: { discipline: string; count: number }[];
  monthlyGrowth: { month: string; count: number }[];
}
