import { motion } from 'framer-motion';
import logo from '../../assets/logo-eventra.png';
import { GlitchText } from '../GlitchText';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onMenuOpen?: () => void;
}

export function Header({ title, subtitle, action, onMenuOpen }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-wrap items-center justify-between gap-4 mb-8 pb-6"
    >
      {/* Linha decorativa animada */}
      <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-eventra-cyan via-eventra-purple to-eventra-cyan"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ width: '50%' }}
        />
        <div className="absolute inset-0 bg-white/[0.04]" />
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Hambúrguer — apenas mobile */}
        {onMenuOpen && (
          <button
            onClick={onMenuOpen}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-gray-400 hover:text-eventra-cyan hover:border-eventra-cyan/50 transition-colors text-xl shrink-0"
            aria-label="Abrir menu"
          >
            ☰
          </button>
        )}

        <motion.div
          whileHover={{ rotateY: 15, scale: 1.08 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="hidden sm:block relative"
        >
          <div className="absolute inset-0 blur-xl bg-eventra-purple/30 rounded-full scale-150" />
          <img src={logo} alt="" className="relative h-14 w-auto hologram-logo" aria-hidden />
        </motion.div>

        <div>
          <GlitchText as="h1" className="text-xl sm:text-2xl md:text-4xl font-bold tracking-tight">
            {title}
          </GlitchText>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>

      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full sm:w-auto"
        >
          {action}
        </motion.div>
      )}
    </motion.header>
  );
}
