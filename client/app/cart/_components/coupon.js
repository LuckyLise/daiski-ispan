'use client';

import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import CouponCard from '@/app/coupons/_components/coupon-card';
export default function Coupon({ isOrder = false, orderCoupon = {} }) {
  const { cart, setCart } = useCart();

  const applyCoupon = (id) => {
    const nextCoupon = cart.CartCoupon.map((coupon) => {
      if (coupon.checked === true) {
        return { ...coupon, checked: false };
      }

      if (coupon.id === id) {
        return { ...coupon, checked: true };
      } else {
        return { ...coupon, checked: false };
      }
    });

    setCart({ ...cart, CartCoupon: nextCoupon });
  };

  const sortedCoupons = [...(cart?.CartCoupon || [])].sort((a, b) => {
    return (b.canUse ? 1 : 0) - (a.canUse ? 1 : 0);
  });
  if (Object.keys(orderCoupon).length > 0) {
    console.log(new Date(orderCoupon.endAt).toLocaleString());
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark border border-border dark:border-border-dark  ">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">優惠券</CardTitle>
      </CardHeader>
      {/* 第三部分優惠券 */}
      {isOrder && Object.keys(orderCoupon).length > 0 && (
        <div className="w-full px-15">
          <CouponCard
            // 原始資料
            type={orderCoupon.type}
            target={orderCoupon.target}
            amount={orderCoupon.amount}
            minPurchase={orderCoupon.minPurchase}
            name={orderCoupon.name}
            // 時間顯示
            displayTime={new Date(orderCoupon.endAt).toLocaleString()}
            // 狀態
            buttonText={'已使用'}
            isChecked={false}
            canUse={false}
            // buttonClass={buttonClass}
            // 互動
            onUse={() => {}}
          />
        </div>
      )}
      {/* 第一部分優惠券 */}
      {!isOrder && cart?.CartCoupon?.length > 0 && (
        <div className="w-full px-15">
          <Carousel opts={{ align: 'start' }}>
            <CarouselContent className="">
              {sortedCoupons?.map((item) => {
                const id = item.id;
                const name = item.name;
                const type = item.type;
                const endAt = new Date(item.endAt).toLocaleString();
                const amount = item.amount;
                const target = item.target;
                const canUse = item.canUse;
                const isChecked = item.checked;
                const minPurchase = item.minPurchase;

                return (
                  <CarouselItem className={`2xl:basis-1/2 basis-1/1`} key={id}>
                    <CouponCard
                      // 原始資料
                      type={type}
                      target={target}
                      amount={amount}
                      minPurchase={minPurchase}
                      name={name}
                      // 時間顯示
                      displayTime={endAt}
                      // 狀態
                      buttonText={canUse ? '可使用' : '不滿足'}
                      isChecked={isChecked}
                      canUse={canUse}
                      // buttonClass={buttonClass}
                      // 互動
                      onUse={() => canUse && applyCoupon(id)}
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
      {!isOrder && cart?.CartCoupon?.length === 0 && (
        <>
          <div className="px-5">沒有優惠券</div>
        </>
      )}
      {isOrder && Object.keys(orderCoupon).length === 0 && (
        <>
          <div className="px-5">沒有使用優惠券</div>
        </>
      )}
    </Card>
  );
}
