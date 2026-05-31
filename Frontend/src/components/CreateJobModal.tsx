import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateJob } from '../hooks/useJobs';
import type { JobType } from '../types/job';

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
}

type FormState = {
  type: JobType;
  to: string;
  subject: string;
  body: string;
  reportName: string;
  format: string;
};

const initialForm: FormState = {
  type: 'EnviarEmail',
  to: '',
  subject: '',
  body: '',
  reportName: '',
  format: 'pdf',
};

export function CreateJobModal({ open, onClose }: CreateJobModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  const createJob = useCreateJob();

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setErrors({});
      setFeedback(null);
    }
  }, [open]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (form.type === 'EnviarEmail') {
      if (!form.to.trim()) newErrors.to = 'Destinatário é obrigatório';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.to))
        newErrors.to = 'E-mail inválido';
      if (!form.subject.trim()) newErrors.subject = 'Assunto é obrigatório';
    } else {
      if (!form.reportName.trim())
        newErrors.reportName = 'Nome do relatório é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload =
      form.type === 'EnviarEmail'
        ? {
            type: 'EnviarEmail' as const,
            payload: {
              to: form.to,
              subject: form.subject,
              ...(form.body && { body: form.body }),
            },
          }
        : {
            type: 'GerarRelatorio' as const,
            payload: {
              reportName: form.reportName,
              format: form.format,
            },
          };

    try {
      await createJob.mutateAsync(payload);
      setFeedback('success');
      setTimeout(() => onClose(), 1500);
    } catch {
      setFeedback('error');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="tech-panel corner-brackets w-full max-w-lg p-6 pointer-events-auto border border-eventra-cyan/20"
              style={{ boxShadow: '0 0 60px rgba(0,212,255,0.12)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold gradient-text mb-1">Novo job</h2>
              <p className="text-xs text-gray-500 mb-6">Preencha os dados abaixo para criar um novo job.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Tipo</label>
                  <select
                    className="input-glass"
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as JobType })
                    }
                  >
                    <option value="EnviarEmail">Enviar E-mail</option>
                    <option value="GerarRelatorio">Gerar Relatório</option>
                  </select>
                </div>

                {form.type === 'EnviarEmail' ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Para</label>
                      <input
                        type="email"
                        className="input-glass"
                        placeholder="usuario@email.com"
                        value={form.to}
                        onChange={(e) => setForm({ ...form, to: e.target.value })}
                      />
                      {errors.to && (
                        <p className="text-red-400 text-xs mt-1">{errors.to}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Assunto</label>
                      <input
                        type="text"
                        className="input-glass"
                        placeholder="Assunto do e-mail"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      />
                      {errors.subject && (
                        <p className="text-red-400 text-xs mt-1">{errors.subject}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Corpo <span className="text-gray-600">(opcional)</span>
                      </label>
                      <textarea
                        className="input-glass min-h-[80px] resize-y"
                        placeholder="Conteúdo do e-mail"
                        value={form.body}
                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Nome do Relatório
                      </label>
                      <input
                        type="text"
                        className="input-glass"
                        placeholder="Vendas mensais"
                        value={form.reportName}
                        onChange={(e) =>
                          setForm({ ...form, reportName: e.target.value })
                        }
                      />
                      {errors.reportName && (
                        <p className="text-red-400 text-xs mt-1">{errors.reportName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Formato</label>
                      <select
                        className="input-glass"
                        value={form.format}
                        onChange={(e) => setForm({ ...form, format: e.target.value })}
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </>
                )}

                <AnimatePresence>
                  {feedback === 'success' && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-green-400 text-sm text-center py-2"
                    >
                      Job criado com sucesso!
                    </motion.p>
                  )}
                  {feedback === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-sm text-center py-2"
                    >
                      Erro ao criar job. Verifique a API.
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createJob.isPending}
                    className="flex-1 btn-neon disabled:opacity-50"
                  >
                    {createJob.isPending ? 'Criando…' : 'Criar job'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
