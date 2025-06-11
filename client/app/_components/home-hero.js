'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import UseHero from '@/hooks/use-hero';

export default function HomeHero(props) {
  const containerRef = UseHero();
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center">
        {/* 視差層容器 */}
        <div className="absolute inset-0 w-full h-[120%] overflow-hidden bg-[url('/layer.png')] bg-center bg-contain bg-no-repeat">
          {/* data-parallax-layers：給 GSAP 找 */}
          <div
            ref={containerRef}
            data-parallax-layers
            className="absolute inset-0 overflow-hidden"
          >
            <Image
              src="/home-images/layer2.png"
              alt="最遠景"
              data-parallax-layer="1"
              className="absolute inset-0 w-full h-[130%] object-cover pointer-events-none -translate-y-[0%]"
              fill
            />
            <Image
              src="/home-images/layer1.png"
              alt="中間層"
              data-parallax-layer="2"
              className="absolute inset-0 w-full h-[130%] object-cover pointer-events-none -translate-y-[0%]"
              fill
            />

            <div
              data-parallax-layer="3"
              className="absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2"
            >
              <h2 className="font-corp font-extrabold text-[11vw] leading-none text-center">
                DAISKI
              </h2>
            </div>

            <Image
              src="/home-images/layer0-1.png"
              alt="最近景"
              data-parallax-layer="4"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none -translate-y-[-35%]"
              fill
            />
          </div>

          {/* 底部漸層遮罩 */}
          {/* <div className="absolute bottom-0 left-0 w-full h-[20%] bg-fade-b z-30"></div> */}
        </div>
      </section>

      {/* 空白間格 */}
      <div className="min-h-[22vh] flex items-center justify-center"></div>
    </>
  );
}
