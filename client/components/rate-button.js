// components/RateButton.jsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import RateDialog from './rate-dialog';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';

// 改寫 fetcher：404 回 null；其他非 2xx 則 throw
const fetcher = async (url) => {
  const res = await fetch(url, { credentials: 'include' });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch error: ${res.status} ${text}`);
  }
  return res.json();
};

export default function RateButton({ orderId, productSkuId }) {
  // —— 1. 拿到這個 SKU 的 product_id ——
  const {
    data: skuData, // { id: ..., product_id: ... }
    error: skuError,
    isLoading: skuLoading,
  } = useSWR(
    productSkuId ? `${base}/api/products/product-skus/${productSkuId}` : null,
    fetcher
  );

  // 先拿 productId（可能還沒拿到時為 undefined）
  const productId = skuData?.product_id;

  // —— 2. 拿「這張訂單+這個商品」的既有評分 ——
  // key 搭配 productId；若 productId 還 undefined，就給 null，SWR 不會發請求
  const {
    data: existingRate, // 後端若無評分會回 404 → fetcher 轉成 null
    error: rateError,
    isLoading: rateLoading,
  } = useSWR(
    productId
      ? `${base}/api/products/${productId}/orders/${orderId}/rating`
      : null,
    fetcher
  );
  console.log('商品ID:', productId);

  // Dialog 開關
  const [open, setOpen] = useState(false);

  // —— 畫面邏輯 ——
  // 1) 等待拿 SKU 時
  if (skuLoading) {
    return <span>加載中…</span>;
  }
  // 2) 拿 SKU 失敗
  if (skuError) {
    return <span className="text-red-500">無法取得商品資訊</span>;
  }
  // 如果 skuData 拿到但 productId 不存在，也不渲染按鈕
  if (!skuData) {
    return null;
  }

  // 3) 拿 Rating 狀態時，可以顯示 Loading（也可以選擇不 return，讓下方繼續 render）
  if (rateLoading) {
    return <span>加載評分…</span>;
  }
  // 4) 如果 rateError（非 404）
  if (rateError) {
    console.error('評分讀取錯誤：', rateError);
    return <span className="text-red-500">評分讀取失敗</span>;
  }

  // existingRate === null ⇔ API 回 404 ⇔ 尚未評分
  const hasRated = existingRate && typeof existingRate.rating === 'number';

  // Helper：把小數分數轉成星星顯示
  const renderStars = (score) => {
    const stars = [];
    let remaining = score;
    for (let i = 0; i < 5; i++) {
      if (remaining >= 1) {
        stars.push(<FaStar key={i} className="inline text-yellow-500" />);
        remaining -= 1;
      } else if (remaining >= 0.5) {
        stars.push(
          <FaStarHalfAlt key={i} className="inline text-yellow-500" />
        );
        remaining -= 0.5;
      } else {
        stars.push(<FaRegStar key={i} className="inline text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <>
      {hasRated ? (
        // —— 已評分過，就顯示星星＋分數 ——
        <div className="flex items-center space-x-1">
          <div>{renderStars(existingRate.rating)}</div>
          <span className="text-sm text-gray-600 dark:text-white">
            ({existingRate.rating.toFixed(1)})
          </span>
        </div>
      ) : (
        // —— 尚未評分，顯示「給予評價」按鈕 ——
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          給予評價
        </Button>
      )}

      <RateDialog
        orderId={orderId}
        productId={productId}
        open={open}
        onOpenChange={(val) => setOpen(val)}
      />
    </>
  );
}
