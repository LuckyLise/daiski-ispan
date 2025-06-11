'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableRow, // 原始的 TableRow，用於 MotionTableRow 的基礎
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import Image from 'next/image';
import FavoriteButton from '@/components/favorite-button'; // 確保此路徑正確
import { useAuth } from '@/hooks/use-auth'; // 確保此路徑正確
import { motion, AnimatePresence } from 'framer-motion'; // 引入 framer-motion
import Link from 'next/link';

// API URL 常數
const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';
const API_BASE_URL = `${base}/api`;
const FAVORITES_API_URL = `${API_BASE_URL}/profile/favorites`;
const PRODUCT_API_URL = `${API_BASE_URL}/products`;

// 通用的 fetcher 函數
const fetcher = async (url) => {
  const res = await fetch(url, {
    credentials: 'include',
  });
  if (!res.ok) {
    const error = new Error('請求資料時發生錯誤。');
    try {
      error.info = await res.json();
    } catch (e) {
      error.info = res.statusText;
    }
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// 創建一個 motion 版本的 TableRow
// 這會讓 TableRow 元件能夠接收 Framer Motion 的動畫屬性，同時保留其原有樣式和功能
const MotionTableRow = motion(TableRow);

export default function ProfileWishlist() {
  const { isAuth, isLoading: isLoadingAuth } = useAuth();

  const {
    data: favoriteIds = [],
    error: favoritesError,
    isLoading: isLoadingFavoritesInitial,
    mutate: mutateFavoriteIds,
  } = useSWR(isAuth ? FAVORITES_API_URL : null, fetcher);

  const productDetailsKey =
    isAuth && favoriteIds && favoriteIds.length > 0
      ? ['productDetails', ...favoriteIds]
      : null;

  const {
    data: favoriteProductsData,
    error: productsError,
    isLoading: isLoadingProducts,
  } = useSWR(productDetailsKey, async ([_key, ...ids]) => {
    if (!ids || ids.length === 0) {
      return [];
    }
    const productDetailsPromises = ids.map(async (id) => {
      const productResponse = await fetch(`${PRODUCT_API_URL}/${id}`, {
        credentials: 'include',
      });
      if (!productResponse.ok) {
        console.warn(
          `無法獲取商品 ${id} 的詳細資訊: ${productResponse.statusText}`
        );
        return null;
      }
      const productData = await productResponse.json();
      return {
        id: productData.id,
        name: productData.name,
        price:
          productData.skus && productData.skus.length > 0
            ? productData.skus[0].price
            : 0,
        image:
          productData.images && productData.images.length > 0
            ? productData.images[0]
            : undefined,
        category: productData.category,
        brand: productData.brand,
      };
    });
    return (await Promise.all(productDetailsPromises)).filter(
      (product) => product !== null
    );
  });

  const favoriteProducts = favoriteProductsData || [];

  const toggleFavorite = useCallback(
    async (productId) => {
      if (!isAuth) {
        console.log('使用者未登入，無法切換收藏狀態');
        return;
      }
      const isCurrentlyFav = favoriteIds.includes(productId);
      const optimisticData = isCurrentlyFav
        ? favoriteIds.filter((id) => id !== productId)
        : [...favoriteIds, productId];
      mutateFavoriteIds(optimisticData, false);
      try {
        if (isCurrentlyFav) {
          await fetch(`${FAVORITES_API_URL}/${productId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } else {
          await fetch(FAVORITES_API_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: Number(productId) }),
          });
        }
        mutateFavoriteIds();
      } catch (error) {
        console.error('切換收藏狀態失敗:', error);
        mutateFavoriteIds();
      }
    },
    [favoriteIds, mutateFavoriteIds, isAuth]
  );

  const isLoading =
    isLoadingAuth ||
    (isAuth && isLoadingFavoritesInitial) ||
    (isAuth && favoriteIds.length > 0 && isLoadingProducts);

  const error = favoritesError || productsError;

  if (isLoading) {
    return <p className="text-center py-10">載入收藏商品中...</p>;
  }

  if (!isAuth) {
    return <p className="text-center py-10">請先登入以查看您的收藏清單。</p>;
  }

  if (error) {
    let errorMessage = '載入收藏商品時發生錯誤。';
    const primaryError = favoritesError || error;
    if (primaryError.status === 401) {
      errorMessage = '未授權，請先登入。';
    } else if (
      primaryError.info &&
      typeof primaryError.info.message === 'string'
    ) {
      errorMessage = primaryError.info.message;
    } else if (typeof primaryError.message === 'string') {
      errorMessage = primaryError.message;
    }
    return (
      <p className="text-center py-10 text-red-500">錯誤: {errorMessage}</p>
    );
  }

  return (
    <div className="container mx-0 xl:mx-auto py-10 overflow-y-auto h-dvh ">
      <h1 className="text-2xl font-bold text-center mb-6">我的收藏</h1>
      {/* 1. 加上 table-fixed 讓欄位寬度依 w-xx 定義 */}
      <Table className="table-fixed w-full ">
        <TableHeader>
          <TableRow className="">
            {/* 2. 第一欄固定 64px，不允許縮放 */}
            <TableHead className="w-16">圖片</TableHead>
            {/* 3. 名稱欄響應式寬度 */}
            <TableHead className="w-1/3 sm:w-1/2 md:w-1/3 px-4">
              商品名稱
            </TableHead>
            <TableHead className="text-right">價格</TableHead>
            <TableHead className="text-center w-[120px]">收藏</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <AnimatePresence>
            {favoriteProducts.map((product) => (
              <MotionTableRow
                key={product.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: { opacity: { duration: 0.2, ease: 'easeOut' } },
                }}
              >
                {/* 圖片欄：flex-none + 固定大小容器 */}
                <TableCell className="p-2">
                  <div className="flex-none h-16 w-16">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover rounded"
                        priority={false}
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        無圖片
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* 名稱欄：允許換行 */}
                <TableCell className="font-medium whitespace-normal break-words px-4">
                  <Link
                    href={`/product/${product.id}`}
                    className="hover:text-primary-500 cursor-none"
                  >
                    <p className="line-clamp-3">{product.name}</p>
                  </Link>
                </TableCell>

                <TableCell className="text-right">
                  ${product.price?.toLocaleString() ?? 'N/A'}
                </TableCell>

                <TableCell className="text-center">
                  <FavoriteButton
                    isFav={favoriteIds.includes(product.id)}
                    onToggle={() => toggleFavorite(product.id)}
                    isAuth={isAuth}
                    variant="circle"
                  />
                </TableCell>
              </MotionTableRow>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>

      {isAuth && !isLoading && !error && favoriteProducts.length === 0 && (
        <p className="text-center mt-6 text-gray-500">
          您的收藏清單目前是空的。
        </p>
      )}
    </div>
  );
}
