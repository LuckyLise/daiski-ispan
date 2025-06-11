'use client';

import useSWR from 'swr';
const base = process.env.NEXT_PUBLIC_API_BASE || '';
const API_BASE = `${base}/api/profile/favorites`;
const TEST_USER_ID = 1;

// 單純用來 GET 收藏列表
const fetcher = (url) =>
  fetch(url, { credentials: 'include' }).then((res) =>
    res.ok ? res.json() : Promise.reject(res)
  );
/**
 * useFavorite
 * @param {number|string} productId
 */
export function useFavorite(productId) {
  // 帶上 userId query，測試用
  const key = `${API_BASE}?userId=${TEST_USER_ID}`;
  const { data: favList = [], mutate } = useSWR(key, fetcher);

  const id = Number(productId);
  const isFav = favList.includes(id);

  const toggle = async () => {
    // 樂觀更新：準備下一版列表
    const nextFavs = isFav ? favList.filter((x) => x !== id) : [...favList, id];
    mutate(nextFavs, false);

    try {
      if (isFav) {
        await fetch(`${API_BASE}/${id}?userId=${TEST_USER_ID}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } else {
        await fetch(`${API_BASE}?userId=${TEST_USER_ID}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: TEST_USER_ID, productId: id }),
        });
      }
      // 正式重抓一次
      mutate();
    } catch (err) {
      console.error('toggle favorite error', err);
      // 回滾
      mutate();
    }
  };

  return { isFav, toggle };
}
