'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProductAddCartButton({
  skuId,
  quantity,
  price,
  name,
  imageUrl,
  size,
  isAuth,
}) {
  const { onAdd } = useCart();
  const router = useRouter();

  return (
    <Button
      className="h-12 bg-primary-600 text-white w-full cursor-none"
      onClick={() => {
        // alert(`新增到購物車:${skuId}`);
        // console.log({
        //   id: skuId,
        //   quantity: quantity,
        //   price: price,
        //   name: name,
        //   imageUrl: imageUrl,
        //   size: size,
        // });
        if (isAuth) {
          onAdd('CartProduct', {
            id: skuId,
            quantity: quantity,
            price: price,
            name: name,
            imageUrl: imageUrl,
            size: size,
          });
          toast('成功加入購物車', {
            description: '三秒後自動關閉訊息',
            action: {
              label: '關閉',
              onClick: () => console.log('Undo'),
            },
          });
        } else {
          router.push('/auth/not-login');
        }
      }}
    >
      加入購物車
    </Button>
  );
}
