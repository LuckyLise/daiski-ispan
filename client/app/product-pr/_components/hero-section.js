'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import SnowParticle from './snow-particle'; // 引入同目錄下的 SnowParticle
import CTA from './CTA'; // 引入同目錄下的 CTA

// 從原 page.js 移來的常量
const snowParticleCount = 60;
const bgGradient =
  'linear-gradient(135deg, #43C6DB 0%, #74C6FA 20%, #B1B4FF 50%, #E6B3FF 80%, #FFD1E4 100%)';

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.3]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6, 0.8], [1, 1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.3], ['0px', '8px']);
  const rotate = useTransform(scrollYProgress, [0, 1], ['0deg', '-5deg']);

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothTextY = useSpring(textY, springConfig);
  const smoothBgScale = useSpring(bgScale, springConfig);

  return (
    <section ref={ref} className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0" style={{ background: bgGradient }} />
      {Array.from({ length: snowParticleCount }).map((_, i) => (
        <SnowParticle key={`hero-snow-${i}`} />
      ))}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{
          scale: smoothBgScale,
          opacity: bgOpacity,
          filter: blur,
          rotate,
        }}
      >
        <Image
          src="/product-pr/ProductPR.png" // 保持圖片路徑不變 (相對於 public 文件夾)
          alt="Burton Feelgood Camber 極限滑雪板"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-6 drop-shadow-xl"
          style={{ y: smoothTextY, opacity: textOpacity }}
        >
          Burton Feelgood Camber
        </motion.h1>
        <motion.p
          className="text-2xl md:text-3xl mb-8 drop-shadow-lg"
          style={{
            y: useTransform(smoothTextY, (v) => v * 0.8),
            opacity: textOpacity,
          }}
          transition={{ delay: 0.1 }}
        >
          駕馭寒冬，征服雪域
        </motion.p>
        <motion.div
          style={{
            opacity: textOpacity,
            scale: useTransform(textOpacity, [0, 1], [0.8, 1]),
          }}
          transition={{ delay: 0.2 }}
        >
          <CTA href="#features">探索卓越性能</CTA>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;