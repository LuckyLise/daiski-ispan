// 假設此文件為 ProductHighlightCard.jsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function ProductHighlightCard() {
  return (
    <div className="my-8 flex justify-center p-4 w-full">
      <Link
        href="/product-pr"
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl w-full"
      >
        <Card
          className="
            w-full
            rounded-2xl
            shadow-xl
            group-hover:shadow-fuchsia-500/30
            transform
            group-hover:scale-[1.02] 
            transition-all
            duration-300
            ease-in-out
            cursor-pointer
            overflow-hidden
            border-none
            bg-gradient-to-r from-neutral-800 from-0% via-purple-800 via-90% to-pink-500 to-100% 
            hover:bg-gradient-to-r hover:from-neutral-900 hover:from-0% hover:via-purple-800 hover:via-80% hover:to-pink-700 hover:to-100%
            hover:opacity-90
            flex flex-col md:flex-row
          "
        >
          {/* 圖片區域 - 左側 */}
          <div
            className="
              relative w-full md:w-2/5 lg:w-1/3 
              md:aspect-auto 
              flex-shrink-0 
            "
          >
            <Image
              src="/product-pr/ProductPR.png"
              alt="Burton Feelgood Camber Snowboard"
              layout="fill"
              objectFit="contain" // 完整顯示滑雪板
              className="hidden md:block p-2 md:p-4" // 給圖片一些內邊距
            />
          </div>

          {/* 內容區域 - 右側 */}
          <CardContent
            className="
              p-4 sm:p-6 md:p-8 /* 內邊距 */
              text-white 
              flex flex-col justify-center items-center md:items-start /* 垂直居中，水平靠左 (大屏幕) */
              text-center md:text-left /* 文字對齊 */
              flex-grow /* 占據剩餘空間 */
              
            "
          >
            <h3
              className="
                text-xl sm:text-2xl md:text-3xl /* 響應式字體大小 */
                font-bold mb-2 
                truncate md:whitespace-normal /* 大屏幕允許多行 */
                text-transparent bg-clip-text 
                bg-gradient-to-r from-cyan-300 via-pink-400 to-purple-400 
                group-hover:brightness-125 transition-all
              "
            >
              Burton Feelgood Camber
            </h3>
            <p
              className="
                text-sm sm:text-base 
                mb-4 md:mb-6 
                text-neutral-400 group-hover:text-neutral-300 transition-colors
              "
            >
              釋放雪上激情，體驗劃時代的設計美學與極致操控。
            </p>
            <div
              className="
                inline-flex items-center justify-center px-5 py-2.5 /* 按鈕 padding */
                text-sm sm:text-base font-semibold
                rounded-md
                text-neutral-50
                bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500
                hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-pink-500
                transition-all duration-300
                transform group-hover:scale-105
                shadow-md
              "
            >
              探索限定宣傳頁
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-0.5 duration-300" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
