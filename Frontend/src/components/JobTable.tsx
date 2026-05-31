import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Job } from '../types/job';
import { StatusBadge } from './StatusBadge';
import { formatJobType } from '../utils/format';

function truncateId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleString('pt-BR');
}

interface JobTableProps {
  jobs: Job[];
}

export function JobTable({ jobs }: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="tech-panel p-12 text-center text-gray-500 text-sm">
        Nenhum job encontrado.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="tech-panel overflow-hidden corner-brackets"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-gray-500 uppercase text-[10px] tracking-[0.15em] bg-eventra-dark/30">
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Tipo</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Tentativas</th>
              <th className="px-6 py-4 font-medium">Criado em</th>
              <th className="px-6 py-4 font-medium">Atualizado em</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => (
              <motion.tr
                key={job.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="table-row-tech"
              >
                <td className="px-6 py-4">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="font-mono text-eventra-cyan hover:text-white transition-colors text-xs"
                  >
                    {truncateId(job.id)}
                  </Link>
                </td>
                <td className="px-6 py-4 font-medium text-gray-200">{formatJobType(job.type)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={job.status} size="sm" />
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono">{job.retryCount}</td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{formatDate(job.createdAt)}</td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{formatDate(job.updatedAt)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
