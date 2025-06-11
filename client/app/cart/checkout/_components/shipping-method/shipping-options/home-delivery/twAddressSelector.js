'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { twAddress } from './tw-address-data';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function TwAddressSelector() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const city = watch('city');
  const district = watch('district');

  const handleCityChange = (value) => {
    setValue('city', value, { shouldValidate: true });
    setValue('district', '');
    setValue('zipCode', '');
  };
  const handleDistrictChange = (value) => {
    setValue('district', value, { shouldValidate: true });
    setValue('zipCode', twAddress[city][value]);
  };

  return (
    <>
      <div className="w-full flex flex-col gap-4 ">
        <h6 className="text-p-tw">地址</h6>

        <div className="flex gap-4">
          {/* 選擇縣市 */}

          <div className="w-full">
            <Select
              onValueChange={handleCityChange}
              value={city}
              {...register('city', { required: '縣市為必填' })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇縣市" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.keys(twAddress).map((cityName) => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.city && <p className="text-red">{errors.city.message}</p>}
          </div>

          {/* 選擇區域 */}
          <div className="w-full">
            <Select
              onValueChange={handleDistrictChange}
              value={district}
              disabled={!city}
              {...register('district', { required: '區域為必填' })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇區域" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {city &&
                    Object.keys(twAddress[city]).map((districtName) => (
                      <SelectItem key={districtName} value={districtName}>
                        {districtName}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.district && (
              <p className="text-red">{errors.district.message}</p>
            )}
          </div>
          {/* 顯示郵遞區號 */}
          <div className="w-full">
            <div className="border px-3 py-1 rounded-md bg-slate-100 text-slate-900">
              {watch('zipCode') || '郵遞區號'}
            </div>
          </div>
        </div>

        <div>
          <Input
            // className="border-1 border-primary-600 w-full  "
            type="text"
            name="address"
            {...register('addressDetail', { required: '詳細地址為必填' })}
          />
        </div>

        {errors.addressDetail && (
          <p className="text-red">{errors.addressDetail.message}</p>
        )}
      </div>
    </>
  );
}
