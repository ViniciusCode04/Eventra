import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo-eventra.png';
import { TechBackground } from './TechBackground';
import { GlitchText } from './GlitchText';
import { ParticleCanvas } from './ParticleCanvas';

interface SplashScreenProps {
  onComplete: () => void;
}

const bootLines = [
  'Inicializando sistema...',
  'Conectando à API JobProcessor...',
  'Carregando módulos...',
  'Ativando monitoramento...',
  'Sistema pronto.',
];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return 100;
        }
        return p + 2;
      });
    }, 30);

    const lineInterval = setInterval(() => {
      setLineIndex((i) => (i < bootLines.length - 1 ? i + 1 : i));
    }, 400);

    return () => {
      clearInterval(interval);
      clearInterval(lineInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-eventra-dark overflow-hidden"
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <TechBackground />
      <ParticleCanvas />

      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border border-eventra-cyan/10"
          style={{
            width: `${180 + ring * 80}px`,
            height: `${180 + ring * 80}px`,
          }}
          animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 15 + ring * 5, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, type: 'spring', stiffness: 60 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div className="relative mb-10">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-[-40px] blur-3xl bg-eventra-cyan/30 rounded-full"
          />
          <img
            src={logo}
            alt="Eventra"
            className="relative h-40 w-auto hologram-logo animate-hologram"
          />
        </motion.div>

        <GlitchText as="h1" className="text-6xl font-bold tracking-widest mb-4">
          Eventra
        </GlitchText>

        <div className="h-16 mb-8 text-sm text-eventra-cyan/70 text-center">
          {bootLines.slice(0, lineIndex + 1).map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={i === lineIndex ? 'text-white' : 'text-gray-700'}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <div className="w-72 relative">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Carregando</span>
            <span className="text-eventra-cyan">{progress}%</span>
          </div>
          <div className="h-1.5 bg-eventra-surface rounded-full overflow-hidden border border-white/5 relative">
            <motion.div
              className="h-full rounded-full relative"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00D4FF, #7B2FFF, #00D4FF)',
                backgroundSize: '200% 100%',
                boxShadow: '0 0 25px rgba(0,212,255,0.9)',
              }}
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
