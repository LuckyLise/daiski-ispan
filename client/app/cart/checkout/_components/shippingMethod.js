'use client';

import React, { useState, useEffect } from 'react';

import ShippingOptions from './shipping-method/shipping-options';
import { useFormContext, useWatch } from 'react-hook-form';
import HomeDelivery from './shipping-method/shipping-options/home-delivery';
import StorePickup from './shipping-method/shipping-options/storePickup';

export default function ShippingMethod() {
  const {
    formState: { errors },
    control,
    unregister,
  } = useFormContext();
  const selectedShipping = useWatch({
    control,
    name: 'shippingMethod',
  });

  useEffect(() => {
    if (selectedShipping !== 'homeDelivery') {
      unregister('addressDetail');
      unregister('city');
      unregister('district');
    } else if (selectedShipping !== 'storePickup') {
      unregister('storename');
    }
  }, [selectedShipping]);
  return (
    <>
      <ShippingOptions
        name="宅配"
        radioValue="homeDelivery"
        checked={selectedShipping === 'homeDelivery'}
      ></ShippingOptions>
      {selectedShipping === 'homeDelivery' && <HomeDelivery></HomeDelivery>}

      <ShippingOptions
        name="超商取貨"
        radioValue="storePickup"
        checked={selectedShipping === 'storePickup'}
      ></ShippingOptions>
      {selectedShipping === 'storePickup' && <StorePickup></StorePickup>}

      {errors.shippingMethod && <p className="text-red">請選擇一個配送方式</p>}
    </>
  );
}
