import { motion } from 'framer-motion';

const columns = 40;

export function MatrixRain() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.07]">
      {Array.from({ length: columns }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 font-mono text-[10px] text-eventra-cyan leading-none whitespace-pre select-none"
          style={{
            left: `${(i / columns) * 100}%`,
            textShadow: '0 0 8px rgba(0,212,255,0.8)',
          }}
          initial={{ y: '-100%' }}
          animate={{ y: '100vh' }}
          transition={{
            duration: 8 + (i % 5) * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.15,
          }}
        >
          {Array.from({ length: 30 })
            .map(() => (Math.random() > 0.5 ? '1' : '0'))
            .join('\n')}
        </motion.div>
      ))}
    </div>
  );
}
