import { motion } from 'framer-motion';

interface GlitchTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'span' | 'p';
}

export function GlitchText({ children, className = '', as: Tag = 'span' }: GlitchTextProps) {
  return (
    <Tag className={`relative inline-block ${className}`}>
      <motion.span
        className="relative z-10 gradient-text"
        animate={{ opacity: [1, 0.95, 1] }}
        transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
      >
        {children}
      </motion.span>
      <span
        className="absolute inset-0 gradient-text opacity-70 animate-glitch-1 pointer-events-none"
        aria-hidden
      >
        {children}
      </span>
      <span
        className="absolute inset-0 text-eventra-purple/80 opacity-50 animate-glitch-2 pointer-events-none"
        aria-hidden
        style={{ clipPath: 'inset(40% 0 30% 0)' }}
      >
        {children}
      </span>
    </Tag>
  );
}
