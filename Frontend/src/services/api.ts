import axios from 'axios';
import type { CreateJobPayload, Job } from '../types/job';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchJobs(): Promise<Job[]> {
  const { data } = await api.get<Job[]>('/api/jobs');
  return data;
}

export async function fetchJob(id: string): Promise<Job> {
  const { data } = await api.get<Job>(`/api/jobs/${id}`);
  return data;
}

export async function createJob(body: CreateJobPayload): Promise<Job> {
  const { data } = await api.post<Job>('/api/jobs', body);
  return data;
}

export async function downloadJobReport(jobId: string, fileName: string): Promise<void> {
  const response = await api.get(`/api/jobs/${jobId}/report`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'relatorio';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default api;
