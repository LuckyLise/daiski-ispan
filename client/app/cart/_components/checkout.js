'use client';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react'; // lucide-react 圖示庫
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Checkout({ isOrder = false, data = {} }) {
  const { cart, setCart } = useCart();

  const [checkedCoupon, setCheckedCoupon] = useState(null);
  // couponDiscount
  let couponDiscount = 0;
  let amount = 0;
  let totalProduct = 0;
  let totalCourse = 0;
  let totalGroup = 0;
  console.log(data);
  // 第一部分
  if (!isOrder) {
    // 三項價格
    totalProduct = cart?.CartProduct?.reduce((acc, product) => {
      acc += product.price * product.quantity;
      return acc;
    }, 0);

    totalCourse = cart?.CartCourse?.reduce((acc, course) => {
      acc += course.price;
      return acc;
    }, 0);

    totalGroup = cart?.CartGroup?.reduce((acc, group) => {
      acc += group.price;
      return acc;
    }, 0);

    // 優惠券
    if (checkedCoupon && checkedCoupon.type === '現金折扣') {
      couponDiscount = checkedCoupon.amount;
    } else if (checkedCoupon && checkedCoupon.type === '百分比折扣') {
      couponDiscount = Math.floor(
        ((totalProduct + totalCourse) * checkedCoupon.amount) / 100
      );
    }

    amount = totalProduct + totalCourse + totalGroup - couponDiscount;
  } else {
    // 第三部分
    totalProduct = data?.orderProduct?.reduce((acc, product) => {
      acc += product.price * product.quantity;
      return acc;
    }, 0);

    totalCourse = data?.orderCourse?.reduce((acc, course) => {
      acc += course.price;
      return acc;
    }, 0);

    totalGroup = data?.orderGroup?.reduce((acc, group) => {
      acc += group.price;
      return acc;
    }, 0);

    if (data?.orderCoupon && data.orderCoupon.type === '現金折扣') {
      couponDiscount = data?.orderCoupon.amount;
    } else if (data?.orderCoupon && data.orderCoupon.type === '百分比折扣') {
      couponDiscount = Math.floor(
        ((totalProduct + totalCourse) * data.orderCoupon.amount) / 100
      );
    }

    amount = totalProduct + totalCourse + totalGroup - couponDiscount;
  }
  useEffect(() => {
    setCheckedCoupon(null);
    cart?.CartCoupon?.forEach((coupon) => {
      if (coupon.checked) {
        setCheckedCoupon(coupon);
      }
    });
  }, [cart]);

  const handleCheckout = () => {
    console.log(amount);
    setCart({
      ...cart,
      amount,
      couponId: checkedCoupon?.id ? checkedCoupon.id : null,
    });
  };

  // 將內容取出，電腦版不要手風琴，手機版才有
  function checkoutContent() {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <p className="text-p-tw">商品原價總金額</p>
          <p className="text-p-tw">${totalProduct?.toLocaleString()}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-p-tw">課程原價總金額</p>
          <p className="text-p-tw">${totalCourse?.toLocaleString()}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-p-tw">揪團總金額</p>
          <p className="text-p-tw">${totalGroup?.toLocaleString()}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-p-tw">折扣金額(不含揪團)</p>
          <p className="text-p-tw">
            -
            {!isOrder &&
              (checkedCoupon?.type === '百分比折扣'
                ? `${checkedCoupon.amount}%($${couponDiscount})`
                : `$${couponDiscount}`)}
            {isOrder &&
              (data?.orderCoupon?.type === '百分比折扣'
                ? `${data?.orderCoupon.amount}%($${couponDiscount})`
                : `$${couponDiscount}`)}
          </p>
        </div>
        <div className="flex justify-between">
          <h6 className="text-p-tw font-bold">結帳金額</h6>
          <p className="text-red">${amount.toLocaleString()}</p>
        </div>

        {!isOrder && amount > 0 && (
          <Link
            href={'/cart/checkout'}
            className="text-p-tw text-secondary-200"
          >
            <Button
              className="flex justify-center bg-primary-600 w-full py-5"
              onClick={handleCheckout}
            >
              結帳
            </Button>
          </Link>
        )}
        {!isOrder && amount === 0 && (
          <Button
            className="flex justify-center bg-primary-600 w-full py-5 "
            onClick={handleCheckout}
          >
            請加入項目後再結帳
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Card
        className="shadow-lg bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark border border-border dark:border-border-dark   md:sticky md:top-[107px]
    fixed bottom-0 left-0 right-0 z-50 w-full min-w-[350px] "
      >
        {/* 手機版 */}
        <Accordion
          type="single"
          defaultValue="item-1"
          collapsible
          className="block md:hidden"
        >
          <AccordionItem value="item-1">
            <CardHeader>
              <AccordionTrigger className="p-0 m-0 group">
                <CardTitle className="text-p-tw">結帳明細</CardTitle>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent>{checkoutContent()}</CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* 電腦版 */}
        <div className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-p-tw">結帳明細</CardTitle>
          </CardHeader>
          <CardContent>{checkoutContent()}</CardContent>
        </div>
      </Card>
    </>
  );
}
