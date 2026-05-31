import type { JobStatus } from '../types/job';

const statusConfig: Record<
  JobStatus,
  { label: string; className: string; dot?: boolean }
> = {
  Pendente: {
    label: 'Pendente',
    className:
      'bg-yellow-500/10 text-yellow-300 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.25)]',
  },
  EmProcessamento: {
    label: 'Processando',
    className:
      'bg-eventra-cyan/10 text-eventra-cyan border-eventra-cyan/50 shadow-[0_0_20px_rgba(0,212,255,0.3)] animate-pulseGlow',
    dot: true,
  },
  Concluido: {
    label: 'Concluído',
    className:
      'bg-green-500/10 text-green-300 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.25)]',
  },
  Erro: {
    label: 'Erro',
    className:
      'bg-red-500/10 text-red-300 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  },
};

interface StatusBadgeProps {
  status: JobStatus | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status as JobStatus] ?? {
    label: status,
    className: 'bg-gray-500/10 text-gray-300 border-gray-500/30',
  };

  const sizeClass = size === 'sm' ? 'text-[9px] px-2 py-0.5 gap-1' : 'text-xs px-3 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium backdrop-blur-sm ${sizeClass} ${config.className}`}
    >
      {config.dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eventra-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-eventra-cyan shadow-[0_0_6px_#00D4FF]" />
        </span>
      )}
      {config.label}
    </span>
  );
}
