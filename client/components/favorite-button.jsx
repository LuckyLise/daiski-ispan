'use client';

import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

/**
 * 收藏按鈕元件 (受控元件)
 * @param {{ isFav: boolean; onToggle: ()=>void; variant?: 'circle'|'rect'; className?: string; }} props
  
  詳細使用方法可參考我商品一覽頁page.js 取得這個元件需要的兩個參數isFav跟onToggleFavorite:
  
   7. **獲取收藏清單與切換收藏**
      使用 `useSWR` 獲取用戶的收藏商品 ID 列表 (`favIds`)。只有在用戶登入時才觸發請求。
      `mutateFav` 用於手動更新 SWR 緩存，實現樂觀更新 (optimistic update)。
      `toggleFavorite` 函式處理商品收藏/取消收藏的邏輯，它會先進行樂觀更新，然後發送 API 請求。

  const { data: favIds = [], mutate: mutateFav } = useSWR(
    isAuth ? '/api/profile/favorites' : null,
    fetcher
  );

  const toggleFavorite = useCallback(
    async (productId) => {
      const isFav = favIds.includes(productId);
      const next = isFav
        ? favIds.filter((id) => id !== productId)
        : [...favIds, productId];
      mutateFav(next, false); // 樂觀更新

      try {
        if (isFav) {
          await fetch(
            `http://localhost:3005/api/profile/favorites/${productId}`,
            { method: 'DELETE', credentials: 'include' }
          );
        } else {
          await fetch('http://localhost:3005/api/profile/favorites', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });
        }
        mutateFav(); // 重新驗證數據
      } catch {
        mutateFav(); // 錯誤時回滾
      }
    },
    [favIds, mutateFav]
  );

  然後傳入你的元件內 例如像這樣(products是無關的 我是參數先傳入productList元件再傳入favorite-button元件 所以才包含了那個products)
          <ProductList
            products={products}
            favIds={favIds}
            onToggleFavorite={toggleFavorite}
          />
 */

export default function FavoriteButton({
  isFav,
  onToggle,
  variant,
  isAuth,
  className = '',
}) {
  // 只有當 variant 顯式為 'rect' 時，才採用長方形樣式，其他情況都用 circle
  const isRect = variant === 'rect';
  const router = useRouter();

  // 按鈕樣式
  const baseClasses = isRect
    ? 'px-4 py-6 rounded-lg space-x-2 flex items-center cursor-none'
    : 'p-2 rounded-full cursor-none';
  const btnVariant = isRect ? 'outline' : 'ghost';

  // 先阻止事件冒泡，再執行切換收藏
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuth) {
      onToggle();
    } else {
      // router.push('/auth/not-login');
      console.log('沒登入');
    }
  };

  return (
    <Button
      variant={btnVariant}
      className={`${baseClasses} ${className}`}
      onClick={handleClick}
    >
      {isRect ? (
        <>
          {isFav ? (
            <FaHeart size={16} className="text-red" />
          ) : (
            <FaRegHeart size={16} />
          )}
          <span>{isFav ? '已收藏' : '加入收藏'}</span>
        </>
      ) : isFav ? (
        <FaHeart size={20} className="text-red" />
      ) : (
        <FaRegHeart size={20} />
      )}
    </Button>
  );
}

// 'use client';

// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from '@/components/ui/card';
// import Image from 'next/image';
// import FavoriteButton from '@/components/favorite-button';

// export default function ProductList({ products, favIds, onToggleFavorite }) {
//   return (
//     <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden">
//       {products.map((p) => (
//         <motion.li
//           key={p.id}
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ type: 'spring', stiffness: 100, damping: 12 }}
//           viewport={{ once: true, amount: 0.2 }}
//           className="relative"
//         >
//           {/* 將整張卡片包在 Link 裡，設定為 block 讓它填滿 li */}
//           <Link href={`/product/${p.id}`} className="block relative">
//             {/* 收藏按鈕：內部已 stopPropagation，不會觸發 Link */}
//             <div className="absolute top-2 right-2 z-10">
//               <FavoriteButton
//                 isFav={favIds.includes(p.id)}
//                 onToggle={() => onToggleFavorite(p.id)}
//                 variant="circle"
//               />
//             </div>

//             <Card>
//               <CardHeader className="w-full aspect-[4/3] overflow-hidden rounded-xl">
//                 <Image
//                   src={p.image || '/placeholder.jpg'}
//                   alt={p.name}
//                   width={10}
//                   height={10}
//                   className="w-full h-full object-cover transition duration-300 hover:scale-110"
//                 />
//               </CardHeader>
//               <CardContent>
//                 <CardTitle className="text-lg font-bold mt-2 line-clamp-2 hover:text-primary-500">
//                   {p.name}
//                 </CardTitle>
//                 <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-1 hover:text-primary-500">
//                   {p.category} / {p.brand}
//                 </CardDescription>
//                 <p className="text-red-500 font-semibold text-base mt-2">
//                   ${p.price}
//                 </p>
//               </CardContent>
//               <CardFooter>
//                 <p className="text-sm text-gray-500">
//                   評價：{p.rating || '尚無評價'}
//                 </p>
//               </CardFooter>
//             </Card>
//           </Link>
//         </motion.li>
//       ))}
//     </ul>
//   );
// }
