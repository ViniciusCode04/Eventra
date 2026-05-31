import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createJob, fetchJob, fetchJobs } from '../services/api';
import type { CreateJobPayload, Job, JobStats } from '../types/job';

export const JOBS_QUERY_KEY = ['jobs'] as const;

export function useJobs(refetchInterval = 3000) {
  return useQuery({
    queryKey: JOBS_QUERY_KEY,
    queryFn: fetchJobs,
    refetchInterval,
  });
}

export function useJob(id: string, refetchInterval = 3000) {
  return useQuery({
    queryKey: [...JOBS_QUERY_KEY, id],
    queryFn: () => fetchJob(id),
    enabled: !!id,
    refetchInterval,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobPayload) => createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
}

export function computeJobStats(jobs: Job[]): JobStats {
  return jobs.reduce<JobStats>(
    (acc, job) => {
      acc.total++;
      switch (job.status) {
        case 'Pendente':
          acc.pendente++;
          break;
        case 'EmProcessamento':
          acc.emProcessamento++;
          break;
        case 'Concluido':
          acc.concluido++;
          break;
        case 'Erro':
          acc.erro++;
          break;
      }
      return acc;
    },
    { total: 0, pendente: 0, emProcessamento: 0, concluido: 0, erro: 0 }
  );
}
