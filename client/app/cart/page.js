'use client';

import React, { useState, useEffect } from 'react';

import Process from './_components/process';
import Checkout from './_components/checkout';

import Coupon from './_components/coupon';

import CartItemList from './_components/cartItemList';

import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';

export default function CartPage({ setProcess }) {
  const { user, isAuth, isLoading } = useAuth();
  const { cart, fetchSyncData } = useCart();

  useEffect(() => {
    fetchSyncData();
  }, []);
  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const url = 'http://localhost:3005/api/cart';
  //       const res = await fetch(url, { credentials: 'include' });
  //       const json = await res.json();
  //       setData(json);
  //       setLoading(false);
  //     } catch (err) {
  //       setError(err);
  //       setLoading(false);
  //     }
  //   }
  //   fetchData();
  // }, []);

  // 以上測試區
  // if (loading) {
  // return <p>載入中</p>;
  // }

  if (isAuth) {
    return (
      <>
        <Process step="1"></Process>
        <div className="flex justify-between md:gap-6 ">
          <div className="flex flex-col w-full gap-6 min-w-0 justify-center item-center">
            <CartItemList
              key="CartProduct"
              category="CartProduct"
              data={cart}
            ></CartItemList>

            <CartItemList
              key="CartCourse"
              category="CartCourse"
              data={cart}
            ></CartItemList>

            <CartItemList
              key="CartGroup"
              category="CartGroup"
              data={cart}
            ></CartItemList>

            <Coupon></Coupon>
          </div>
          <div className="">
            <Checkout></Checkout>
          </div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
}
