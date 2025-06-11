'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

function ParallaxSection({ id, title, text, reverse = false, image }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    [reverse ? '40%' : '-40%', reverse ? '-20%' : '20%']
  );
  const textY = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.05, 0.8]);
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.3],
    [reverse ? '-15deg' : '15deg', '0deg']
  );

  const springConfig = { stiffness: 50, damping: 20 };
  const smoothImageY = useSpring(imageY, springConfig);
  const smoothTextY = useSpring(textY, springConfig);
  const smoothScale = useSpring(scale, springConfig);
  const smoothRotate = useSpring(rotate, springConfig);

  return (
    <section
      id={id}
      ref={ref}
      className={`relative w-full h-screen overflow-hidden flex items-center justify-center ${reverse ? 'flex-row-reverse bg-gray-800' : 'bg-gray-700'}`}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y: smoothImageY, scale: smoothScale, rotate: smoothRotate }}
      >
        <Image
          src={image} // 圖片路徑由 props 傳入
          alt={title}
          fill
          className="object-cover opacity-60"
          style={{ transformOrigin: 'center' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent"
          style={{ opacity }}
        />
      </motion.div>
      <motion.div
        className="relative z-10 max-w-2xl px-8 text-white text-center"
        style={{ y: smoothTextY, opacity, scale: smoothScale }}
      >
        <h2 className="text-5xl md:text-6xl font-extrabold mb-8 drop-shadow-2xl">
          {title}
        </h2>
        <p className="text-xl md:text-2xl leading-relaxed drop-shadow-xl">
          {text}
        </p>
      </motion.div>
    </section>
  );
}

export default ParallaxSection;