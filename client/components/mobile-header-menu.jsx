'use client';
import { useState } from 'react';
import {
  Menu,
  House,
  BookOpen,
  RectangleGoggles,
  Users,
  ShoppingBasket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { CartIconWithBadge } from './cart-icon-with-badge';
import { AccountPopover } from './account-popover';
import { MobileAccountMenu } from './mobile-account-menu';
import { motion } from 'framer-motion';
import DarkMode from './dark-mode';

// export function MobileHeaderMenu() {
//   return (
//     <Sheet>
//       <SheetTrigger asChild>
//         <Button variant="ghost" size="icon" className="md:hidden">
//           <Menu className="size-6" />
//         </Button>
//       </SheetTrigger>
//       <SheetContent side="top" className="w-full gap-0  py-8">
//         <SheetHeader className="flex flex-row justify-start gap-4 items-center">
//           <SheetTitle></SheetTitle>
//           <div className="w-full flex flex-col items-start gap-8 ">
//             <div className="flex flex-row gap-3 w-full active:bg-gray-200">
//               {/* <AccountPopover /> */}
//               <MobileAccountMenu />
//             </div>

//             <div className="flex flex-row gap-3 w-full active:bg-gray-200">
//               <CartIconWithBadge />
//               <Link
//                 href="/cart"
//                 className="text-base flex flex-row gap-2 w-full "
//               >
//                 購物車
//               </Link>
//             </div>
//           </div>
//         </SheetHeader>
//         <ul className="flex flex-col space-y-4 pl-8">
//           <li className="w-full active:bg-gray-200">
//             <Link href="/home" className="text-base flex flex-row gap-3">
//               <House /> 主頁
//             </Link>
//           </li>
//           <li className="w-full active:bg-gray-200">
//             <Link href="/course" className="text-base flex flex-row gap-3">
//               <BookOpen />
//               滑雪課程
//             </Link>
//           </li>
//           <li className="w-full active:bg-gray-200">
//             <Link href="/group" className="text-base flex flex-row gap-3">
//               <Users />
//               揪團滑雪
//             </Link>
//           </li>
//           <li className="w-full active:bg-gray-200">
//             <Link href="/products" className="text-base flex flex-row gap-3">
//               <ShoppingBasket /> 商品
//             </Link>
//           </li>
//         </ul>
//       </SheetContent>
//     </Sheet>
//   )
// }

export function MobileHeaderMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" />
          </Button>
        </SheetTrigger>

        <SheetContent side="top" className="w-full p-0 z-1001">
          <motion.div
            className="w-full h-full bg-white dark:bg-background flex flex-col relative"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0 }} // 上方有彈性、下方毫無彈性
            whileDrag={{ scale: 0.995 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -50) {
                // 超過 50px 才真正關閉
                setOpen(false);
              }
            }}
          >
            {/* 保留 shadcn 內建的關閉按鈕 */}
            <SheetHeader className="flex flex-row justify-start gap-4 items-center pt-16 pb-4 px-6">
              <SheetTitle className="text-lg"></SheetTitle>
              <div className="w-full flex flex-col items-start gap-8 ">
                <div className="flex flex-row gap-3 w-full active:bg-gray-200">
                  <MobileAccountMenu />
                </div>
                <div className="flex flex-row gap-3 w-full active:bg-gray-200">
                  <CartIconWithBadge />
                  <Link
                    href="/cart"
                    className="text-base flex flex-row gap-2 w-full"
                  >
                    購物車
                  </Link>
                </div>
              </div>
            </SheetHeader>

            <ul className="flex flex-col space-y-4 pl-8 pb-8">
              <li className="w-full active:bg-gray-200 p-2 rounded">
                <Link href="/" className="text-base flex flex-row gap-3">
                  <House /> 主頁
                </Link>
              </li>
              <li className="w-full active:bg-gray-200 p-2 rounded">
                <Link href="/courses" className="text-base flex flex-row gap-3">
                  <BookOpen /> 滑雪課程
                </Link>
              </li>
              <li className="w-full active:bg-gray-200 p-2 rounded">
                <Link href="/coaches" className="text-base flex flex-row gap-3">
                  <RectangleGoggles /> 教練團隊
                </Link>
              </li>
              <li className="w-full active:bg-gray-200 p-2 rounded">
                <Link href="/groups" className="text-base flex flex-row gap-3">
                  <Users /> 揪團滑雪
                </Link>
              </li>
              <li className="w-full active:bg-gray-200 p-2 rounded">
                <Link href="/product" className="text-base flex flex-row gap-3">
                  <ShoppingBasket /> 商品
                </Link>
              </li>
              <li className="w-full active:bg-gray-200 p-1 rounded">
                <DarkMode className="" />
              </li>
            </ul>
          </motion.div>
        </SheetContent>
      </Sheet>
    </>
  );
}
