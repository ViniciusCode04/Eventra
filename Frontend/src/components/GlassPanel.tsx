import { motion } from 'framer-motion';
import { CyberFrame } from './CyberFrame';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  delay?: number;
  frame?: boolean;
}

export function GlassPanel({
  children,
  className = '',
  title,
  subtitle,
  action,
  delay = 0,
  frame = true,
}: GlassPanelProps) {
  const content = (
    <>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5 relative z-10 px-1">
          <div>
            {title && (
              <h2 className="text-lg font-semibold flex items-center gap-3">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-eventra-cyan shadow-[0_0_10px_#00D4FF]"
                />
                <span className="gradient-text">{title}</span>
              </h2>
            )}
            {subtitle && (
              <p className="text-[10px] text-gray-600 mt-1.5 ml-5 uppercase tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </>
  );

  if (frame) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay, duration: 0.6, type: 'spring' }}
        style={{ perspective: 1000 }}
      >
        <CyberFrame className={className}>
          <div className="p-6 corner-brackets">{content}</div>
        </CyberFrame>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`tech-panel corner-brackets p-6 ${className}`}
    >
      {content}
    </motion.div>
  );
}
