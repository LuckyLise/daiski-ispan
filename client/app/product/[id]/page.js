'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/hooks/use-auth';
import FavoriteButton from '@/components/favorite-button';
import Link from 'next/link';
import Image from 'next/image';
import ProductAddCartButton from '../_components/product-add-cart-button';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Minus,
  Plus,
} from 'lucide-react';
import { FaStar } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useParams } from 'next/navigation';
import Container from '@/components/container';

// Swiper React integration
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Thumbs } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/mousewheel';
import 'swiper/css/thumbs';

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);
  return isMobile;
}

const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';
const fetcher = (url) =>
  fetch(`${base}${url}`, { credentials: 'include' }).then((r) => r.json());

export default function ProductDetail() {
  const isMobile = useIsMobile();
  const { id } = useParams();
  // 1. 獲取商品詳細資訊
  const { data: product, error } = useSWR(
    id ? `/api/products/${id}` : null,
    fetcher
  );

  // 2. 獲取用戶認證狀態，判斷用戶是否登入
  const { user, isAuth, isLoading: authLoading } = useAuth();

  // 3. 取得收藏清單
  // 只有在用戶登入 (isAuth 為 true) 時，才發送請求獲取收藏列表
  const { data: favIds = [], mutate: mutateFav } = useSWR(
    isAuth ? '/api/profile/favorites' : null,
    fetcher
  );

  const thumbsSwiperRef = useRef(null);
  const mainSwiperRef = useRef(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Initialize default size & quantity
  useEffect(() => {
    if (product && selectedSize === null) {
      const first = product.skus.find((s) => s.stock > 0);
      if (first) {
        setSelectedSize(first.sizeId);
        setQuantity(1);
      }
    }
  }, [product, selectedSize]);

  //清理
  useEffect(() => {
    // 在 effect 作用域內 snapshot 一次
    const thumbsSwiper = thumbsSwiperRef.current;
    const mainSwiperInstance = mainSwiperRef.current?.swiper;

    return () => {
      // cleanup 時用先前 snapshot 的值
      if (thumbsSwiper && !thumbsSwiper.destroyed) {
        thumbsSwiper.destroy();
      }
      if (mainSwiperInstance && !mainSwiperInstance.destroyed) {
        mainSwiperInstance.destroy();
      }
    };
  }, []);

  // 4. 定義收藏/取消收藏商品的函式
  // 這個函式會傳遞給 FavoriteButton 的 onToggle props
  const toggleFavorite = useCallback(
    async () => {
      // 確保商品數據已載入且用戶已登入，否則不執行操作
      if (!product || !isAuth) {
        return;
      }

      const productId = product.id; // 取得當前商品的 ID
      const isFav = favIds.includes(productId); // 判斷當前商品是否已在收藏列表中
      const next = isFav
        ? favIds.filter((favId) => favId !== productId) // 如果已收藏，則從列表中移除
        : [...favIds, productId]; // 如果未收藏，則將商品 ID 加入列表

      mutateFav(next, false); // 樂觀更新：立即更新 UI，提高用戶體驗 (第一個參數是新的數據，第二個參數 false 表示不重新驗證)

      try {
        // 根據收藏狀態發送 API 請求
        if (isFav) {
          await fetch(`${base}/api/profile/favorites/${productId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } else {
          await fetch(`${base}/api/profile/favorites`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });
        }
        mutateFav(); // 重新驗證數據：API 請求成功後，重新從伺服器獲取最新數據，確保數據一致性
      } catch (e) {
        console.error('收藏操作失敗:', e);
        mutateFav(); // 錯誤時回滾：如果 API 請求失敗，回滾到之前的數據狀態
      }
    },
    [product, favIds, isAuth, mutateFav] // 依賴項：確保函式在這些值改變時重新建立
  );

  if (error) return <p>載入失敗：{error.message}</p>;
  if (!product) return <p>載入中…</p>;

  const {
    images,
    skus,
    name,
    introduction,
    spec,
    brand,
    category,
    related = [],
  } = product;
  const currentSku = skus.find((s) => s.sizeId === selectedSize) || {};
  const price = currentSku.price ?? 0;
  const maxStock = currentSku.stock ?? 0;

  return (
    <Container className="z-10 pt-10 pb-20 m-4 xl:mx-auto ">
      {/* ((縮圖區+主圖區) + 詳細資訊區) + 商品介紹區 */}
      <div className="flex flex-col gap-8 xl:p-4">
        {/* (縮圖區+主圖區) + 詳細資訊區 */}
        <div className="flex flex-col lg:flex-row justify-between xl:justify-around">
          {/* 縮圖區 + 主圖區*/}
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* 縮圖區 */}
            <div
              className={` flex gap-2 items-center
    ${isMobile ? 'flex-row overflow-auto' : 'flex-col'}`}
            >
              <button
                className="p-1 hover:text-blue-500 transition-colors"
                onClick={() => thumbsSwiperRef.current?.slidePrev()}
              >
                {isMobile ? (
                  <ChevronLeft className="w-6 h-6 cursor-none" />
                ) : (
                  <ChevronUp className="w-6 h-6 cursor-none" />
                )}
              </button>

              <Swiper
                onSwiper={(swiper) => (thumbsSwiperRef.current = swiper)}
                direction={isMobile ? 'horizontal' : 'vertical'}
                slidesPerView={Math.min(4, images.length)}
                spaceBetween={8}
                mousewheel={{ forceToAxis: true }}
                modules={[Mousewheel, Thumbs]}
                watchSlidesProgress
                freeMode={images.length <= 4}
                className={`
        ${isMobile ? 'h-[80px] w-full' : 'h-[344px] w-[80px]'}
      `}
              >
                {images.map((src, idx) => (
                  <SwiperSlide key={idx} className="max-h-[80px]">
                    <button
                      onClick={() => {
                        thumbsSwiperRef.current?.slideTo(idx);
                        mainSwiperRef.current?.swiper.slideTo(idx);
                      }}
                      className={`border w-full h-full  aspect-square cursor-none  ${
                        thumbsSwiperRef.current?.activeIndex === idx
                          ? 'border-blue-500'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex w-full h-full">
                        <Image
                          src={src}
                          alt={`${name} 小圖 ${idx + 1}`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                className="p-1 hover:text-blue-500 transition-colors"
                onClick={() => thumbsSwiperRef.current?.slideNext()}
              >
                {isMobile ? (
                  <ChevronRight className="w-6 h-6 cursor-none" />
                ) : (
                  <ChevronDown className="w-6 h-6 cursor-none" />
                )}
              </button>
            </div>

            {/* 主圖區 */}
            <div className="flex justify-center border w-full  max-w-[400px]  lg:max-w-[300px]  xl:max-w-[400px] aspect-square mx-auto rounded-md items-center">
              <Swiper
                ref={mainSwiperRef}
                modules={[Thumbs]}
                className="main-swiper  w-full  lg:max-w-[300px]  xl:max-w-[400px] aspect-square"
                thumbs={{ swiper: thumbsSwiperRef.current }}
                direction={isMobile ? 'horizontal' : 'vertical'}
                onSlideChange={(swiper) => {
                  thumbsSwiperRef.current?.slideTo(swiper.activeIndex);
                }}
              >
                {images.map((src, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="w-full   lg:max-w-[300px]  xl:max-w-[400px] aspect-square">
                      <Image
                        src={src}
                        alt={`${name} 圖片 ${idx + 1}`}
                        width={10}
                        height={10}
                        className="object-contain w-full  lg:max-w-[300px]  xl:max-w-[400px] aspect-square"
                        priority={idx === 0}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* 詳細資訊 */}
          <div className="flex flex-col gap-4 p-4">
            <p className="text-black dark:text-white mb-2">
              {category?.name} | {brand?.name}
            </p>
            <h1 className="text-2xl font-medium text-black dark:text-white mb-4">
              {name}
            </h1>
            <p className="text-xl font-bold text-red-500 mb-6">
              NT$ {price.toLocaleString()}
            </p>

            {product.totalRatings > 0 ? (
              <div className="flex items-center mb-4">
                <FaStar className="text-yellow-500 mr-1" />
                <span className="text-lg font-semibold">
                  {product.averageRating}
                </span>
                <span className="text-gray-500 dark:text-white ml-1">
                  ({product.totalRatings})
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-white mb-4">
                尚無評價
              </p>
            )}

            {/* 尺寸選擇（僅在有尺寸時顯示） */}
            {skus.some((s) => s.sizeId !== null) && (
              <div className="mb-6">
                <p className="text-black dark:text-white mb-2">尺寸</p>
                <div className="flex gap-2">
                  {skus
                    .filter((s) => s.sizeId !== null)
                    .map((s) => {
                      const isSel = s.sizeId === selectedSize;
                      return (
                        <button
                          key={s.skuId}
                          onClick={() =>
                            s.stock > 0 && setSelectedSize(s.sizeId)
                          }
                          disabled={s.stock === 0}
                          className={`
                w-12 h-10 border flex items-center justify-center text-sm rounded
                ${isSel ? 'bg-primary-600 text-white' : 'border-gray-200 text-black dark:text-white'}
                ${
                  s.stock === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-primary-500 hover:text-white'
                }
                transition-colors duration-150`}
                        >
                          {s.sizeName}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 庫存顯示（無論有無尺寸） */}
            <p className="mt-2 text-sm text-black dark:text-white ">
              庫存：{maxStock} 件
            </p>

            {/* 數量調整 */}
            <div className="mb-6 flex items-center gap-2">
              <p className="text-black dark:text-white ">數量</p>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 border flex items-center justify-center"
                >
                  <Minus />
                </button>
                <input readOnly value={quantity} className="w-16 text-center" />
                <button
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  className="w-10 h-10 border flex items-center justify-center"
                >
                  <Plus />
                </button>
              </div>
            </div>

            {/* 動作按鈕 */}
            <div className="grid grid-cols-3 gap-4">
              {/* <Button className="h-12 bg-blue-800 text-white">
                加入購物車
              </Button> */}

              <ProductAddCartButton
                skuId={currentSku.skuId}
                quantity={quantity}
                price={price} // 從 ProductDetail 的 price 變數取得
                name={name} // 從 ProductDetail 的 name 變數取得
                imageUrl={
                  images && images.length > 0 ? images[0] : '/deadicon.png'
                } // 使用第一張圖片，或提供一個預設圖片路徑
                size={currentSku.sizeName} // 從 currentSku 取得尺寸名稱
                isAuth={isAuth}
              />
              {/* 使用你的 FavoriteButton 元件 */}
              <FavoriteButton
                // isFav: 判斷當前商品 ID 是否存在於收藏列表中
                isFav={favIds.includes(product.id)}
                // onToggle: 點擊按鈕時觸發的函式
                onToggle={toggleFavorite}
                // variant: 設定按鈕樣式為 'rect' (長方形)
                variant="rect"
                // className: 提供額外的 Tailwind CSS 類名來設定按鈕的寬度和高度
                isAuth={isAuth}
              />
              {/* <Button className="h-12 bg-blue-500 text-white">
                分享 <Share2 className="ml-1" />
              </Button> */}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 介紹 & 規格 Tabs */}

          <Tabs
            defaultValue="introduction"
            className="flex flex-col mt-12 w-full md:w-2/3 border rounded-md p-4"
          >
            <TabsList className="flex w-1/2">
              <TabsTrigger value="introduction">介紹</TabsTrigger>
              <TabsTrigger value="spec">規格</TabsTrigger>
            </TabsList>

            <TabsContent value="introduction">
              <div
                // 1. 設定父元素在亮色模式下的文字顏色 (例如 text-gray-900)
                // 2. 設定父元素在暗色模式下的文字顏色 (例如 dark:text-white)
                // 3. 關鍵：讓所有子元素 (除了 style 和 script 標籤) 強制繼承父元素的文字顏色
                className="mt-4 leading-loose text-black dark:text-white [&_*:not(style):not(script)]:!text-inherit"
                dangerouslySetInnerHTML={{ __html: introduction }}
              />
            </TabsContent>

            <TabsContent value="spec">
              <p className="whitespace-pre-wrap mt-4 leading-loose">{spec}</p>
            </TabsContent>
          </Tabs>

          {/* 相關商品區 */}
          {related.length > 0 && (
            <section className="mt-12 w-full md:w-1/3 border rounded-md p-4">
              <h2 className="text-xl font-semibold mb-4">相關商品</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((item) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 80, damping: 10 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <Link href={`/product/${item.id}`}>
                      <Card className="cursor-none hover:shadow-lg transition-shadow">
                        {/* 小尺寸縮圖區 */}
                        <CardHeader className="w-full aspect-[4/3] overflow-hidden rounded-xl">
                          <Image
                            src={item.image || '/placeholder.jpg'}
                            alt={item.name}
                            width={10}
                            height={10}
                            className="w-full h-full object-cover transition duration-300 hover:scale-110"
                          />
                        </CardHeader>

                        {/* 內容區：名字 + 價格 */}
                        <CardContent className="p-2">
                          <CardTitle className="text-sm font-medium line-clamp-2 hover:text-primary-500">
                            {item.name}
                          </CardTitle>
                          <p className="text-sm font-semibold text-red-500 mt-1">
                            NT$ {item.price.toLocaleString()}
                          </p>
                        </CardContent>

                        {/* 可選：如果有必要可以放額外 footer */}
                        {/* <CardFooter className="p-2 pt-0">
              <p className="text-xs text-gray-500">評價：{item.rating || '—'}</p>
            </CardFooter> */}
                      </Card>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Container>
  );
}
