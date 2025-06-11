'use client';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CTA from './CTA'; // 引入同目錄下的 CTA

function FooterCTA() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);

  return (
    <motion.section
      ref={ref}
      style={{ y, opacity }}
      className="py-24 w-full bg-gray-100 flex justify-center items-center"
    >
      <div className="max-w-3xl text-center px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
          準備好體驗極限了嗎？
        </h2>
        <p className="text-lg md:text-xl text-gray-700 mb-12">
          Burton Feelgood Camber
          極限滑雪板將帶您進入前所未有的滑雪境界。立即行動，開啟您的雪地冒險之旅！
        </p>
        <CTA href="/product/45">立即購買</CTA>
      </div>
    </motion.section>
  );
}

export default FooterCTA;