import { useEffect, useRef, memo } from 'react';

// Pure CSS animation instead of 40 Framer Motion instances
export const MatrixRain = memo(function MatrixRain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const columns = 30; // reduced from 40
    const chars: HTMLDivElement[] = [];

    for (let i = 0; i < columns; i++) {
      const col = document.createElement('div');
      col.className = 'matrix-col';
      col.style.cssText = `
        position: absolute;
        top: 0;
        left: ${(i / columns) * 100}%;
        font-family: monospace;
        font-size: 10px;
        color: #00D4FF;
        line-height: 1;
        white-space: pre;
        text-shadow: 0 0 8px rgba(0,212,255,0.8);
        will-change: transform;
        animation: matrixFall ${8 + (i % 5) * 2}s linear ${i * 0.15}s infinite;
      `;
      // Static content — no Math.random() on every render
      col.textContent = Array.from({ length: 30 }, (_, j) => (i + j) % 2 === 0 ? '1' : '0').join('\n');
      container.appendChild(col);
      chars.push(col);
    }

    return () => chars.forEach(c => c.remove());
  }, []);

  return (
    <>
      <style>{`
        @keyframes matrixFall {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
      `}</style>
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.07]"
      />
    </>
  );
});
