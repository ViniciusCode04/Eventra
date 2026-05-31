import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Job } from '../types/job';
import { StatusBadge } from './StatusBadge';
import { formatJobType } from '../utils/format';

function truncateId(id: string) {
  return `${id.slice(0, 8)}…`;
}

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleString('pt-BR');
}

interface JobCardProps {
  job: Job;
  index?: number;
}

export function JobCard({ job, index = 0 }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 120 }}
      whileHover={{ x: 4 }}
    >
      <Link
        to={`/jobs/${job.id}`}
        className="group block p-4 rounded-xl border border-white/[0.05] bg-eventra-dark/50 backdrop-blur-sm hover-tech relative overflow-hidden"
      >
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-eventra-cyan to-eventra-purple origin-top"
          initial={{ scaleY: 0 }}
          whileHover={{ scaleY: 1 }}
          transition={{ duration: 0.2 }}
        />

        <div className="absolute top-2 right-2 text-[8px] font-mono text-gray-800 group-hover:text-gray-600 transition-colors">
          #{String(index + 1).padStart(2, '0')}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-eventra-cyan/50 font-mono tracking-widest">{truncateId(job.id)}</p>
            <p className="font-semibold text-white group-hover:text-eventra-cyan transition-all duration-300 mt-1 group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]">
              {formatJobType(job.type)}
            </p>
            <p className="text-[9px] text-gray-700 mt-1 font-mono">{formatDate(job.createdAt)}</p>
          </div>
          <StatusBadge status={job.status} size="sm" />
        </div>
      </Link>
    </motion.div>
  );
}
