'use client';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// numLines 常量移到組件內部
const numLines = 30;

// containerStyle 和 lineBaseStyle 常量移到組件內部
const containerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 0,
};

const lineBaseStyle = {
  position: 'absolute',
  width: '2px',
  height: '150%',
  left: '50%',
  top: '-25%',
  backgroundColor: 'rgba(100, 149, 237, 0.15)',
  transformOrigin: 'center center',
};


function AnimatedPattern() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.2, 0]);
  const y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
  const scale = useTransform(scrollYProgress, [0.3, 0.7], [1, 1.1]);
  const rotate = useTransform(scrollYProgress, [0, 1], ['-5deg', '5deg']);

  const lines = Array.from({ length: numLines });

  return (
    <section
      ref={ref}
      className="relative w-full h-72 md:h-96 overflow-hidden bg-slate-200"
    >
      <motion.div
        style={{
          ...containerStyle,
          opacity,
          y,
          scale,
          rotate,
        }}
      >
        {lines.map((_, i) => (
          <motion.div
            key={`pattern-line-${i}`}
            style={{
              ...lineBaseStyle,
              transform: `translateX(-50%) rotate(${(i / numLines) * 360}deg)`,
            }}
          />
        ))}
      </motion.div>
      <div className="relative z-10 flex items-center justify-center h-full">
        <motion.p
          style={{
            opacity: useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]),
          }}
          className="text-2xl text-slate-600 font-semibold italic"
        >
          Burton Feelgood Camber 極限滑雪板: Elevate Your Ride
        </motion.p>
      </div>
    </section>
  );
}

export default AnimatedPattern;