'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TwAddressSelector from './home-delivery/twAddressSelector';

export default function HomeDelivery() {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();
  const selectedShipping = useWatch({
    control,
    name: 'shippingMethod',
  });

  return (
    <>
      {selectedShipping === 'homeDelivery' && (
        <div className="flex flex-col gap-4">
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

          <div className="flex w-full max-w-138">
            <TwAddressSelector></TwAddressSelector>
          </div>
        </div>
      )}
    </>
  );
}
