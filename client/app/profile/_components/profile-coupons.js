'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CouponCard from '@/app/coupons/_components/coupon-card';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';

import useSWR from 'swr';
// import useSWRMutation from 'swr/dist/mutation';
import { mutate } from 'swr';

export default function ProfileCoupons(props) {
  // 在 useSWR 呼叫時，就直接傳 inline fetcher
  const {
    data,
    error,
    isLoading,
    mutate: mutateCoupons,
  } = useSWR(
    'http://localhost:3005/api/coupons/usercoupon',
    // 這就是 inline fetcher：直接用 fetch 回傳 Promise
    (url) =>
      fetch(url, {
        credentials: 'include',
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
  );
  const usercoupon = data?.usercoupon || [];

  // 讀取會員ＩＤ
  const { user, isAuth } = useAuth();
  const router = useRouter();

  // 管理每張卡的 已領取 狀態
  // const [used, setUsed] = useState([]);

  // 格式化時間
  const formatDateTime = (d) => {
    new Date(d.setHours(d.getHours() + 8));
    const [date, timeWithMs] = d.toISOString().split('T');
    const time = timeWithMs.split('.')[0]; // "HH:mm:ss"
    const hhmm = time.slice(0, 5); // 取前 5 個字 => "HH:mm"
    return `${date} ${hhmm}`;
  };

  // 狀態的判斷
  function getStatus(coupon) {
    const now = Date.now();
    // const start = new Date(coupon.startAt).getTime();
    const end = new Date(coupon.endAt).getTime();

    console.log(coupon);
    if (coupon.usedAt !== null) return '已使用';
    if (now > end) return '已過期';
    return '使用';
  }

  // 為了避免點了篩選又重新檢查一次狀態
  const couponsWithStatus = usercoupon?.map((c) => ({
    ...c,
    status: getStatus(c),
  }));

  const [selectedTarget, setSelectedTarget] = useState('全部');
  const [selectedStates, setSelectedStates] = useState();

  // 先將百分比轉換
  function getValue(c) {
    if (c.type === '現金折扣') {
      return c.amount;
    }
    if (c.type === '百分比折扣') {
      return (c.amount / 100) * c.minPurchase;
    }
  }

  // 算出每張券的最低保證折抵值;
  const values = usercoupon.map(getValue);
  const maxValue = Math.max(...values);

  // 用 filter 寫出對狀態和分類的篩選
  const filteredData = couponsWithStatus
    ?.filter((c) => {
      if (['全站', '商品', '課程'].includes(selectedTarget)) {
        return c.target === selectedTarget;
      }
      return true;
    })
    ?.filter((c) => {
      switch (selectedStates) {
        // case '最高折扣':
        // 只挑「使用」且是最高折抵值的卡
        // return c.status === '使用' && getValue(c) === maxValue;

        case '即將到期': {
          const now = Date.now();
          return (
            c.status === '使用' &&
            new Date(c.endAt).getTime() - now < 4 * 24 * 60 * 60 * 1000
          );
        }

        case '已過期':
          return c.status === '已過期';

        case '已使用':
          return c.status === '已使用';

        default:
          // '無' 或 undefined：不做任何狀態過濾，保留所有
          return c.status === '使用';
      }
    })
    .sort((a, b) => getValue(b) - getValue(a));

  // loading / error 處理
  if (isLoading) return <p className="text-center py-4">載入中…</p>;
  if (error)
    return (
      <p className="text-center py-4 text-red-600">讀取失敗：{error.message}</p>
    );

  return (
    <section className="overflow-y-auto h-dvh ">
      <CardHeader>
        <CardTitle>已領取的優惠券</CardTitle>
        <CardDescription>共 {usercoupon.length} 筆</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row sm:gap-6 gap-2 p-5 sm:justify-between flex-wrap">
        <div className="flex flex-row sm:gap-6 gap-2 flex-wrap">
          {/* 分類 */}
          <Select
            value={selectedTarget || ''}
            onValueChange={(val) => {
              if (val === '' || val === '全部') {
                setSelectedTarget(undefined);
              } else {
                setSelectedTarget(val);
              }
            }}
          >
            <SelectTrigger className="sm:w-[180px] w-[150px] ">
              <SelectValue placeholder="請選擇分類" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="全部">全部</SelectItem>
                <SelectItem value="全站">全站</SelectItem>
                <SelectItem value="商品">商品</SelectItem>
                <SelectItem value="課程">課程</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* 狀態分類 */}
          <Select
            value={selectedStates || ''}
            onValueChange={(val) => {
              if (val === '' || val === '不限') {
                setSelectedStates(undefined);
              } else {
                setSelectedStates(val);
              }
            }}
          >
            <SelectTrigger className="sm:w-[180px] w-[150px]">
              <SelectValue placeholder="請選擇分類" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="不限">不限</SelectItem>
                <SelectItem value="最高折扣">最高折扣</SelectItem>
                <SelectItem value="即將到期">即將到期</SelectItem>
                <SelectItem value="已使用">已使用</SelectItem>
                <SelectItem value="已過期">已過期</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button className="font-tw leading-p-tw cursor-pointer">
          <Link href="http://localhost:3000/coupons">領取更多優惠卷</Link>
        </Button>
      </CardContent>

      {/* 優惠劵 */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col justify-center items-center mt-5">
          <Image src="/coupon.png" alt="沒卷" width={140} height={113} />
          <p className="text-h6-tw">目前沒有更多的優惠券可以使用</p>
          <p className="color-primary-800">多多關注我們隨時領取優惠券</p>
        </div>
      ) : (
        <ul className="grid gap-5 lg:grid-cols-2  lg:mx-0 mx-2 px-5">
          {filteredData?.map((c) => {
            // 顯示狀態
            const isExpired = c.status === '已過期';
            const isUsed = c.status === '已使用';

            // 顯示時間與標籤
            const displayTime = formatDateTime(new Date(c.endAt));
            const timeLabel = '結束';

            // 按鈕文字 & disabled
            let buttonText = '使用';
            if (isUsed) buttonText = '已使用';
            if (isExpired) buttonText = '已過期';

            // 卡片與按鈕樣式
            let statusClass = '';
            if (isUsed) statusClass = 'bg-[#404040]/10';
            else if (isExpired) statusClass = 'bg-[#404040]/10';

            return (
              <li key={c.id}>
                <CouponCard
                  // 原始資料
                  type={c.type}
                  target={c.target}
                  amount={c.amount}
                  minPurchase={c.minPurchase}
                  name={c.name}
                  // 時間顯示
                  displayTime={displayTime}
                  timeLabel={timeLabel}
                  // 狀態
                  statusClass={statusClass}
                  buttonText={buttonText}
                  isUsed={isUsed}
                  isExpired={isExpired}
                  // 互動
                  onUse={() => {
                    if (c.target === '課程') {
                      router.push(`/courses`);
                    } else {
                      router.push(`/product`);
                    }
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
      <Toaster position="bottom-right" richColors />
    </section>
  );
}
