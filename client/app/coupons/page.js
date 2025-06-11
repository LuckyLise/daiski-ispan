'use client';

import React, { useState, useEffect } from 'react';
import CouponCard from './_components/coupon-card';
import Container from '@/components/container';
import CouponSelected from './_components/coupon-selected';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';

export default function CouponsPage(props) {
  const { fetchSyncData } = useCart();
  // 在 useSWR 呼叫時，就直接傳 inline fetcher
  const {
    data,
    error,
    isLoading,
    mutate: mutateCoupons,
  } = useSWR(
    `http://localhost:3005/api/coupons`,
    // 這就是 inline fetcher：直接用 fetch 回傳 Promise
    (url) =>
      fetch(url, {
        credentials: 'include',
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
  );
  const coupons = data?.coupons || [];

  // console.log(data);

  // 使用useSWRMutation來管理讀取post
  const { trigger } = useSWRMutation(
    'http://localhost:3005/api/coupons/claimcoupon',
    (url, { arg }) => {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 若靠 cookie 登入，一定要加
        body: JSON.stringify(arg), // arg 會是 trigger 傳進來的參數 { userId, couponId }
      }).then((r) => {
        if (!r.ok) throw new Error('領取失敗');
        return r.json(); // 後端回資料
      });
    }
  );

  // 讀取會員ＩＤ
  const { user, isAuth } = useAuth();

  // 執行一次領券
  const handleClaim = async (coupon) => {
    try {
      if (!isAuth) return alert('請先登錄');
      await trigger({ couponId: coupon.id }); // 這行才真的 fetch
      mutateCoupons();
      fetchSyncData();

      toast.success('已領取優惠券！');
    } catch (e) {
      alert(e.message);
    }
    mutateCoupons((prev) => {
      return {
        ...prev,
        coupons: prev.coupons.map((c) =>
          c.id === coupon.id ? { ...c, _used: true } : c
        ),
      };
    }, false);
  };

  // 執行多次領券
  const handleClaimAll = async () => {
    try {
      if (!isAuth) return alert('請先登錄');
      // 先判斷狀態 讓他是可領取和未領取的
      const claimable = couponsWithStatus?.filter(
        (c) => c.status === '可領取' && !c._used
      );

      // 如果沒有可以領的訊息
      if (!claimable?.length) {
        return toast.info('目前沒有可領取的優惠券');
      }
      // 領取的動作
      await Promise.all(
        claimable.map((c) => trigger({ userId: user.id, couponId: c.id }))
      );
      fetchSyncData();

      mutateCoupons();
      toast.success('已領取優惠券！');
    } catch (e) {
      alert(e.message);
    }
    mutateCoupons((prev) => {
      return {
        ...prev,
        coupons: couponsWithStatus.map((c) => {
          if (c.status === '可領取') {
            return {
              ...c,
              _used: true,
            };
          }
          return c;
        }),
      };
    }, false);
  };

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
    const start = new Date(coupon.startAt).getTime();
    const end = new Date(coupon.endAt).getTime();

    if (coupon._used) return '已領取';

    if (now < start) return '尚未開始';
    if (now > end) return '已過期';
    return '可領取';
  }

  // 為了避免點了篩選又重新檢查一次狀態
  const couponsWithStatus = coupons?.map((c) => ({
    ...c,
    status: getStatus(c),
  }));

  const [selectedTarget, setSelectedTarget] = useState();
  const [selectedStates, setSelectedStates] = useState();

  // 搜尋
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');

  // 用 filter 寫出對狀態和分類的篩選
  const filteredData = couponsWithStatus?.filter((c) => {
    const normalizedName = c.name.replace(/,/g, '').toLowerCase(); //去掉名字的標點符號
    const normalizedSearch = searchTerm.replace(/,/g, '').toLowerCase(); //去掉搜索的標點符號

    const matchesSearch = normalizedName.includes(normalizedSearch);
    if (!matchesSearch) return false;

    // 判斷狀態
    let statusPassed = false;
    switch (selectedStates) {
      case '可領取': {
        statusPassed = c.status === '可領取' || c.status === '已領取';
        break;
      }
      case '尚未開始': {
        statusPassed = c.status === '尚未開始';
        break;
      }
      case '即將到期': {
        // 定義：剩餘小時 <= 48 小時，且狀態必須是「可領取」
        const now = Date.now();
        const diffMs = new Date(c.endAt).getTime() - now;
        const hoursLeft = diffMs / (1000 * 60 * 60);
        statusPassed =
          c.status === '可領取' && hoursLeft > 0 && hoursLeft <= 72;
        break;
      }
      default: {
        // 空值或其他 → 不限狀態
        statusPassed = true;
      }
    }
    if (!statusPassed) {
      return false;
    }

    // 3. 判斷 全站 / 商品 / 課程
    let targetPassed = false;
    switch (selectedTarget) {
      case '全站':
        targetPassed = c.target === '全站';
        break;
      case '商品':
        targetPassed = c.target === '商品';
        break;
      case '課程':
        targetPassed = c.target === '課程';
        break;
      default:
        // 空字串或其他 → 全部標籤都通過
        targetPassed = true;
    }
    if (!targetPassed) {
      return false;
    }

    return true;
  });

  // 分頁
  const [page, setPage] = useState(1);
  const pageSize = 6; //每頁六筆

  // 換分類自動跳回第一頁
  useEffect(() => {
    setPage(1);
  }, [selectedTarget, filteredData.length]);

  const pageCount = Math.ceil(filteredData.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageData = filteredData.slice(startIndex, endIndex);

  // loading / error 處理
  if (isLoading) return <p className="text-center py-4">載入中…</p>;
  if (error)
    return (
      <p className="text-center py-4 text-red-600">讀取失敗：{error.message}</p>
    );

  return (
    <>
      <Container>
        <section className="flex flex-col gap-6 mt-10 mx-2 md:mx-0">
          {/* 開頭 */}
          <div className="flex flex-row items-center justify-between">
            <h5 className="font-tw text-h5-tw">領取優惠劵</h5>

            <Button className="font-tw leading-p-tw cursor-pointer  ">
              <Link href="http://localhost:3000/profile">查看我的優惠劵</Link>
            </Button>
          </div>

          {/* 領取 */}
          <div className="border border-primary-600 w-full flex flex-row p-5 items-center justify-around rounded-lg dark:border-white">
            <button className="font-tw leading-p-tw cursor-pointer">
              <a href="http://localhost:3000/game">玩遊戲獲取優惠券</a>
            </button>
            <div className="h-4 w-px border-l-2 border-secondary-800"></div>
            <button
              className="font-tw leading-p-tw cursor-pointer"
              onClick={handleClaimAll}
            >
              一鍵領取優惠劵
            </button>
          </div>

          {/* 分類 */}
          <div className="flex flex-row sm:gap-6 gap-2 sm:justify-between flex-wrap">
            <div className="flex flex-row sm:gap-6 gap-1">
              {/* 分類 */}
              <Select
                value={selectedTarget || '全部'}
                onValueChange={(val) => {
                  if (val === '') {
                    setSelectedTarget(undefined);
                  } else {
                    setSelectedTarget(val);
                  }
                }}
              >
                <SelectTrigger className="sm:w-[180px] w-[150px]">
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
                value={selectedStates || '不限'}
                onValueChange={(val) => {
                  if (val === '') {
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
                    <SelectItem value="可領取">可領取</SelectItem>
                    <SelectItem value="即將到期">即將到期</SelectItem>
                    <SelectItem value="尚未開始">尚未開始</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchTerm(inputValue);
                  setPage(1);
                }}
              >
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputValue(val);
                    if (val === '') {
                      setSearchTerm('');
                      setPage(1);
                    }
                  }}
                  placeholder="輸入優惠券名稱關鍵字"
                  className="w-full dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                />
              </form>
            </div>
          </div>

          <hr />
        </section>

        {/* 優惠劵 */}
        {filteredData.length === 0 ? (
          <div className="flex flex-col justify-center items-center mt-15">
            <Image src="/coupon.png" alt="沒卷" width={140} height={113} />
            <p className="text-h6-tw">目前沒有更多的優惠券可以領取</p>
            <p className="color-primary-800">多多關注我們隨時領取優惠券</p>
          </div>
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2 my-10 lg:mx-0 mx-1">
            {pageData?.map((c) => {
              // 顯示狀態
              const isUpcoming = c.status === '尚未開始';
              const isExpired = c.status === '已過期';
              const isUsed = c.status === '已領取';

              // 顯示時間與標籤
              const displayTime = formatDateTime(
                new Date(isUpcoming ? c.startAt : c.endAt)
              );
              const timeLabel = isUpcoming ? '開始' : '結束';

              // 按鈕文字 & disabled
              let buttonText = '領取';
              if (isUsed) buttonText = '已領取';
              else if (isUpcoming) buttonText = '尚未開始';
              else if (isExpired) buttonText = '已過期';
              const disabled = isExpired || isUsed || isUpcoming;

              // 卡片與按鈕樣式
              let statusClass = '';
              if (isUsed) statusClass = 'bg-[#404040]/10';
              else if (isUpcoming) statusClass = '';
              else if (isExpired) statusClass = 'bg-[#404040]/10';

              const buttonClass = disabled
                ? 'bg-secondary-800 text-white cursor-default'
                : 'hover:bg-secondary-800 hover:text-white';

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
                    buttonClass={buttonClass}
                    buttonText={buttonText}
                    isExpired={isExpired}
                    _used={isUsed}
                    isUpcoming={isUpcoming}
                    // 互動
                    onUse={() => handleClaim(c)}
                    torn={c._used}
                  />
                </li>
              );
            })}
          </ul>
        )}

        {/* 分頁 */}
        <Pagination className="mb-10">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum} onClick={() => setPage(pageNum)}>
                  <PaginationLink href="#">{pageNum}</PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
                disabled={page === pageCount}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Container>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
