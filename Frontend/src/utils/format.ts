import type { JobType } from '../types/job';

const jobTypeLabels: Record<JobType, string> = {
  EnviarEmail: 'Enviar e-mail',
  GerarRelatorio: 'Gerar relatório',
};

export function formatJobType(type: JobType | string): string {
  return jobTypeLabels[type as JobType] ?? type;
}
