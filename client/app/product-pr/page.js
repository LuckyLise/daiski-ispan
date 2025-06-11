// pages/product-pr.jsx
'use client';
// 移除所有已拆分組件的 React, framer-motion 等重複 imports，只保留頁面本身需要的
import React from 'react'; // 通常 Next.js 頁面不需要顯式引入 React，除非使用 Hooks
import Head from 'next/head';
// Image, Link 如果只在子組件使用，這裡也可以不用引入，但 Head 來自 next/head

// 從 _components 文件夾引入所有拆分出去的組件
import HeroSection from './_components/hero-section';
import ParallaxSection from './_components/parallax-section';
import Features from './_components/features';
import Gallery from './_components/gallery';
import Testimonials from './_components/testimonials';
import FooterCTA from './_components/footer-CTA';
import { GradientDivider, WavyDivider, DiagonalDivider } from './_components/dividers';
import AnimatedPattern from './_components/animated-pattern';

// 原本在頂層定義的常量 snowParticleCount 和 bgGradient 已經移到 Hero.jsx 內部了
// 所以這裡不再需要它們

export default function ProductPR() { // 您的主頁面組件函數名保持不變
  return (
    <>
      <Head>
        <title>Burton Feelgood Camber 極限滑雪板 宣傳頁</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <main className="flex flex-col items-center overflow-hidden bg-gray-50">
        <HeroSection />
        <GradientDivider />
        <ParallaxSection
          id="durability"
          title="堅不可摧的耐用性"
          text="採用軍用級複合材料，無懼任何嚴酷考驗，讓您盡情釋放滑雪激情。"
          image="/product-pr/ProductPR5.png" // 保持圖片路徑 (相對於 public 目錄)
        />
        <AnimatedPattern />
        <Features />
        <WavyDivider />
        <ParallaxSection
          id="design"
          title="劃時代的設計美學"
          text="流線造型與人體工學完美結合，不僅賞心悅目，更提供無與倫比的操控體驗。"
          reverse
          image="/product-pr/ProductPR6.png"
        />
        <Gallery />
        <DiagonalDivider />
        <ParallaxSection
          id="control"
          title="精準靈敏的操控"
          text="先進的抓地技術與輕盈的板身設計，讓您在雪地上如魚得水，精準掌控每一次轉彎。"
          image="/product-pr/ProductPicture.jpg"
        />
        <Testimonials />
        <FooterCTA />
      </main>
    </>
  );
}