'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useShip711StoreOpener } from '../../../_hooks/use-ship-711-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function StorePickup({ checked = false }) {
  const { store711, openWindow } = useShip711StoreOpener(
    `http://localhost:3005/api/shipment/711`,
    { autoCloseMins: 3 } // x分鐘沒完成選擇會自動關閉，預設5分鐘。
  );
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  useEffect(() => {
    if (store711.storename) {
      setValue('storename', store711.storename, { shouldValidate: true });
    }
  }, [store711.storename, setValue]);
  return (
    <>
      {
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-10">
            <div className=" w-full max-w-64">
              <label className="flex flex-col  gap-3 w-full max-w-64">
                <h6 className="text-p-tw">收貨人</h6>
                {/* FIXME 待完成 */}

                <Input {...register('name', { required: '姓名必填' })} />
                {errors.name && (
                  <p className="text-red">{errors.name.message}</p>
                )}
              </label>
            </div>
            {/* <span className={styles['error']}>{errors.name}</span> */}
            <div className="w-full max-w-64">
              <label className="flex flex-col  gap-3  w-full max-w-64">
                <h6 className="text-p-tw">手機</h6>
                <Input
                  {...register('phone', {
                    required: '手機號碼必填',
                    pattern: {
                      value: /^09\d{8}$/,
                      message: '格式錯誤',
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-red">{errors.phone.message}</p>
                )}
              </label>
            </div>
          </div>
          {/* FIXME改顏色 */}
          <Button
            type="button"
            className=" px-6 py-2.5 max-w-24"
            onClick={() => {
              openWindow();
            }}
          >
            選擇門市
          </Button>
          {errors.storename && (
            <p className="text-red">{errors.storename.message}</p>
          )}
          <div className="flex flex-col gap-4">
            <div>
              <span className="whitespace-nowrap">門市名稱 : </span>
              <input
                type="text"
                className="w-auto"
                value={store711.storename}
                disabled
                {...register('storename', { required: '門市必選' })}
              />
            </div>
            <div className="">
              <span className="whitespace-nowrap">門市地址 : </span>
              <input
                type="text"
                className="w-full"
                value={store711.storeaddress}
                disabled
              />
            </div>
          </div>
        </div>
      }
    </>
  );
}
