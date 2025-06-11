'use client';

import React, { useState, useEffect } from 'react';
import { RiCoupon2Line } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import './styles/coupon.css';

export default function CouponCard({
  // 資料相關
  type,
  target,
  amount,
  minPurchase,
  name,
  displayTime, // 已格式化好的「YYYY-MM-DD hh:mm:ss」
  timeLabel, // '開始' 或 '結束'
  buttonText, // 按鈕文字
  isUpcoming,
  isExpired,
  isUsed,
  isChecked,
  canUse,

  onUse, // 點擊「領取」時觸發
  // torn, // 這張券已被領（要撕票）
  _used,
}) {
  const [started, setStarted] = useState(false); // 動畫是否已啟動
  const [played, setPlayed] = useState(false); // 是否已播完

  // 撕票
  const [tearAnim, setTearAnim] = useState(false);
  // const [torn, setTorn] = useState(false);
  useEffect(() => {
    if (_used) {
      setTearAnim(true);
    }
  }, [_used]);

  // 模擬「領取」：按一下按鈕把 torn 變 true
  // const handleClick = () => setTorn(true);

  // 第一次滑入才啟動
  const handleEnter = () => {
    if (!started && !played) setStarted(true);
  };

  // 動畫播完 → 標記已播放、並移除動畫
  const handleAnimEnd = () => {
    setStarted(false);
    setPlayed(true);
  };

  // 按鈕狀況判斷

  const checked = isChecked;

  let isDisabled =
    _used || isExpired || isUpcoming || isUsed || checked === false
      ? !canUse
      : false;

  // 背景圖片
  const getBgClass = (target) => {
    switch (target) {
      case '全站':
        return "bg-[url('/coupon/1.jpg')]";
      case '商品':
        return "bg-[url('/coupon/5.png')]";
      case '課程':
        return "bg-[url('/coupon/2.jpg')]";
    }
  };

  const bgClass = getBgClass(target);

  return (
    <>
      {/* 單一卡片 (item) */}
      <div className="relative flex group " onMouseEnter={handleEnter}>
        {/* 左側日期 (date) */}
        <div
          className={
            'relative flex w-1/5 sm:w-1/4 md:w-1/3 flex-col items-center justify-center sm:p-8  p-2' +
            'border-r-2 border-dotted border-gray-400 bg-secondary-200 ' +
            (_used
              ? tearAnim
                ? 'animate-[tearoffLeftStay_1.2s_ease-in-out_forwards]'
                : 'translate-x-[-28px]' // 動畫播完固定在外側
              : '')
          }
          onAnimationEnd={() => setTearAnim(false)}
        >
          {/* 上下圓形缺口 (decorative circles) */}
          <span className="absolute -top-3 -right-4 h-6 w-6 rounded-full dark:bg-background bg-white "></span>
          <span className="absolute -bottom-3 -right-4 h-6 w-6 rounded-full dark:bg-background bg-white"></span>

          <RiCoupon2Line className="text-[35px] dark:text-background" />
          <p className="mt-1 sm:text-tw-h6 text-gray-700">{target}</p>
        </div>

        {/* 右側內容 (content) */}
        <div
          className={`relative w-4/5 sm:w-3/4 md:w-2/3 sm:p-6 p-2 ${bgClass} bg-cover`}
        >
          {/* 反光 */}
          <div
            onAnimationEnd={handleAnimEnd}
            className={
              played
                ? 'holo-strip absolute inset-0 opacity-100'
                : started
                  ? 'holo-strip absolute inset-0 opacity-100 animate-[holo_3s_ease-in-out_forwards]'
                  : 'holo-strip absolute inset-0 opacity-0'
            }
          />
          {/* 半透明遮罩 (overlay) */}
          <div className="absolute  inset-0 sm:bg-black/0 sm:bg-gradient-to-r sm:from-black/60 sm:via-black/30 sm:to-black/0 bg-black/50 "></div>

          {/* 內容文字 */}
          <div className="relative text-white ">
            <div className="space-y-1 pr-2 flex flex-col">
              <p className="font-tw leading-p-tw text-white line-clamp-2">
                {name}
              </p>
              <p className=" leading-p-tw text-white truncate ">
                {type} {amount.toLocaleString()}
              </p>
              <p className="font-tw leading-p-tw text-white truncate ">
                結帳金額滿 {minPurchase.toLocaleString()} 使用
              </p>
            </div>

            {/* 按鈕 (button) */}
            <div className="flex justify-between  sm:mt-5">
              <p
                className={
                  isUpcoming
                    ? 'sm:text-h6-tw text-white truncate '
                    : 'sm:text-h6-tw text-white truncate '
                }
              >
                {displayTime} {timeLabel}
              </p>
              <Button
                data-tear
                className={`
                 text-white 
                ${
                  isDisabled
                    ? 'bg-gray-400 opacity-60 cursor-default'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }
                ${
                  checked
                    ? 'bg-primary-500 '
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }
              `}
                onClick={(e) => {
                  onUse(e);
                }}
                disabled={isDisabled}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
