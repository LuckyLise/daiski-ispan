'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function Loading() {
  return (
    <AnimatePresence>
      <motion.div
        key="loading-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      >
        {/* 旋轉動畫 */}
        <motion.div
          className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
