'use client';

import React, { useState, useEffect } from 'react';
import Delete from './delete-button';
import WishList from './wish-list';
import QuantityButton from './quantity-button';
import Favorite from './favorite';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function CartItemList({
  category = '',
  isOrder = false,
  data = {},
}) {
  const titleMap = isOrder
    ? {
        orderProduct: '商品',
        orderCourse: '課程',
        orderGroup: '揪團',
      }
    : {
        CartProduct: '商品',
        CartCourse: '課程',
        CartGroup: '揪團',
      };
  const toUTC8 = (utcString) => {
    const date = new Date(utcString);
    date.setHours(date.getHours() + 8); // 加上 8 小時
    const [d, t] = date.toISOString().split('T');
    return `${d} ${t.split('.')[0].slice(0, 5)}`;
  };

  return (
    <>
      {/* 電腦版 */}
      <Card className="shadow-lg bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark border border-border dark:border-border-dark hidden md:block">
        <CardHeader>
          <CardTitle className="">{titleMap[category]}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className=" ">
            <Table>
              {/* FIXME hover拿掉 */}
              <TableHeader>
                <TableRow className="w-full">
                  <TableHead>圖片</TableHead>
                  <TableHead>名稱</TableHead>
                  <TableHead className="text-center">{`${category === 'CartProduct' || category === 'orderProduct' ? '尺寸' : '價格'}`}</TableHead>
                  <TableHead className="text-center">{`${category === 'CartProduct' || category === 'orderProduct' ? '總價' : '日期'}`}</TableHead>
                  <TableHead className="text-center">{`${category === 'CartProduct' || category === 'orderProduct' ? '數量' : ''}`}</TableHead>
                  <TableHead className=""></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.[category]?.map((item) => {
                  const totalPrice = (
                    item?.price * (item.quantity ? item.quantity : 1)
                  ).toLocaleString();

                  return (
                    <TableRow key={item.id}>
                      {/* 圖片 */}
                      {item.imageUrl && (
                        <TableCell>
                          <div
                            className={`relative ${category === 'CartProduct' || category === 'orderProduct' ? 'h-[96px] w-[96px]' : 'h-[96px] w-[168px]'}`}
                          >
                            <Image
                              // FIXME
                              fill
                              src={
                                item?.imageUrl
                                  ? `http://localhost:3005${item.imageUrl}`
                                  : ''
                              }
                              alt={item.imageUrl}
                              className=""
                            ></Image>
                          </div>
                        </TableCell>
                      )}
                      {/* 品名 */}
                      <TableCell className="whitespace-normal break-words">
                        <div className="">
                          <p className="text-p-tw line-clamp-3">{item.name}</p>
                        </div>
                      </TableCell>

                      {/* 尺寸 */}
                      {(category === 'CartProduct' ||
                        category === 'orderProduct') && (
                        <TableCell>
                          <div className="w-full flex justify-center items-center ">
                            <p className="text-p-tw">
                              {item?.size ? item.size : ''}
                            </p>
                          </div>
                        </TableCell>
                      )}
                      {/* 價格 */}
                      <TableCell>
                        <div className="w-full flex justify-center items-center ">
                          <p className="text-p-tw">${totalPrice}</p>
                        </div>
                      </TableCell>
                      {/* 時間 */}
                      {category !== 'CartProduct' &&
                        category !== 'orderProduct' && (
                          <TableCell>
                            <div className="w-full flex justify-center items-center flex-col ">
                              <p className="flex flex-col">
                                <span className="text-p-tw ">
                                  {toUTC8(item?.startAt)} ～{' '}
                                  {toUTC8(item?.endAt)}
                                </span>
                              </p>
                            </div>
                          </TableCell>
                        )}
                      {/* 數量 */}
                      {(category === 'CartProduct' ||
                        category === 'orderProduct') && (
                        <TableCell>
                          <div className="flex justify-center w-full items-center gap-6">
                            {category === 'CartProduct' && (
                              <QuantityButton
                                item={item}
                                category={category}
                                type="minus"
                              ></QuantityButton>
                            )}

                            <div className="flex justify-center">
                              <p className="">{item.quantity}</p>
                            </div>
                            {category === 'CartProduct' && (
                              <QuantityButton
                                item={item}
                                category={category}
                                type="plus"
                              ></QuantityButton>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {/* 刪除 */}
                      {(category === 'CartProduct' ||
                        category === 'CartCourse' ||
                        category === 'CartGroup') && (
                        <TableCell>
                          <div className="flex justify-center w-full gap-4">
                            {/* FIXME 課程跟揪團也要 */}
                            {/* FIXME 揪團刪除路由localhost:3005/api/group/members/${groupMemberId} */}

                            <Delete
                              name={item.name}
                              category={category}
                              item={item}
                            ></Delete>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 手機版 */}
      <Card className="shadow-lg bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark border border-border dark:border-border-dark block md:hidden">
        <CardHeader>
          <CardTitle className="">{titleMap[category]}</CardTitle>
        </CardHeader>

        <CardContent className="py-4">
          {data?.[category]?.map((item) => {
            const totalPrice = (
              item?.price * (item.quantity ? item.quantity : 1)
            ).toLocaleString();

            return (
              <div
                key={item.id}
                className="flex flex-col border rounded-xl p-4 gap-2"
              >
                {/* 圖片與名稱 */}
                <div className="flex gap-4 items-center">
                  <div
                    className={`relative shrink-0 ${category === 'CartProduct' || category === 'orderProduct' ? 'h-[72px] w-[72px]' : 'h-[72px] w-[120px]'}`}
                  >
                    <Image
                      fill
                      src={
                        item?.imageUrl
                          ? `http://localhost:3005${item.imageUrl}`
                          : ''
                      }
                      alt={item.imageUrl}
                      className="rounded object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="  line-clamp-2">{item.name}</p>
                    {(category === 'CartProduct' ||
                      category === 'orderProduct') && (
                      <p className="">尺寸：{item.size}</p>
                    )}
                  </div>
                </div>

                {/* 價格 / 日期 */}
                <div className="flex justify-between ">
                  {category === 'CartProduct' || category === 'orderProduct' ? (
                    <>
                      <span>單價：${item.price.toLocaleString()}</span>
                      <span>總價：${totalPrice}</span>
                    </>
                  ) : (
                    <span>
                      時間：{toUTC8(item?.startAt)} ～ {toUTC8(item?.endAt)}
                    </span>
                  )}
                </div>

                {/* 數量控制 */}
                {(category === 'CartProduct' ||
                  category === 'orderProduct') && (
                  <div className="flex justify-between items-center">
                    <span className="">數量：</span>
                    <div className="flex items-center gap-3">
                      {category === 'CartProduct' && (
                        <QuantityButton
                          item={item}
                          category={category}
                          type="minus"
                        />
                      )}
                      <span>{item.quantity}</span>
                      {category === 'CartProduct' && (
                        <QuantityButton
                          item={item}
                          category={category}
                          type="plus"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 刪除按鈕 */}
                {category.startsWith('Cart') && (
                  <div className="flex justify-end">
                    <Delete name={item.name} category={category} item={item} />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
