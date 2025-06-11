// 輪播圖片與遮罩
'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Autoplay, Pagination, Navigation } from 'swiper/modules';

export default function Slide() {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      className="mySwiper relative w-full h-[573px]"
    >
      <SwiperSlide>
        <Image
          src="/home-images/productslide1.jpg"
          alt="最新商品的圖片1"
          className="object-cover "
          fill
        />
      </SwiperSlide>
      <SwiperSlide>
        {' '}
        <Image
          src="/home-images/productslide5.jpg"
          alt="最新商品的圖片5"
          className="object-cover "
          fill
        />
      </SwiperSlide>
      <SwiperSlide>
        {' '}
        <Image
          src="/home-images/productslide6.png"
          alt="最新商品的圖片6"
          className="object-cover"
          fill
        />
      </SwiperSlide>
      <SwiperSlide>
        {' '}
        <Image
          src="/home-images/productslide7.jpg"
          alt="最新商品的圖片7"
          className="object-cover"
          fill
        />
      </SwiperSlide>
      <div className="absolute inset-0 bg-[#D2E1EA]/60 z-[1] pointer-events: none" />
    </Swiper>
  );
}
