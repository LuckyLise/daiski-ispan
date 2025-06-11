'use client';
import { produce } from 'immer';
import { useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { CloudCog } from 'lucide-react';
import Delete from './delete-button';
import { Button } from '@/components/ui/button';
export default function QuantityButton({
  item = {},
  category = '',
  type = '',
}) {
  const url = `http://localhost:3005/api/cart/${item.id}`;
  const { cart, setCart, onAdd, onDecrease } = useCart();

  // FIXME 使用useCart鉤子，避免程式碼重複
  // 將更新傳回後端
  // async function fetchData(updateQuantity) {
  //   try {
  //     await fetch(url, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         updateQuantity: updateQuantity,
  //       }),
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
  // console.log(object);
  const nextItem = { ...item };
  nextItem.quantity = 1;
  return (
    <>
      <Button
        variant="outline"
        className=" disabled:border-secondary-200 "
        // onClick={() => {
        //   console.log({ item });
        // }}
        onClick={() => {
          const nextCart = produce(cart, (draft) => {
            draft.CartProduct.map((product) => {
              if (product.id === item.id) {
                if (type === 'minus') {
                  if (product.quantity === 1) {
                    return product.quantity;
                  } else {
                    onDecrease('CartProduct', nextItem);
                    return product.quantity--;
                  }
                } else if (type === 'plus') {
                  onAdd('CartProduct', nextItem);
                  return product.quantity++;
                }
              }
            });
          });
          setCart(nextCart);

          // const updatedItem = nextCart.CartProduct.find(
          //   (item) => item.id === itemId
          // );
          // if (updatedItem) {
          //   fetchData(updatedItem.quantity);
          //   onAdd('CartProduct', {
          //     id: itemId,
          //     quantity: updatedItem.quantity,
          //     price: updatedItem.price,
          //     name: updatedItem.name,
          //     imageUrl: updatedItem.imageUrl,
          //     size: updatedItem.size,
          //   });
          // }
        }}
      >
        {/* FIXME -號要加大*/}
        <div>
          <p className="text-center text-h6-tw">{type === 'minus' && '-'}</p>
          <p className="text-center">{type === 'plus' && '+'}</p>
        </div>
      </Button>
    </>
  );
}
