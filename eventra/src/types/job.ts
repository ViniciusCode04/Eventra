export type JobStatus = 'Pendente' | 'EmProcessamento' | 'Concluido' | 'Erro';

export type JobType = 'EnviarEmail' | 'GerarRelatorio';

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  retryCount: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string | null;
  hasReport: boolean;
  reportFileName: string | null;
}

export interface CreateJobPayload {
  type: JobType;
  payload: Record<string, unknown>;
}

export interface JobStats {
  total: number;
  pendente: number;
  emProcessamento: number;
  concluido: number;
  erro: number;
}
