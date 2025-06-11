'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function CTA({ href, children }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={href}
        className="px-12 py-5 bg-gradient-to-br from-red-500 via-red-600 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-extrabold rounded-full shadow-xl text-lg transition-all duration-300 active:scale-95"
      >
        {children}
      </Link>
    </motion.div>
  );
}

export default CTA;