'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Card({
  title = '',
  imgSrc = '',
  href = '',
  reverse = false,
  className = '',
  textClassName = '',
}) {
  return (
    <li
      className={[
        'w-full h-auto flex flex-row items-center',
        reverse ? 'flex-row-reverse' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* 文字區塊 */}
      <div
        className={['w-[35%] flex flex-col items-center', textClassName]
          .filter(Boolean)
          .join(' ')}
      >
        <h3 className="md:text-h5-tw  sm:mb-4 mb-1 font-tw">{title}</h3>
        <Button className=" md:px-4 md:py-2 p-1">
          <Link href={href}>了解更多</Link>
        </Button>
      </div>

      {/* 圖片區塊 */}
      <div className="relative w-[65%] xl:h-[40rem]">
        <Image
          src={imgSrc}
          alt={title}
          width={1000}
          height={560}
          className={`object-cover  ${reverse ? 'mr-auto' : 'ml-auto'}`}
          priority
        />
      </div>
    </li>
  );
}
