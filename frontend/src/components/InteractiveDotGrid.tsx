'use client';

import React, { useRef, useEffect } from 'react';

interface InteractiveDotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
}

export default function InteractiveDotGrid({
  dotSize = 1.5,
  gap = 36,
  baseColor = 'rgba(209, 213, 219, 0.4)',
  activeColor = 'rgba(255, 109, 51, 0.85)',
}: InteractiveDotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    interface Dot {
      x: number;
      y: number;
      ox: number;
      oy: number;
      vx: number;
      vy: number;
    }

    let dots: Dot[] = [];
    const mouse = { x: -1000, y: -1000, active: false };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      const cols = Math.ceil(width / gap);
      const rows = Math.ceil(height / gap);
      const startX = (width - (cols - 1) * gap) / 2;
      const startY = (height - (rows - 1) * gap) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = startX + c * gap;
          const y = startY + r * gap;
          dots.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
        }
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseleave', handlePointerLeave);

    const radius = 140;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        if (mouse.active) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < radius) {
            const force = (1 - dist / radius) * 8;
            const angle = Math.atan2(dy, dx);
            dot.vx += Math.cos(angle) * force;
            dot.vy += Math.sin(angle) * force;
          }
        }

        // Spring back to origin
        dot.vx += (dot.ox - dot.x) * 0.08;
        dot.vy += (dot.oy - dot.y) * 0.08;
        dot.vx *= 0.82;
        dot.vy *= 0.82;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Color interpolation based on displacement
        const disp = Math.hypot(dot.x - dot.ox, dot.y - dot.oy);
        const isActive = disp > 2;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, isActive ? dotSize * 1.5 : dotSize, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? activeColor : baseColor;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      resizeObserver.disconnect();
    };
  }, [dotSize, gap, baseColor, activeColor]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
