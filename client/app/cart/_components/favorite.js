'use client';
import useSWR from 'swr';
import { useAuth } from '@/hooks/use-auth';
import FavoriteButton from '@/components/favorite-button';
import { useState, useEffect, useCallback } from 'react';

// 然後在export前定義fetcher(我的fetcher定義時自帶http://localhost:3005) 使用useSWR()時裡面的fetch連結不用再打一次port
// fetcher 中要包含 credentials 以處理後端抓資料時需要的登入狀態

export default function Favorite({ cart }) {
  // 1. 獲取用戶認證狀態，判斷用戶是否登入
  const { user, isAuth, isLoading } = useAuth();
  const fetcher = (url) =>
    fetch(`http://localhost:3005${url}`, { credentials: 'include' }).then((r) =>
      r.json()
    );
  // 2. 取得收藏清單
  // 只有在用戶登入 (isAuth 為 true) 時，才發送請求獲取收藏列表
  const { data: favIds = [], mutate: mutateFav } = useSWR(
    isAuth ? '/api/profile/favorites' : null,
    fetcher
  );

  // 3. 定義收藏/取消收藏商品的函式
  // 這個函式會傳遞給 FavoriteButton 的 onToggle props
  const toggleFavorite = useCallback(
    async () => {
      // 確保商品數據已載入且用戶已登入，否則不執行操作
      if (!cart || !isAuth) {
        return;
      }

      const productId = cart.CartProduct?.id; // 取得當前商品的 ID
      const isFav = favIds.includes(productId); // 判斷當前商品是否已在收藏列表中
      const next = isFav
        ? favIds.filter((favId) => favId !== productId) // 如果已收藏，則從列表中移除
        : [...favIds, productId]; // 如果未收藏，則將商品 ID 加入列表

      mutateFav(next, false); // 樂觀更新：立即更新 UI，提高用戶體驗 (第一個參數是新的數據，第二個參數 false 表示不重新驗證)

      try {
        // 根據收藏狀態發送 API 請求
        if (isFav) {
          await fetch(
            `http://localhost:3005/api/profile/favorites/${productId}`,
            { method: 'DELETE', credentials: 'include' }
          );
        } else {
          await fetch('http://localhost:3005/api/profile/favorites', {
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
    [cart.CartProduct, favIds, isAuth, mutateFav] // 依賴項：確保函式在這些值改變時重新建立
  );
  return (
    <>
      <FavoriteButton
        isFav={favIds.includes(cart.CartProduct?.id)}
        onToggle={toggleFavorite}
        variant="rect"
      />
    </>
  );
}
