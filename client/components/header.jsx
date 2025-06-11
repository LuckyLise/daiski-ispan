// Header.jsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import { CartIconWithBadge } from './cart-icon-with-badge';
import { MobileHeaderMenu } from './mobile-header-menu';
import { AccountPopover } from './account-popover';
import DarkMode from './dark-mode';

export default function Header() {
  return (
    // FIXME sticky可能與購物車第二部分的select衝突，改成fixed似乎能解決
    <header className="w-full mx-auto px-10 py-8 flex items-center justify-between sticky top-0 z-1000 shadow-md bg-white dark:bg-background">
      {/* 左側 Logo */}
      <div className="flex-shrink-0">
        <Link href="/">
          <Image
            src="/LOGO-dark.svg"
            alt="DAISKI"
            width={150}
            height={40}
            className="h-10 w-auto dark:hidden"
          />
          <Image
            src="/LOGO-white.svg"
            alt="DAISKI"
            width={150}
            height={40}
            className="h-10 w-auto hidden dark:block"
          />
        </Link>
      </div>

      {/* 桌面版主導航 */}
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList className="flex gap-10">
          {/* 主頁 */}
          <NavigationMenuItem className="">
            <Link
              href="/"
              // 直接把shadcn navigationMenuTriggerStyle()裡面包含的所有class拿出來 直接用navigationMenuTriggerStyle()會因為執行順序的關係會害我們自己下的class被蓋掉
              className={`group inline-flex h-9 w-max items-center justify-center rounded-md font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 text-base`}
            >
              主頁
            </Link>
          </NavigationMenuItem>

          {/* 滑雪課程 */}
          <NavigationMenuItem>
            <Link
              href="/courses"
              className={`group inline-flex h-9 w-max items-center justify-center rounded-md font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 text-base`}
            >
              滑雪課程
            </Link>
          </NavigationMenuItem>

          {/* 教練團隊 */}
          <NavigationMenuItem>
            <Link
              href="/coaches"
              className={`group inline-flex h-9 w-max items-center justify-center rounded-md font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 text-base`}
            >
              教練團隊
            </Link>
          </NavigationMenuItem>

          {/* 揪團滑雪 */}
          <NavigationMenuItem>
            <Link
              href="/groups"
              className={`group inline-flex h-9 w-max items-center justify-center rounded-md font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 text-base`}
            >
              揪團滑雪
            </Link>
          </NavigationMenuItem>

          {/* 商品 */}
          <NavigationMenuItem>
            <Link
              href="/product"
              className={`group inline-flex h-9 w-max items-center justify-center rounded-md font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 text-base`}
            >
              商品
            </Link>
          </NavigationMenuItem>

          {/* 購物車 & 帳號（維持你拆好的元件） */}
          <NavigationMenuItem
            className={`group inline-flex h-9 w-max items-center justify-center rounded-md font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 text-base`}
          >
            <CartIconWithBadge href="/cart" />
          </NavigationMenuItem>
          <NavigationMenuItem
            className={`group inline-flex h-9 w-max items-center justify-center rounded-md font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 text-base`}
          >
            <AccountPopover href="/profile" />
          </NavigationMenuItem>

          <NavigationMenuItem
            className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-background  font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 text-base `}
          >
            <DarkMode />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* 手機版選單 */}
      <MobileHeaderMenu />
    </header>
  );
}
