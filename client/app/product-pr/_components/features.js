'use client';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi'; // FiCheckCircle 在這裡定義，並作為 prop 傳遞
import FeatureItem from './feature-item'; // 引入同目錄下的 FeatureItem

// features 數據現在定義在此組件內部
const features = [
    {
      title: '超輕航太材質',
      desc: '極致輕盈，提供無與倫比的靈活性與速度。',
      icon: FiCheckCircle,
    },
    {
      title: '全地形適應',
      desc: '無論是陡峭山峰還是平緩雪道，都能輕鬆駕馭。',
      icon: FiCheckCircle,
    },
    {
      title: '卓越穩定性',
      desc: '高速滑行和急轉彎時，依舊保持驚人的穩定性。',
      icon: FiCheckCircle,
    },
    {
      title: '持久耐用',
      desc: '頂級材料和工藝，確保雪板經久耐用，陪伴您征戰多年。',
      icon: FiCheckCircle,
    },
  ];

function Features() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 60%', 'end 40%'],
  });
  const scaleTitle = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacityTitle = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-24 px-6 bg-gradient-to-br from-white to-slate-100"
    >
      <motion.div
        className="max-w-6xl mx-auto text-center mb-16"
        style={{ scale: scaleTitle, opacity: opacityTitle }}
      >
        <h2 className="text-5xl font-extrabold text-gray-800 mb-8 drop-shadow-md">
          核心優勢
        </h2>
        <p className="text-xl text-gray-700 leading-relaxed drop-shadow-md">
          Burton Feelgood Camber 極限滑雪板，以卓越性能重新定義滑雪體驗。
        </p>
      </motion.div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {features.map((f, i) => (
          <FeatureItem key={i} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}

export default Features;