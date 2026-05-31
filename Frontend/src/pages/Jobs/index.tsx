import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../../components/Layout/Header';
import { JobTable } from '../../components/JobTable';
import { CreateJobModal } from '../../components/CreateJobModal';
import { LiveIndicator } from '../../components/LiveIndicator';
import { useJobs } from '../../hooks/useJobs';
import type { JobStatus } from '../../types/job';

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'Pendente', label: 'Pendente' },
  { value: 'EmProcessamento', label: 'Em Processamento' },
  { value: 'Concluido', label: 'Concluído' },
  { value: 'Erro', label: 'Erro' },
];

const typeOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'EnviarEmail', label: 'Enviar E-mail' },
  { value: 'GerarRelatorio', label: 'Gerar Relatório' },
];

export default function JobsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: jobs = [], isLoading, isError } = useJobs(3000);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (statusFilter && job.status !== (statusFilter as JobStatus)) return false;
      if (typeFilter && job.type !== typeFilter) return false;
      return true;
    });
  }, [jobs, statusFilter, typeFilter]);

  return (
    <div>
      <Header
        title="Jobs"
        subtitle={`${filteredJobs.length} registro(s) no sistema`}
        action={
          <button className="btn-neon" onClick={() => setModalOpen(true)}>
            + Novo job
          </button>
        }
      />

      {isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card-glow p-4 mb-6 border-red-500/30 text-red-300 text-sm"
        >
          Erro ao carregar jobs. Verifique a conexão com a API.
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4 mb-6 p-4 rounded-xl border border-white/[0.06] bg-eventra-dark/30 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 uppercase tracking-wide">Filtro</span>
          <select
            className="input-glass w-auto min-w-[180px] text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value} className="bg-eventra-dark">
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <select
          className="input-glass w-auto min-w-[180px] text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-eventra-dark">
              {o.label}
            </option>
          ))}
        </select>

        <div className="ml-auto">
          <LiveIndicator label="Atualização a cada 3 s" />
        </div>
      </motion.div>

      {isLoading ? (
        <div
          className="tech-panel p-12 text-center text-gray-500 animate-pulse"
        >
          Carregando jobs...
        </div>
      ) : (
        <JobTable jobs={filteredJobs} />
      )}

      <CreateJobModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
