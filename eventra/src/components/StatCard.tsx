import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  glow: string;
  index: number;
  icon?: string;
}

function AnimatedCounter({ value, color }: { value: number; color: string }) {
  const spring = useSpring(0, { stiffness: 40, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [text, setText] = useState('0');

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return display.on('change', (v) => setText(String(v)));
  }, [display]);

  return (
    <span className="font-mono tabular-nums" style={{ textShadow: `0 0 30px ${color}` }}>
      {text}
    </span>
  );
}

export function StatCard({ label, value, color, glow, index, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.07, duration: 0.6, type: 'spring' }}
      whileHover={{
        y: -6,
        scale: 1.03,
        transition: { duration: 0.2 },
      }}
      style={{ perspective: 800 }}
      className="relative group cursor-default"
    >
      {/* Glow externo */}
      <motion.div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{ background: `linear-gradient(135deg, ${color}40, transparent)` }}
      />

      <div
        className="tech-panel corner-brackets p-5 relative overflow-hidden"
        style={{ boxShadow: glow }}
      >
        {/* Barra de dados animada no fundo */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 opacity-30 origin-left"
          style={{ background: color }}
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
        />

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${color}20, transparent 70%)`,
          }}
        />

        <div className="flex items-start justify-between mb-3 relative z-10">
          <p className="text-[10px] text-gray-600 uppercase tracking-wide">{label}</p>
          {icon && (
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: index * 0.3 }}
              className="text-xl opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ color, filter: `drop-shadow(0 0 8px ${color})` }}
            >
              {icon}
            </motion.span>
          )}
        </div>

        <p className="text-4xl font-bold relative z-10" style={{ color }}>
          <AnimatedCounter value={value} color={color} />
        </p>

        {/* Mini sparkline decorativo */}
        <div className="flex items-end gap-0.5 mt-3 h-4 relative z-10 opacity-40 group-hover:opacity-80 transition-opacity">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              style={{ background: color }}
              animate={{ height: ['20%', `${30 + Math.random() * 70}%`, '20%'] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 + index * 0.05 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
