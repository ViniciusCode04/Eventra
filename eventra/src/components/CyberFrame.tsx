import { motion } from 'framer-motion';

interface CyberFrameProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'mixed';
}

export function CyberFrame({ children, className = '', glow = 'mixed' }: CyberFrameProps) {
  const glowColors = {
    cyan: 'from-eventra-cyan via-eventra-cyan/50 to-transparent',
    purple: 'from-eventra-purple via-eventra-purple/50 to-transparent',
    mixed: 'from-eventra-cyan via-eventra-purple to-eventra-cyan',
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Borda animada rotativa */}
      <div className="absolute -inset-[1px] rounded-2xl overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity duration-500">
        <motion.div
          className={`absolute inset-[-50%] bg-gradient-conic ${glowColors[glow]}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            background: `conic-gradient(from 0deg, #00D4FF, #7B2FFF, #00D4FF, transparent, #7B2FFF, #00D4FF)`,
          }}
        />
      </div>

      {/* Cantos HUD */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-eventra-cyan z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-eventra-purple z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-eventra-purple z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-eventra-cyan z-20 pointer-events-none" />

      <div className="relative z-10 bg-eventra-dark/90 backdrop-blur-2xl rounded-2xl border border-white/[0.06]">
        {children}
      </div>
    </div>
  );
}
