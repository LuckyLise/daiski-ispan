'use client';

import React, { useState } from 'react';
import IconHeart from '@/components/heart-icon';
import { produce } from 'immer';

export default function WishList({ wishList, index, setWishList }) {
  return (
    <>
      <button
        onClick={() => {
          const nextItems = produce(wishList, (draft) => {
            draft[index] = !draft[index];
          });
          // 設定到狀態
          setWishList(nextItems);
        }}
      >
        <div className="flex justify-center">
          <IconHeart active={wishList[index]}></IconHeart>收藏
        </div>
      </button>
    </>
  );
}
