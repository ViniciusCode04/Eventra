import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Header } from '../../components/Layout/Header';
import { StatCard } from '../../components/StatCard';
import { JobCard } from '../../components/JobCard';
import { GlassPanel } from '../../components/GlassPanel';
import { LiveIndicator } from '../../components/LiveIndicator';
import { ChartTooltip, ActiveBarShape } from '../../components/ChartTooltip';
import { computeJobStats, useJobs } from '../../hooks/useJobs';

const chartColors = ['#EAB308', '#00D4FF', '#22C55E', '#EF4444'];

export default function DashboardPage() {
  const { data: jobs = [], isLoading, isError } = useJobs(3000);
  const stats = computeJobStats(jobs);

  const chartData = [
    { name: 'Pendentes', value: stats.pendente, color: chartColors[0] },
    { name: 'Processando', value: stats.emProcessamento, color: chartColors[1] },
    { name: 'Concluídos', value: stats.concluido, color: chartColors[2] },
    { name: 'Erros', value: stats.erro, color: chartColors[3] },
  ];

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Monitoramento de jobs em tempo real"
        action={<LiveIndicator label="Atualização a cada 3 s" />}
      />

      {isError && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="tech-panel p-4 mb-6 border-red-500/40 text-red-300 text-sm"
        >
          Não foi possível conectar à API. Verifique se o JobProcessor está em execução.
        </motion.div>
      )}

      {/* StatCards: 2 colunas em mobile, 3 em sm, 5 em lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <StatCard label="Total" value={stats.total} color="#FFFFFF" glow="0 0 25px rgba(255,255,255,0.1)" index={0} icon="◈" />
        <StatCard label="Pendentes" value={stats.pendente} color="#EAB308" glow="0 0 25px rgba(234,179,8,0.3)" index={1} icon="◷" />
        <StatCard label="Processando" value={stats.emProcessamento} color="#00D4FF" glow="0 0 30px rgba(0,212,255,0.35)" index={2} icon="⟳" />
        <StatCard label="Concluídos" value={stats.concluido} color="#22C55E" glow="0 0 25px rgba(34,197,94,0.3)" index={3} icon="✓" />
        <StatCard label="Erros" value={stats.erro} color="#EF4444" glow="0 0 25px rgba(239,68,68,0.3)" index={4} icon="✕" />
      </div>

      {/* Gráfico + Atividade recente: 1 coluna em mobile, 2 em lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassPanel title="Análise" subtitle="Distribuição por status" delay={0.3}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
              <defs>
                {chartData.map((entry, i) => (
                  <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.3} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(0,212,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'rgba(0, 212, 255, 0.03)', stroke: 'rgba(0,212,255,0.2)', strokeWidth: 1 }}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                maxBarSize={64}
                activeBar={(props) => <ActiveBarShape {...props} />}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={`url(#barGrad${i})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>

        <GlassPanel
          title="Atividade recente"
          subtitle="Últimos jobs processados"
          delay={0.4}
          action={<LiveIndicator />}
        >
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-16 rounded-xl border border-eventra-cyan/10"
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    borderColor: ['rgba(0,212,255,0.1)', 'rgba(123,47,255,0.3)', 'rgba(0,212,255,0.1)'],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  style={{
                    background: 'linear-gradient(90deg, rgba(0,212,255,0.02), rgba(123,47,255,0.04), rgba(0,212,255,0.02))',
                  }}
                />
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Aguardando jobs...</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
