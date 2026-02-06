// API Client
// Centralized HTTP client for backend communication

import { useAuthStore } from '@/store/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: string;
        details?: unknown;
    };
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

class ApiClient {
    private getAuthHeaders(): Record<string, string> {
        const token = useAuthStore.getState().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
        const { method = 'GET', body, headers = {} } = options;

        const url = `${API_BASE}${endpoint}`;

        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
                ...headers,
            },
        };

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle 401 - clear auth
                if (response.status === 401) {
                    useAuthStore.getState().clearAuth();
                }

                return {
                    success: false,
                    error: data.error ?? { message: 'Request failed', code: 'UNKNOWN' },
                };
            }

            return data;
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Network error',
                    code: 'NETWORK_ERROR',
                },
            };
        }
    }

    // Auth endpoints
    async login(email: string, password: string) {
        return this.request<{
            user: { id: string; email: string; name: string | null };
            accessToken: string;
            expiresAt: string;
        }>('/auth/login', { method: 'POST', body: { email, password } });
    }

    async signup(email: string, password: string, name?: string) {
        return this.request<{
            user: { id: string; email: string; name: string | null };
            accessToken: string;
            expiresAt: string;
        }>('/auth/signup', { method: 'POST', body: { email, password, name } });
    }

    async getMe() {
        return this.request<{ user: { id: string; email: string; name: string | null } }>('/auth/me');
    }

    // Resume endpoints
    async getResumes(limit = 20, offset = 0) {
        return this.request<{
            resumes: Array<{
                id: string;
                title: string;
                status: string;
                createdAt: string;
                updatedAt: string;
            }>;
            total: number;
        }>(`/resumes?limit=${limit}&offset=${offset}`);
    }

    async getResume(id: string) {
        return this.request<{
            id: string;
            title: string;
            content: unknown;
            status: string;
        }>(`/resumes/${id}`);
    }

    async createResume(data: { title: string; content: unknown }) {
        return this.request<{ id: string }>('/resumes', { method: 'POST', body: data });
    }

    async updateResume(id: string, data: { title?: string; content?: unknown }) {
        return this.request<{ id: string }>(`/resumes/${id}`, { method: 'PUT', body: data });
    }

    async deleteResume(id: string) {
        return this.request(`/resumes/${id}`, { method: 'DELETE' });
    }

    // Scoring endpoints
    async analyzeResume(resumeId: string, jobDescription: string) {
        return this.request<{
            id: string;
            overallScore: number;
            classification: string;
            matchedKeywords: string[];
            missingKeywords: string[];
            suggestions: Array<{
                priority: string;
                issue: string;
                action: string;
            }>;
        }>('/scoring/analyze', {
            method: 'POST',
            body: { resumeId, jobDescription },
        });
    }

    async getScoreHistory(resumeId: string) {
        return this.request<{
            scores: Array<{
                id: string;
                overallScore: number;
                createdAt: string;
            }>;
        }>(`/scoring/resume/${resumeId}/history`);
    }
}

export const api = new ApiClient();
