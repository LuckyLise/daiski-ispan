'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import Process from '../_components/process';
import Checkout from '../_components/checkout';
import { FaRegCheckCircle } from 'react-icons/fa';

import Coupon from '../_components/coupon';

import CartItemList from '../_components/cartItemList';

import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function SummaryPage() {
  const [order, setOrder] = useState({});

  useEffect(() => {
    const orderId = localStorage.getItem('summaryOrderId');
    async function fetchData() {
      try {
        const url = `http://localhost:3005/api/cart/order/${orderId}`;
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        setOrder(data.order);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

  const shippingMap = {
    homeDelivery: '宅配',
    storePickup: '超商取貨',
  };
  const payMentMap = {
    paypal: 'PayPal',
    cashOnDelivery: '貨到付款',
    ecpay: 'ECPay',
  };
  console.log(order);

  return (
    <>
      {/* <Process step="3"></Process> */}
      <div className="flex justify-center items-center flex-col gap-4 py-4  bg-secondary-200 rounded-md my-10">
        <FaRegCheckCircle className="text-4xl text-primary-600" />
        <p className="text-h6-tw">訂單完成</p>
      </div>
      {order?.id && (
        <div className="flex justify-between md:gap-6  ">
          <div className="flex flex-col w-full gap-6 min-w-0 justify-center item-center">
            <Card className="shadow-lg bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark border border-border dark:border-border-dark">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  訂單資訊
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between flex-col gap-12 ">
                  <p className="text-p-tw">訂單編號：{order.id}</p>
                  <p className="text-p-tw">收件人：{order.name}</p>
                  <p className="text-p-tw">手機：{order.phone}</p>
                  <p className="text-p-tw">收貨地址：{order.address}</p>
                  <p className="text-p-tw">
                    寄送方式：{shippingMap[order.shipping]}
                  </p>
                  <p className="text-p-tw">
                    付款方式：{payMentMap[order.payment]}
                  </p>
                </div>
              </CardContent>
            </Card>
            {order?.orderProduct &&
              Object.keys(order.orderProduct).length > 0 && (
                <CartItemList
                  key="orderProduct"
                  category="orderProduct"
                  data={order}
                  isOrder={true}
                ></CartItemList>
              )}
            {order?.orderCourse &&
              Object.keys(order.orderCourse).length > 0 && (
                <CartItemList
                  key="CartCourse"
                  category="orderCourse"
                  data={order}
                  isOrder={true}
                ></CartItemList>
              )}
            {order?.orderGroup && Object.keys(order.orderGroup).length > 0 && (
              <CartItemList
                key="CartGroup"
                category="orderGroup"
                data={order}
                isOrder={true}
              ></CartItemList>
            )}
            <Coupon isOrder={true} orderCoupon={order.orderCoupon}></Coupon>
          </div>
          <div className="">
            <Checkout isOrder={true} data={order}></Checkout>
          </div>
        </div>
      )}
    </>
  );
}
