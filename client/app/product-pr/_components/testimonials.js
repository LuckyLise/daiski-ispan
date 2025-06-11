'use client';
import React, { useRef, useState, useLayoutEffect } from 'react'; // 確保 useLayoutEffect 已引入
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Testimonials 組件的代碼與您提供的版本一致，這裡不再重複粘貼，
// 只需確保它在 pages/_components/Testimonials.jsx 文件中，並且頂部有 'use client' 和正確的 imports，
// 底部有 export default Testimonials;

// 從您的原始碼複製 Testimonials 函數的完整內容到這裡
function Testimonials() {
  const testimonialsData = [
    {
      author: '鄧伯成',
      text: '這塊滑雪板讓我找回了飛翔的感覺！輕盈、靈敏、穩定，簡直是雪地上的藝術品。',
      rating: 5,
    },
    {
      author: '史婉瑜',
      text: 'Burton Feelgood Camber 極限滑雪板的設計太棒了，不僅外觀吸睛，操控性更是無可挑剔。強烈推薦給所有追求極致體驗的滑雪愛好者！',
      rating: 5,
    },
    {
      author: '李維',
      text: '作為一名滑雪教練，我試過無數雪板，Burton Feelgood Camber 極限滑雪板的表現絕對是頂尖的。它能幫助你提升技巧，享受每一次滑行。',
      rating: 4,
    },
  ];

  const sectionRef = useRef(null); 
  const dragContainerRef = useRef(null); 
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const containerRotateX = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const opacityForSectionEffect = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]); 
  const springContainerRotateX = useSpring(containerRotateX, {
    stiffness: 40,
    damping: 15,
  });

  useLayoutEffect(() => {
    const calculateConstraints = () => {
      if (dragContainerRef.current) {
        const container = dragContainerRef.current;
        const scrollableWidth = container.scrollWidth - container.clientWidth;
        const newConstraints = scrollableWidth > 0
          ? { right: 0, left: -scrollableWidth } 
          : { right: 0, left: 0 }; 
        setDragConstraints(prevConstraints => {
          if (prevConstraints.left === newConstraints.left && prevConstraints.right === newConstraints.right) {
            return prevConstraints; 
          }
          return newConstraints; 
        });
      }
    };
    calculateConstraints(); 
    window.addEventListener('resize', calculateConstraints);
    return () => {
      window.removeEventListener('resize', calculateConstraints);
    };
  }, [testimonialsData]); 

  return (
    <section
      id="testimonials"
      ref={sectionRef} 
      className="py-24 w-full bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 text-white overflow-hidden" 
    >
      <motion.div
        className="max-w-6xl mx-auto text-center mb-16 px-4" 
        style={{
          opacity: useTransform(opacityForSectionEffect, (v) => Math.max(0, v * 1.5 - 0.2)),
          y: useTransform(opacityForSectionEffect, [0, 1], [30, 0]),
        }}
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 drop-shadow-lg"> 
          使用者心聲
        </h2>
        <p className="text-lg sm:text-xl leading-relaxed drop-shadow-md"> 
          聽聽其他滑雪愛好者如何評價 Burton Feelgood Camber 極限滑雪板。
        </p>
      </motion.div>
      <motion.div
        className="relative max-w-7xl mx-auto px-6" 
        style={{ perspective: 1200 }}
      >
        <motion.div
          ref={dragContainerRef} 
          className="flex gap-6 md:gap-10 pb-10 hide-scrollbar cursor-grab active:cursor-grabbing"
          style={{
            rotateX: springContainerRotateX,
            opacity: opacityForSectionEffect, 
          }}
          drag="x" 
          dragConstraints={dragConstraints} 
          dragElastic={0.05} 
        >
          {testimonialsData.map((t, i) => (
            <motion.div
              key={i}
              className="min-w-[85vw] sm:min-w-[70vw] md:min-w-[450px] lg:min-w-[500px] bg-white/10 rounded-2xl p-8 md:p-10 flex-shrink-0 shadow-xl backdrop-blur-lg"
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0px 10px 30px rgba(0,0,0,0.3)',
              }}
              transition={{ duration: 0.3 }} 
              initial={{ opacity: 0, y: 20, rotateY: -10 }} 
              whileInView={{ 
                opacity: 1,
                y: 0,
                rotateY: 0,
                transition: { delay: i * 0.15, duration: 0.5 },
              }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="flex mb-4">
                {Array.from({ length: t.rating }).map((_, starIdx) => (
                  <svg
                    key={starIdx}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-base sm:text-lg italic mb-6 leading-relaxed">{t.text}</p> 
              <p className="font-semibold text-right text-lg sm:text-xl">— {t.author}</p> 
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
export default Testimonials;