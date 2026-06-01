import { memo, useMemo } from 'react';
import { ParticleCanvas } from './ParticleCanvas';
import { MatrixRain } from './MatrixRain';

function isMobile() {
  return window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

export const TechBackground = memo(function TechBackground() {
  const mobile = useMemo(() => isMobile(), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {!mobile && <ParticleCanvas />}
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

      {/* Orbes — menos blur no mobile */}
      <div
        className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] bg-gradient-radial-cyan rounded-full"
        style={{
          filter: mobile ? 'blur(60px)' : 'blur(100px)',
          animation: 'orbPulse1 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-5%] w-[700px] h-[700px] bg-gradient-radial-purple rounded-full"
        style={{
          filter: mobile ? 'blur(80px)' : 'blur(120px)',
          animation: 'orbPulse2 10s ease-in-out infinite',
        }}
      />

      {/* Scanlines CRT — skip no mobile */}
      {!mobile && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      )}

      {/* Scanlines móveis */}
      <div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-eventra-cyan/40 to-transparent shadow-[0_0_20px_rgba(0,212,255,0.5)]"
        style={{ animation: 'scanDown 6s linear infinite' }}
      />
      {!mobile && (
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-eventra-purple/30 to-transparent"
          style={{ animation: 'scanUp 10s linear 3s infinite' }}
        />
      )}

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-noise" />

      {/* Hex pattern — skip no mobile */}
      {!mobile && (
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
      )}

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0F_75%)]" />

      <style>{`
        @keyframes orbPulse1 {
          0%,100% { transform: scale(1);   opacity: 0.3; }
          50%      { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes orbPulse2 {
          0%,100% { transform: scale(1.2); opacity: 0.2; }
          50%      { transform: scale(1);   opacity: 0.4; }
        }
        @keyframes scanDown {
          from { top: -2%; }
          to   { top: 102%; }
        }
        @keyframes scanUp {
          from { top: 102%; }
          to   { top: -2%; }
        }
      `}</style>
    </div>
  );
});
