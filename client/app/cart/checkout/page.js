'use client';
// FIXME 要把資料表單放入localStore嗎?方便重新整理的時候保留資料
import React, { useState, useEffect } from 'react';
import {
  useForm,
  FormProvider,
  useWatch,
  useFormContext,
} from 'react-hook-form';

import Process from '../_components/process';
import ShippingMethod from './_components/shippingMethod';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { useCart } from '@/hooks/use-cart';

import PaymentOption from './_components/paymentOption';
import { produce } from 'immer';

export default function CheckoutPage() {
  const { cart, setCart, onClear } = useCart();
  const router = useRouter();

  const methods = useForm({
    defaultValues: {
      city: '',
      district: '',
      zipCode: '',
      addressDetail: '',
      shouldUnregister: true,
    },
  });

  const onSubmit = async (data) => {
    let nextCart = produce(cart, (draft) => {
      draft.shippingInfo.shippingMethod = data.shippingMethod;
      draft.userInfo.name = data.name;
      draft.userInfo.phone = data.phone;
      draft.payment = data.payment;
    });

    if (data.shippingMethod === 'homeDelivery') {
      nextCart = produce(nextCart, (draft) => {
        draft.shippingInfo.address = data.city + data.district;
        draft.shippingInfo.zipCode = data.zipCode;
      });
    } else if (data.shippingMethod === 'storePickup') {
      nextCart = produce(nextCart, (draft) => {
        draft.shippingInfo.storename = JSON.parse(
          localStorage.getItem('store711')
        ).storename;
        draft.shippingInfo.address = JSON.parse(
          localStorage.getItem('store711')
        ).storeaddress;
      });
    }
    // 設定到狀態
    setCart(nextCart);

    console.log('更新後的車車:');
    console.log(nextCart);

    const orderData = {
      shipping: nextCart.shippingInfo.shippingMethod,
      payment: nextCart.payment,
      name: nextCart.userInfo.name,
      phone: nextCart.userInfo.phone,
      address: nextCart.shippingInfo.address,
      amount: nextCart.amount,
      couponId: nextCart.couponId,
      CartGroup: nextCart.CartGroup,
      CartCourse: nextCart.CartCourse,
      CartProduct: nextCart.CartProduct,
    };
    console.log('訂單:');
    console.log(orderData);
    // 建立訂單
    const responseOrder = await fetch('http://localhost:3005/api/cart/order', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    const order = await responseOrder.json();

    localStorage.setItem('summaryOrderId', order.data);

    // 揪團付錢
    if (cart.CartGroup[0]?.id) {
      const responseGroupPaid = await fetch(
        `http://localhost:3005/api/group/members/${cart.CartGroup[0].id}/payment`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const couponUsedId = cart.CartCoupon.find((item) => item.checked)?.id;

    // 寫入已使用優惠券時間
    if (couponUsedId) {
      const responseCouponUsed = await fetch(
        `http://localhost:3005/api/cart/couponUsed/${couponUsedId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        }
      );
    }

    if (data.payment === 'paypal') {
      router.push('/cart/checkout/paypal');
    } else if (data.payment === 'ecpay') {
      // 清空購物車
      onClear();
      // 可傳金額當 query 參數
      router.push(
        `http://localhost:3005/api/cart/ecpay-test-only?amount=${orderData.amount}`
      );
    } else {
      // 清空購物車
      onClear();
      router.push('/cart/summary');
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <Process step="2"></Process>
        <Card className="shadow-lg bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark border border-border dark:border-border-dark">
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {/* 寄送方式 */}
            <CardHeader>
              <CardTitle className="text-lg font-semibold">寄送方式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col w-full p-12 gap-5  ">
                <ShippingMethod></ShippingMethod>
              </div>
            </CardContent>
            {/* 付款方式 */}
            <CardHeader>
              <CardTitle className="text-lg font-semibold">付款方式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col w-full p-12 gap-5  ">
                {/* 貨到付款 */}
                <PaymentOption
                  optionName="貨到付款"
                  radioValue="cashOnDelivery"
                  // onChange={() => setSelectedPayment('cashOnDelivery')}
                ></PaymentOption>

                {/* Paypal */}
                <PaymentOption
                  optionName="PayPal"
                  radioValue="paypal"
                  // onChange={() => setSelectedPayment('paypal')}
                ></PaymentOption>

                {/* 綠界 */}
                <PaymentOption
                  optionName="綠界"
                  radioValue="ecpay"
                  // checked={selectedPayment === 'ecpay'}
                  // onChange={() => setSelectedPayment('ecpay')}
                ></PaymentOption>

                {methods.formState.errors.payment && (
                  <p className="text-red">請選擇一個配送方式</p>
                )}
              </div>
              {/* FIXME改顏色 */}

              <div className="flex justify-end ">
                <Button type="submit" className="px-6 py-2.5 ">
                  確認付款
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </FormProvider>
    </>
  );
}
