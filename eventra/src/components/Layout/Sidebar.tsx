import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../../assets/logo-eventra.png';
import { GlitchText } from '../GlitchText';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/jobs', label: 'Jobs', icon: '▣' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col border-r border-eventra-cyan/10 bg-eventra-dark/80 backdrop-blur-2xl">
      {/* Glow edge */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-eventra-cyan via-eventra-purple to-eventra-cyan animate-pulse opacity-50" />

      {/* Scanline sidebar */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-eventra-cyan/[0.02] to-transparent pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="p-6 border-b border-white/[0.06] relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-20px] rounded-full border border-dashed border-eventra-cyan/20"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 blur-2xl bg-eventra-cyan/30 rounded-full scale-150"
            />
            <img
              src={logo}
              alt="Eventra"
              className="relative h-24 w-auto object-contain hologram-logo"
            />
          </motion.div>

          <GlitchText as="h1" className="text-xl font-bold tracking-wider">
            Eventra
          </GlitchText>

          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_#4ade80]" />
            <p className="text-[9px] text-gray-600 tracking-wide">Versão 2.0 · Online</p>
          </div>
        </motion.div>
      </div>

      <nav className="flex-1 p-4 space-y-2 relative">
        <p className="text-[9px] text-gray-700 tracking-widest px-4 mb-3 uppercase">Navegação</p>
        {navItems.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12, type: 'spring' }}
          >
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="sidebar-glow"
                        className="absolute inset-0 border border-eventra-cyan/30 rounded-xl"
                        style={{ boxShadow: 'inset 0 0 30px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.1)' }}
                      />
                      <motion.div
                        layoutId="sidebar-bg"
                        className="absolute inset-0 bg-gradient-to-r from-eventra-cyan/10 to-eventra-purple/5 rounded-xl"
                      />
                    </>
                  )}
                  <span
                    className={`text-lg relative z-10 transition-all duration-300 ${
                      isActive
                        ? 'text-eventra-cyan drop-shadow-[0_0_8px_#00D4FF]'
                        : 'group-hover:text-eventra-cyan/70 group-hover:drop-shadow-[0_0_6px_rgba(0,212,255,0.5)]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="relative z-10 flex-1">
                    <span className="block">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-eventra-cyan relative z-10 shadow-[0_0_12px_#00D4FF]"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.06] relative">
        <CyberMiniPanel />
      </div>
    </aside>
  );
}

function CyberMiniPanel() {
  return (
    <div className="relative p-3 rounded-xl border border-white/[0.06] bg-eventra-dark/60 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-eventra-cyan/5 to-eventra-purple/5" />
      <p className="text-[8px] text-gray-700 tracking-widest relative z-10 uppercase">Servidor</p>
      <p className="text-xs text-eventra-cyan mt-1 relative z-10">JobProcessor</p>
      <div className="mt-2 h-1 bg-eventra-surface rounded-full overflow-hidden relative z-10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #00D4FF, #7B2FFF)' }}
          animate={{ width: ['30%', '85%', '60%', '90%'] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
      <p className="text-[8px] text-gray-600 mt-1 relative z-10">Latência: 12 ms</p>
    </div>
  );
}
