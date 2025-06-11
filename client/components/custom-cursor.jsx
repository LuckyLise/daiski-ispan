// components/custom-cursor.jsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const CustomCursor = () => {
  const { theme } = useTheme();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [particles, setParticles] = useState([]);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const particleIdCounter = useRef(0);
  const rafId = useRef(null);
  const latestHoverRef = useRef(false);

  const MAX_PARTICLES = 30;
  const PARTICLE_EMISSION_RATE = 0.3;
  const PARTICLE_LIFESPAN_MIN = 800;
  const PARTICLE_LIFESPAN_MAX = 1500;

  const sparkleColorsConfig = {
    light: [
      'rgba(255, 255, 200, 1)',
      'rgba(200, 225, 255, 1)',
      'rgba(255, 210, 230, 1)',
      'rgba(220, 220, 250, 1)',
    ],
    dark: [
      'rgba(255, 255, 200, 0.7)',
      'rgba(200, 225, 255, 0.7)',
      'rgba(255, 210, 230, 0.7)',
      'rgba(220, 220, 250, 0.7)',
    ],
  };

  // 偵測是否為 touch 裝置 & 樣式初始化
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(hasTouch);
    }
  }, []);

  // 加／移除 custom-cursor-active class
  useEffect(() => {
    if (!isMounted) return;
    if (isTouchDevice) {
      document.documentElement.classList.remove('custom-cursor-active');
      if (document.body.style.cursor === 'none')
        document.body.style.cursor = 'auto';
    } else {
      document.documentElement.classList.add('custom-cursor-active');
    }
    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      if (document.body.style.cursor === 'none')
        document.body.style.cursor = 'auto';
    };
  }, [isTouchDevice, isMounted]);

  // 核心：滑鼠事件 + RAF 節流 + setTimeout 控制粒子壽命
  useEffect(() => {
    if (isTouchDevice || !isMounted) return;

    const colors =
      theme === 'dark' ? sparkleColorsConfig.dark : sparkleColorsConfig.light;

    const moveCursor = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      cursorX.set(x);
      cursorY.set(y);

      // 更新 hover 狀態 ref
      latestHoverRef.current = !!e.target.closest(
        'a, button, [role="button"], input[type="submit"], input[type="reset"], input[type="image"], label[for], select, textarea, .clickable-custom'
      );

      // 如果已有下一幀排程就 skip
      if (rafId.current) return;

      rafId.current = requestAnimationFrame(() => {
        // 1. 更新 hover state
        setIsHoveringClickable((prev) => {
          const latest = latestHoverRef.current;
          return prev === latest ? prev : latest;
        });

        // 2. 隨機生成粒子
        if (Math.random() < PARTICLE_EMISSION_RATE) {
          const newParticle = {
            id: particleIdCounter.current++,
            x: x + (Math.random() - 0.5) * 15,
            y: y + (Math.random() - 0.5) * 15,
            finalX: x + (Math.random() - 0.5) * 60,
            finalY: y + (Math.random() - 0.5) * 60,
            color: colors[Math.floor(Math.random() * colors.length)],
            scale: Math.random() * 0.6 + 0.4,
            duration:
              Math.random() * (PARTICLE_LIFESPAN_MAX - PARTICLE_LIFESPAN_MIN) +
              PARTICLE_LIFESPAN_MIN,
          };
          // console.log(`新粒子已建立，ID: ${newParticle.id}`);
          setParticles((prev) => {
            const next = [newParticle, ...prev];
            return next.slice(0, MAX_PARTICLES);
          });

          // 壽命到期後移除
          setTimeout(() => {
            setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
          }, newParticle.duration);
        }

        rafId.current = null;
      });
    };

    window.addEventListener('pointermove', moveCursor);
    return () => {
      window.removeEventListener('pointermove', moveCursor);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isTouchDevice, isMounted, theme]);

  if (!isMounted || isTouchDevice) return null;

  const cursorVariants = {
    default: {
      scale: 1,
      opacity: 1,
      transition: { type: 'tween', ease: 'backOut', duration: 0.3 },
    },
    clickable: {
      scale: 1.3,
      transition: { type: 'spring', stiffness: 400, damping: 15 },
    },
  };

  return (
    <>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed top-0 left-0 pointer-events-none rounded-full"
            style={{ zIndex: 9998 }}
            initial={{ x: p.x, y: p.y, scale: p.scale * 0.5, opacity: 0 }}
            animate={{
              x: p.finalX,
              y: p.finalY,
              scale: [p.scale, p.scale * 1.3, p.scale * 0.8, 0.1],
              opacity: [0.7, 1, 0.7, 0],
            }}
            transition={{ duration: p.duration / 1000, ease: 'easeOut' }}
          >
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: p.color,
                boxShadow: `0 0 6px 2px ${p.color.replace(/, [01]\)$/, ', 0.5)')}`,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ translateX: cursorX, translateY: cursorY }}
        variants={cursorVariants}
        animate={isHoveringClickable ? 'clickable' : 'default'}
      >
        <Image
          priority
          src="/icons8-cursor-64.svg"
          alt="cursor"
          width={isHoveringClickable ? 32 : 28}
          height={isHoveringClickable ? 32 : 28}
          className={isHoveringClickable ? 'opacity-100' : 'opacity-95'}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;
