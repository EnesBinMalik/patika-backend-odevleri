import React, { useEffect, useRef } from 'react';
import { soundFx } from '../services/soundFx';
import { X, Shield } from 'lucide-react';

interface MatrixRainOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatrixRainOverlay: React.FC<MatrixRainOverlayProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Characters: Katakana, Cyrillic, Greek, Numbers, Symbols
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>*+-/=%$#@&';
    const fontSize = 16;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array(columns).fill(1);

    const draw = () => {
      if (!isMounted) return;

      // Semi-transparent black rect for trail fade
      ctx.fillStyle = 'rgba(5, 5, 10, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

      columns = Math.floor(canvas.width / fontSize);
      if (drops.length !== columns) {
        drops = Array(columns).fill(1);
      }

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading character is bright cyan/white, trailing is emerald green
        if (Math.random() > 0.88) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = '#00ff66';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 4;
        }

        ctx.fillText(text, x, y);

        // Reset drop to top with randomized delay
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#05050a] flex flex-col justify-between">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Top Banner */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#00ff66] animate-pulse" />
          <span className="font-orbitron font-bold text-sm tracking-widest text-[#00ff66] drop-shadow-[0_0_8px_rgba(0,255,102,0.8)]">
            AURASYNC // MATRIX RAIN PROTOCOL
          </span>
        </div>

        <button
          onClick={() => {
            soundFx.play('click');
            onClose();
          }}
          className="min-h-[44px] px-4 py-2 bg-black/60 border border-[#00ff66]/50 hover:bg-[#00ff66]/20 text-[#00ff66] font-mono-tech text-xs font-bold rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
        >
          <span>EXIT MATRIX</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom status watermark */}
      <div className="relative z-10 p-4 text-center bg-gradient-to-t from-black/90 to-transparent">
        <p className="font-mono-tech text-xs text-emerald-400/80 tracking-widest uppercase">
          STREAMING CIPHER BLOCKS · ARCHITECTED BY ENES ÖZTÜRK
        </p>
      </div>
    </div>
  );
};
