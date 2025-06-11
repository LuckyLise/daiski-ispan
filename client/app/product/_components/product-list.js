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

// export default function ProductList({ products }) {
//   return (
//     <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-hidden">
//       {products.map((p) => (
//         <motion.li
//           key={p.id}
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ type: 'spring', stiffness: 100, damping: 12 }}
//           viewport={{ once: true, amount: 0.2 }}
//           className=""
//         >
//           <Link href={`/product/${p.id}`}>
//             <Card>
//               <CardHeader>
//                 <CardTitle>{p.name}</CardTitle>
//                 <CardDescription>商品細節</CardDescription>
//               </CardHeader>
//               <CardContent className="text-red-500">
//                 <p>${p.price}</p>
//               </CardContent>
//               <CardFooter>
//                 <p>更多資訊</p>
//               </CardFooter>
//             </Card>
//           </Link>
//         </motion.li>
//       ))}
//     </ul>
//   );
// }

// 'use client';

// import { motion } from 'framer-motion';
// import { useRouter } from 'next/navigation';
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
//   const router = useRouter();
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
//           // 點整個卡片才導航
//           onClick={() => router.push(`/product/${p.id}`)}
//         >
//           <Card>
//             {/* 收藏按钮 */}
//             <div className="absolute top-2 right-2 z-10">
//               <FavoriteButton
//                 isFav={favIds.includes(p.id)}
//                 onToggle={() => onToggleFavorite(p.id)}
//                 variant="circle"
//               />
//             </div>
//             <CardHeader className="w-full aspect-[4/3] overflow-hidden rounded-xl">
//               <Image
//                 src={p.image || '/placeholder.jpg'}
//                 alt={p.name}
//                 width={10}
//                 height={10}
//                 className="w-full h-full object-cover transition duration-300 hover:scale-110"
//               />
//             </CardHeader>
//             <CardContent>
//               <CardTitle className="text-lg font-bold mt-2 line-clamp-2 hover:text-primary-500">
//                 {p.name}
//               </CardTitle>
//               <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-1 hover:text-primary-500">
//                 {p.category} / {p.brand}
//               </CardDescription>
//               <p className="text-red-500 font-semibold text-base mt-2">
//                 ${p.price}
//               </p>
//             </CardContent>
//             <CardFooter>
//               <p className="text-sm text-gray-500">
//                 評價：{p.rating || '尚無評價'}
//               </p>
//             </CardFooter>
//           </Card>
//         </motion.li>
//       ))}
//     </ul>
//   );
// }

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import Image from 'next/image';
import FavoriteButton from '@/components/favorite-button';
import { FaStar } from 'react-icons/fa';

export default function ProductList({
  products,
  favIds,
  onToggleFavorite,
  isAuth,
}) {
  return (
    // <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden">
    //   {products.map((p) => (
    //     <motion.li
    //       key={p.id}
    //       initial={{ opacity: 0, y: 30 }}
    //       whileInView={{ opacity: 1, y: 0 }}
    //       transition={{ type: 'spring', stiffness: 100, damping: 12 }}
    //       viewport={{ once: true, amount: 0.2 }}
    //       className="relative"
    //     >
    //       {/* 將整張卡片包在 Link 裡，設定為 block 讓它填滿 li */}
    //       <Link href={`/product/${p.id}`} className="block relative">
    //         {/* 收藏按鈕：內部已 stopPropagation，不會觸發 Link */}
    //         <div className="absolute top-2 right-2 z-5">
    //           <FavoriteButton
    //             isFav={favIds.includes(p.id)}
    //             onToggle={() => onToggleFavorite(p.id)}
    //             variant="circle"
    //           />
    //         </div>

    //         <Card>
    //           <CardHeader className="w-full  overflow-hidden p-4">
    //             <div className="aspect-[4/3]">
    //               <Image
    //                 src={p.image || '/placeholder.jpg'}
    //                 alt={p.name}
    //                 width={10}
    //                 height={10}
    //                 className="w-full h-full object-contain transition duration-300 hover:scale-110"
    //               />
    //             </div>
    //           </CardHeader>
    //           <CardContent>
    //             <CardTitle className="text-lg font-bold mt-2 line-clamp-2 hover:text-primary-500">
    //               {p.name}
    //             </CardTitle>
    //             <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-1 hover:text-primary-500">
    //               {p.category} / {p.brand}
    //             </CardDescription>
    //             <p className="text-red-500 font-semibold text-base mt-2">
    //               ${p.price}
    //             </p>
    //           </CardContent>
    //           <CardFooter>
    //             <p className="text-sm text-gray-500">
    //               評價：{p.rating || '尚無評價'}
    //             </p>
    //           </CardFooter>
    //         </Card>
    //       </Link>
    //     </motion.li>
    //   ))}
    // </ul>

    <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden">
      {products.map((p) => (
        <motion.li
          key={p.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 12 }}
          viewport={{ once: true, amount: 0.2 }}
          className="relative"
        >
          {/* 收藏按鈕 */}
          <div className="absolute top-2 right-2 z-10">
            {' '}
            {/* 若卡片內容之後會設定 z-index，此處可能需要更高 z-index */}
            <FavoriteButton
              isFav={favIds.includes(p.id)}
              onToggle={() => onToggleFavorite(p.id)}
              variant="circle"
              isAuth={isAuth}
            />
          </div>

          {/* 用 Link 本身或一層 motion.div 來偵測 hover */}
          <Link href={`/product/${p.id}`} className="block cursor-none">
            <motion.div
              className="relative overflow-hidden" // 卡片大小由下面 Card 定義，這個容器負責裁切雪球
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={{
                rest: {},
                hover: {},
              }}
            >
              {/* 雪球效果層 (SnowLayer) */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-0" // 目前 z-0，之後需要調整以解決覆蓋問題
                variants={{
                  hover: {
                    transition: {
                      staggerChildren: 0.05, // 可以根據雪球總數調整，例如 0.05 或 0.1
                    },
                  },
                }}
              >
                {/* MODIFIED: 單一全寬度的雪球容器 */}
                <div className="absolute top-0 left-0 w-full h-full">
                  {/* 調整雪球總數，例如 40 個 */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={`snow-${i}`} // 使用新的 key
                      className="w-3 h-3 bg-secondary-500 rounded-full shadow-sm absolute" // 使用單一顏色，例如 bg-slate-100
                      style={{
                        left: `${Math.random() * 100}%`, // 在整個寬度內隨機水平位置
                        top: '-20px', // 從卡片頂部外開始
                      }}
                      variants={{
                        hover: {
                          y: 850 + Math.random() * 100,
                          x: Math.random() * 40 - 20, // 左右隨機漂移範圍 (-20px 到 +20px)
                          opacity: [0, 0.8, 0.8, 0],
                          transition: {
                            delay: Math.random() * 2,
                            duration: 2 + Math.random() * 4,
                            repeat: Infinity,
                            repeatDelay: 0 + Math.random() * 1,
                            ease: 'linear',
                          },
                        },
                        rest: {
                          opacity: 0,
                          y: -20,
                          transition: { duration: 0 },
                        },
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* 卡片結構 (目前雪球會蓋在這個之上) */}
              <Card className="border dark:border-white bg-white dark:bg-background ">
                <CardHeader className="w-full overflow-hidden p-4">
                  <div className="aspect-[4/3]">
                    <Image
                      src={p.image || '/placeholder.jpg'}
                      alt={p.name}
                      width={10}
                      height={10}
                      className="w-full h-full object-contain transition duration-300 hover:scale-120 dark:bg-white rounded"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg font-bold mt-2 line-clamp-2 hover:text-primary-500">
                    {p.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-black dark:text-white mt-1 line-clamp-1 hover:text-primary-500">
                    {p.category} / {p.brand}
                  </CardDescription>
                  <p className="text-red-500 font-semibold text-base mt-2">
                    NT${p.price.toLocaleString()}
                  </p>
                </CardContent>
                <CardFooter>
                  {p.totalRatings > 0 ? (
                    <p className="flex items-center text-sm text-black dark:text-white">
                      {/* 黃色星星 */}
                      <FaStar className="text-yellow-500 mr-1" />
                      {/* 平均分數 */}
                      <span>{p.averageRating}</span>
                      {/* 括號裡顯示總筆數 */}
                      <span className="ml-1 text-gray-500 dark:text-white">
                        ({p.totalRatings})
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-white">
                      尚無評價
                    </p>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
