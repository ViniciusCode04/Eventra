import { motion } from 'framer-motion';
import { ParticleCanvas } from './ParticleCanvas';
import { MatrixRain } from './MatrixRain';

export function TechBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <ParticleCanvas />
      <MatrixRain />

      {/* Grid perspectiva 3D */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40vh] opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* Grid superior */}
      <div
        className="absolute inset-0 bg-grid-tech bg-[length:40px_40px] animate-gridPulse"
        style={{ maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black, transparent)' }}
      />

      {/* Orbes */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] bg-gradient-radial-cyan rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-[-15%] right-[-5%] w-[700px] h-[700px] bg-gradient-radial-purple rounded-full blur-[120px]"
      />

      {/* Scanlines CRT */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />

      {/* Scanline móvel */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-eventra-cyan/40 to-transparent shadow-[0_0_20px_rgba(0,212,255,0.5)]"
        animate={{ top: ['-2%', '102%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-eventra-purple/30 to-transparent"
        animate={{ top: ['102%', '-2%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear', delay: 3 }}
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-noise" />

      {/* Hex pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon
              points="25,0 50,14.4 50,43.4 25,57.7 0,43.4 0,14.4"
              fill="none"
              stroke="#00D4FF"
              strokeWidth="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0F_75%)]" />
    </div>
  );
}
