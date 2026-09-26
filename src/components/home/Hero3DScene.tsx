'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Code,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function Hero3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 8, y: -8 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  // Smooth mouse parallax in 3D space
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-16deg to +16deg)
    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 16;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setRotate({ x: rotateX, y: rotateY });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Smoothly return to friendly isometric resting tilt
    setRotate({ x: 8, y: -8 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  // Touch move for mobile interactivity
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 14;

    setRotate({ x: rotateX, y: rotateY });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      className="w-full h-full min-h-[340px] sm:min-h-[420px] flex items-center justify-center relative select-none cursor-pointer overflow-hidden p-4"
      style={{ perspective: '1100px' }}
      aria-label="Interactive 3D Soft Workshop Diagram"
    >
      {/* 3D Scene Root Stage */}
      <div
        className="relative w-full max-w-[340px] h-[320px] sm:h-[360px] flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* ─── LAYER 0: Depth Ambient Grid & Radial Glow (Z: -50px) ─── */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-60 dark:opacity-75"
          style={{
            transform: 'translateZ(-50px) scale(1.15)',
            background:
              'radial-gradient(circle at center, rgba(44, 110, 89, 0.22) 0%, rgba(212, 115, 31, 0.12) 45%, transparent 75%)',
          }}
        />

        {/* Dynamic Shadow underneath the floating assembly */}
        <div
          className="absolute bottom-4 w-48 h-12 rounded-[50%] blur-xl pointer-events-none transition-all duration-300"
          style={{
            transform: `translateZ(-60px) translate(${rotate.y * -1.5}px, ${rotate.x * 1.5}px) scale(${isHovered ? 1.1 : 0.95})`,
            background: 'rgba(20, 19, 18, 0.35)',
          }}
        />

        {/* ─── LAYER 1: Central Tactile Clay Master Hub (Z: 20px) ─── */}
        <div
          className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-[28px] p-5 flex flex-col items-center justify-center text-center transition-transform duration-300"
          style={{
            transform: 'translateZ(25px)',
            background:
              'linear-gradient(145deg, var(--surface) 0%, var(--bg) 100%)',
            boxShadow: `
              0 18px 36px -8px rgba(38, 36, 31, 0.22),
              0 8px 16px -4px rgba(38, 36, 31, 0.14),
              -6px -6px 14px rgba(255, 255, 255, 0.95),
              inset 0 1px 1px rgba(255, 255, 255, 0.8),
              inset -2px -2px 6px rgba(38, 36, 31, 0.06)
            `,
            border: '1px solid var(--border)',
          }}
        >
          {/* Animated Central Core */}
          <div className="relative mb-3">
            {/* Glowing Aura Ring */}
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-emerald-500/30 to-amber-500/30 blur-md animate-pulse" />
            
            {/* Tactile Core Emblem */}
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 hover:scale-105"
              style={{
                background:
                  'linear-gradient(135deg, #2C6E59 0%, #1e4d3e 50%, #d4731f 120%)',
                boxShadow:
                  '0 10px 20px -3px rgba(44, 110, 89, 0.45), inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.3)',
              }}
            >
              <Wrench className="w-8 h-8 drop-shadow animate-pulse-slow" />
              
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-stone-900 shadow">
                <Sparkles size={11} className="animate-spin-slow" />
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <span
              className="text-xs sm:text-sm font-bold tracking-tight block"
              style={{ color: 'var(--ink)' }}
            >
              Soft Workshop Core
            </span>
            <span
              className="text-[10px] sm:text-[11px] font-semibold tracking-wide block"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              100% In-Browser Engine
            </span>
          </div>

          {/* Micro status ticker */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Zero Uploads • Safe</span>
          </div>
        </div>

        {/* ─── LAYER 2: Floating 3D Satellite Nodes (Z: 60px to 95px) ─── */}

        {/* 1. PDF Toolkit Satellite (Top Right) */}
        <div
          onMouseEnter={() => setActiveNode('pdf')}
          onMouseLeave={() => setActiveNode(null)}
          className="absolute -top-3 -right-2 sm:-right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-300 cursor-pointer"
          style={{
            transform: `translateZ(${activeNode === 'pdf' ? 95 : 75}px) translateY(${Math.sin(Date.now() / 800) * 3}px)`,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: `
              0 14px 28px -6px rgba(44, 110, 89, 0.25),
              -3px -3px 8px rgba(255, 255, 255, 0.9),
              inset 0 1px 1px rgba(255,255,255,0.8)
            `,
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{
              background: 'linear-gradient(135deg, #B83B26 0%, #d9534f 100%)',
              boxShadow: '0 4px 10px rgba(184, 59, 38, 0.35)',
            }}
          >
            <FileText size={16} />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>
              PDF Toolkit
            </p>
            <p className="text-[9px] font-medium leading-none text-emerald-600 dark:text-emerald-400">
              Merge & Compress
            </p>
          </div>
        </div>

        {/* 2. Image Studio Satellite (Bottom Left) */}
        <div
          onMouseEnter={() => setActiveNode('image')}
          onMouseLeave={() => setActiveNode(null)}
          className="absolute -bottom-3 -left-3 sm:-left-5 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-300 cursor-pointer"
          style={{
            transform: `translateZ(${activeNode === 'image' ? 90 : 70}px)`,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: `
              0 14px 28px -6px rgba(212, 115, 31, 0.25),
              -3px -3px 8px rgba(255, 255, 255, 0.9),
              inset 0 1px 1px rgba(255,255,255,0.8)
            `,
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{
              background: 'linear-gradient(135deg, #D4731F 0%, #f59e0b 100%)',
              boxShadow: '0 4px 10px rgba(212, 115, 31, 0.35)',
            }}
          >
            <ImageIcon size={16} />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>
              Image Studio
            </p>
            <p className="text-[9px] font-medium leading-none text-amber-600 dark:text-amber-400">
              Lossless WebP
            </p>
          </div>
        </div>

        {/* 3. Dev Code Satellite (Top Left) */}
        <div
          onMouseEnter={() => setActiveNode('dev')}
          onMouseLeave={() => setActiveNode(null)}
          className="absolute top-2 -left-4 sm:-left-6 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-300 cursor-pointer"
          style={{
            transform: `translateZ(${activeNode === 'dev' ? 85 : 65}px)`,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: `
              0 10px 20px -4px rgba(40, 104, 169, 0.22),
              -2px -2px 6px rgba(255, 255, 255, 0.85)
            `,
          }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #2868A9 0%, #3b82f6 100%)',
            }}
          >
            <Code size={13} />
          </div>
          <span className="text-[10px] font-bold" style={{ color: 'var(--ink)' }}>
            Dev Tools
          </span>
        </div>

        {/* 4. Privacy Shield Satellite (Bottom Right) */}
        <div
          onMouseEnter={() => setActiveNode('privacy')}
          onMouseLeave={() => setActiveNode(null)}
          className="absolute bottom-2 -right-4 sm:-right-6 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-300 cursor-pointer"
          style={{
            transform: `translateZ(${activeNode === 'privacy' ? 85 : 65}px)`,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: `
              0 10px 20px -4px rgba(44, 110, 89, 0.22),
              -2px -2px 6px rgba(255, 255, 255, 0.85)
            `,
          }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #2C6E59 0%, #10b981 100%)',
            }}
          >
            <ShieldCheck size={13} />
          </div>
          <span className="text-[10px] font-bold" style={{ color: 'var(--ink)' }}>
            Zero Logs
          </span>
        </div>

        {/* ─── LAYER 3: Tactile Clay 3D Spheres & Shapes (Z: 80px to 110px) ─── */}

        {/* Sphere 1: Pine Green Tactile Clay Orb */}
        <div
          className="absolute -top-6 left-1/3 w-10 h-10 rounded-full pointer-events-none transition-transform duration-300"
          style={{
            transform: 'translateZ(90px)',
            background:
              'radial-gradient(circle at 35% 30%, #52b788 0%, #2C6E59 55%, #184235 100%)',
            boxShadow: `
              0 14px 24px -4px rgba(24, 66, 53, 0.45),
              inset 2px 2px 4px rgba(255, 255, 255, 0.5),
              inset -2px -2px 4px rgba(0, 0, 0, 0.35)
            `,
          }}
        />

        {/* Sphere 2: Warm Amber Tactile Clay Orb */}
        <div
          className="absolute -bottom-4 right-1/4 w-8 h-8 rounded-full pointer-events-none transition-transform duration-300"
          style={{
            transform: 'translateZ(105px)',
            background:
              'radial-gradient(circle at 35% 30%, #fbbf24 0%, #D4731F 55%, #9a3412 100%)',
            boxShadow: `
              0 12px 20px -3px rgba(212, 115, 31, 0.45),
              inset 2px 2px 4px rgba(255, 255, 255, 0.5),
              inset -2px -2px 4px rgba(0, 0, 0, 0.3)
            `,
          }}
        />

        {/* Sphere 3: Plum Violet Tactile Clay Orb */}
        <div
          className="absolute top-1/2 -right-5 w-7 h-7 rounded-full pointer-events-none transition-transform duration-300"
          style={{
            transform: 'translateZ(85px)',
            background:
              'radial-gradient(circle at 35% 30%, #c084fc 0%, #7548A8 55%, #4c1d95 100%)',
            boxShadow: `
              0 10px 18px -3px rgba(117, 72, 168, 0.45),
              inset 2px 2px 4px rgba(255, 255, 255, 0.5),
              inset -2px -2px 4px rgba(0, 0, 0, 0.3)
            `,
          }}
        />

        {/* Sphere 4: Soft Cream Accent Orb */}
        <div
          className="absolute top-1/3 -left-4 w-5 h-5 rounded-full pointer-events-none transition-transform duration-300"
          style={{
            transform: 'translateZ(95px)',
            background:
              'radial-gradient(circle at 35% 30%, #ffffff 0%, #E6E1D6 60%, #b8b1a4 100%)',
            boxShadow: `
              0 8px 14px -2px rgba(38, 36, 31, 0.25),
              inset 1px 1px 2px rgba(255, 255, 255, 0.8),
              inset -1px -1px 2px rgba(0, 0, 0, 0.2)
            `,
          }}
        />
      </div>
    </div>
  );
}
