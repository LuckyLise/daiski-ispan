// 主頁滾動視差
'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export default function UseHero() {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    // 外掛註冊
    gsap.registerPlugin(ScrollTrigger);

    // 建立 Lenis 並與 GSAP 同步
    const lenis = new Lenis();
    const raf = (time) => lenis.raf(time * 1000); // GSAP 以秒為單位
    gsap.ticker.add(raf);
    lenis.on('scroll', ScrollTrigger.update);

    // 在目前區域建立 ScrollTrigger 動畫
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      const layers = [
        { id: '1', y: 80 },
        { id: '2', y: 65 },
        { id: '3', y: 40 },
        { id: '4', y: 15 },
      ];

      layers.forEach((l, idx) => {
        tl.to(
          `[data-parallax-layer="${l.id}"]`,
          { yPercent: l.y, ease: 'none' },
          idx ? '<' : 0
        );
      });
    }, containerRef); // 限定作用域，避免把別的區塊也選進來

    // 清理
    return () => {
      ctx.revert(); // 移除所有 GSAP 動畫 & ScrollTrigger
      gsap.ticker.remove(raf); // 拔掉 Ticker
      lenis.destroy(); // 關閉 Lenis
    };
  }, []);
  return containerRef;
}
