'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

function Gallery() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacityTitle = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );
  const yTitle = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [50, 0, 0, -50]
  );

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <section
      id="gallery"
      ref={ref}
      className="py-24 w-full bg-slate-50 overflow-hidden"
    >
      <motion.div
        className="max-w-6xl mx-auto text-center mb-16"
        style={{ opacity: opacityTitle, y: yTitle }}
      >
        <h2 className="text-5xl font-extrabold text-gray-800 mb-8 drop-shadow-md">
          產品展示
        </h2>
        <p className="text-xl text-gray-700 leading-relaxed drop-shadow-md">
          多角度欣賞 Burton Feelgood Camber 極限滑雪板 的精湛工藝與設計細節。
        </p>
      </motion.div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Image
              src={`/product-pr/ProductPR${i}.jpg`} // 保持圖片路徑
              alt={`產品圖 ${i}`}
              width={600}
              height={400}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Gallery;