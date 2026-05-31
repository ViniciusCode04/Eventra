import { motion } from 'framer-motion';

export function SystemBar() {
  const time = new Date().toLocaleTimeString('pt-BR');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-4 mb-6 px-4 py-2 rounded-lg border border-white/[0.06] bg-eventra-dark/50 backdrop-blur-md text-[11px] text-gray-500 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-eventra-cyan/5 via-transparent to-eventra-purple/5 pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10">
        <span className="text-eventra-cyan flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-eventra-cyan rounded-full animate-pulse shadow-[0_0_8px_#00D4FF]" />
          Sistema online
        </span>
        <span className="hidden md:inline text-gray-700">|</span>
        <span className="hidden md:inline">Nó: São Paulo</span>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-green-400/80"
        >
          Gravando
        </motion.span>
        <span>{time}</span>
      </div>
    </motion.div>
  );
}
