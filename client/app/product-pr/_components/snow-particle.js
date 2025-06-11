'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SnowParticle = () => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    setStyle({
      position: 'absolute',
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
      backgroundColor: 'white',
      borderRadius: '50%',
      opacity: Math.random() * 0.5 + 0.2,
      pointerEvents: 'none',
      zIndex: 5,
    });
  }, []);

  return (
    <motion.div
      style={style}
      animate={{
        y: [0, 100, 0],
        x: [0, Math.random() * 20 - 10, 0],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration: Math.random() * 10 + 10,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

export default SnowParticle;