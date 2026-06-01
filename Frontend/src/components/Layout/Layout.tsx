import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TechBackground } from '../TechBackground';
import { SystemBar } from '../SystemBar';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      <TechBackground />

      {/* Overlay mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="relative z-10 md:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 xl:p-10">
        <SystemBar onMenuOpen={() => setSidebarOpen(true)} />
        <Outlet />
      </main>

      {/* Indicadores decorativos */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col gap-3 pointer-events-none opacity-30">
        {['Processador', 'Memória', 'Rede', 'Disco'].map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className="w-1 bg-gradient-to-b from-eventra-cyan to-eventra-purple rounded-full"
              style={{ height: `${20 + i * 8}px` }}
            />
            <span className="text-[8px] font-mono text-gray-600 [writing-mode:vertical-lr]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
