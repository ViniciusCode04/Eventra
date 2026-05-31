/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        eventra: {
          cyan: '#00D4FF',
          purple: '#7B2FFF',
          dark: '#0A0A0F',
          surface: '#111118',
          card: '#16161F',
          border: '#1E1E2E',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 212, 255, 0.35)',
        'neon-purple': '0 0 25px rgba(123, 47, 255, 0.4)',
        'neon-green': '0 0 15px rgba(34, 197, 94, 0.45)',
        'neon-yellow': '0 0 15px rgba(234, 179, 8, 0.45)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.45)',
        'neon-inner': 'inset 0 0 20px rgba(0, 212, 255, 0.05)',
        cyber: '0 0 40px rgba(0, 212, 255, 0.15), 0 0 80px rgba(123, 47, 255, 0.1)',
      },
      animation: {
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        gridPulse: 'gridPulse 4s ease-in-out infinite',
        borderGlow: 'borderGlow 3s ease-in-out infinite',
        'glitch-1': 'glitch1 3s infinite linear alternate-reverse',
        'glitch-2': 'glitch2 2s infinite linear alternate-reverse',
        hologram: 'hologram 3s ease-in-out infinite',
        spinSlow: 'spin 8s linear infinite',
        dataFlow: 'dataFlow 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 212, 255, 0.4)' },
          '50%': { boxShadow: '0 0 28px rgba(0, 212, 255, 0.85)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gridPulse: {
          '0%, 100%': { opacity: '0.04' },
          '50%': { opacity: '0.1' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(0, 212, 255, 0.2)' },
          '50%': { borderColor: 'rgba(123, 47, 255, 0.5)' },
        },
        glitch1: {
          '0%, 100%': { transform: 'translate(0)', opacity: '0.8' },
          '20%': { transform: 'translate(-2px, 1px)', opacity: '0.6' },
          '40%': { transform: 'translate(2px, -1px)', opacity: '0.9' },
          '60%': { transform: 'translate(-1px, 2px)', opacity: '0.5' },
          '80%': { transform: 'translate(1px, -2px)', opacity: '0.7' },
        },
        glitch2: {
          '0%, 100%': { transform: 'translate(0) skewX(0deg)' },
          '25%': { transform: 'translate(3px, 0) skewX(-2deg)' },
          '50%': { transform: 'translate(-3px, 0) skewX(2deg)' },
          '75%': { transform: 'translate(2px, 0) skewX(-1deg)' },
        },
        hologram: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.85', filter: 'brightness(1.2)' },
        },
        dataFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      backgroundImage: {
        'grid-tech':
          'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
        'gradient-radial-cyan':
          'radial-gradient(circle at center, rgba(0,212,255,0.2) 0%, transparent 70%)',
        'gradient-radial-purple':
          'radial-gradient(circle at center, rgba(123,47,255,0.15) 0%, transparent 70%)',
        noise:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        grid: '40px 40px',
      },
    },
  },
  plugins: [],
};
