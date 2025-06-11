'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi'; // FiCheckCircle 的引入移到這裡

function FeatureItem({ feature, index }) {
  const variants = {
    hidden: { opacity: 0, y: 50, rotateX: -30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.15,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      style={{ perspective: 800 }}
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-6 shadow-lg"
        whileHover={{ scale: 1.1, rotate: 15 }}
      >
        {/* 確保 feature.icon 存在再渲染 */}
        {feature.icon && <feature.icon className="text-3xl" />}
      </motion.div>
      <h3 className="font-semibold text-2xl text-gray-800 mb-3">
        {feature.title}
      </h3>
      <p className="text-gray-700 leading-relaxed text-md">{feature.desc}</p>
    </motion.div>
  );
}

export default FeatureItem;