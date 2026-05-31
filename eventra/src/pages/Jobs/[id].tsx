import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useJob } from '../../hooks/useJobs';
import { downloadJobReport } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { LiveIndicator } from '../../components/LiveIndicator';
import { formatJobType } from '../../utils/format';

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleString('pt-BR');
}

export default function JobDetailPage() {
  const { id = '' } = useParams();
  const { data: job, isLoading, isError } = useJob(id, 3000);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const canDownloadReport =
    job?.type === 'GerarRelatorio' &&
    job.status === 'Concluido' &&
    job.hasReport;

  async function handleDownload() {
    if (!job) return;

    setDownloading(true);
    setDownloadError(null);

    try {
      await downloadJobReport(job.id, job.reportFileName ?? 'relatorio');
    } catch {
      setDownloadError('Falha ao baixar o relatório. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="tech-panel p-12 text-center text-gray-500 animate-pulse">
        Carregando...
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-eventra-cyan hover:text-white transition-colors mb-6 text-sm"
        >
          ← Voltar para jobs
        </Link>
        <div className="tech-panel p-12 text-center text-red-300 border-red-500/20">
          Job não encontrado.
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-eventra-cyan hover:text-white transition-colors mb-6 group text-sm"
        >
          <motion.span className="group-hover:-translate-x-1 transition-transform">←</motion.span>
          Voltar para jobs
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="tech-panel corner-brackets p-8 max-w-2xl border border-eventra-purple/20"
        style={{ boxShadow: '0 0 40px rgba(123, 47, 255, 0.08)' }}
      >
        <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-white/[0.06]">
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">
              Detalhes do job
            </p>
            <h1 className="text-2xl font-bold gradient-text">{formatJobType(job.type)}</h1>
            <p className="font-mono text-xs text-gray-600 mt-3 break-all bg-eventra-dark/50 p-2 rounded-lg border border-white/5">
              {job.id}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={job.status} />
            <LiveIndicator label="Ao vivo" />
          </div>
        </div>

        <dl className="space-y-1">
          {[
            { label: 'Status', value: <StatusBadge status={job.status} size="sm" /> },
            { label: 'Tentativas', value: <span className="font-mono text-eventra-cyan">{job.retryCount}</span> },
            { label: 'Criado em', value: formatDate(job.createdAt) },
            { label: 'Atualizado em', value: formatDate(job.updatedAt) },
            ...(job.reportFileName
              ? [{ label: 'Arquivo', value: <span className="font-mono text-eventra-purple text-xs">{job.reportFileName}</span> }]
              : []),
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between py-3 px-3 rounded-lg hover:bg-white/[0.02] transition-colors border-b border-white/[0.03]"
            >
              <dt className="text-gray-500 text-sm">{row.label}</dt>
              <dd className="text-gray-200 text-sm">{row.value}</dd>
            </div>
          ))}
        </dl>

        {job.status === 'EmProcessamento' && job.type === 'GerarRelatorio' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-6 p-4 rounded-xl border border-eventra-cyan/20 bg-eventra-cyan/5 text-sm text-eventra-cyan"
          >
            ⟳ Gerando relatório...
          </motion.div>
        )}

        {canDownloadReport && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 rounded-xl border border-green-500/30 bg-green-500/5"
          >
            <p className="text-[10px] text-green-400 uppercase tracking-wider mb-3">
              Relatório disponível
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Relatório gerado com sucesso. Clique para exportar pelo site.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="btn-neon w-full sm:w-auto disabled:opacity-50"
            >
              {downloading ? 'Baixando...' : `⬇ Exportar ${job.reportFileName}`}
            </button>
            {downloadError && (
              <p className="text-red-400 text-xs mt-3 font-mono">{downloadError}</p>
            )}
          </motion.div>
        )}

        {job.status === 'Erro' && job.errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none" />
            <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2 relative">
              Mensagem de erro
            </p>
            <p className="text-red-200 text-sm relative">{job.errorMessage}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
