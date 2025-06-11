'use client';

import { User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
//PopoverClose=>點擊有效後關閉ＵＩ
import { PopoverClose } from '@radix-ui/react-popover';
import { Button } from './ui/button';

import {
  useAuthGet,
  useAuthLogout,
  useAuthLogin,
} from '@/services/rest-client/use-user';
export function AccountPopover() {
  // 登入後設定全域的會員資料用
  const { mutate } = useAuthGet();
  const { login } = useAuthLogin();
  const { logout } = useAuthLogout();

  const { isAuth } = useAuth();
  // 處理登出
  const handleLogout = async () => {
    const res = await logout();
    const resData = await res.json();
    // 成功登出
    if (resData.status === 'success') {
      // 呼叫useAuthGet的mutate方法
      // 將會進行重新驗證(revalidation)(將資料標記為已過期並觸發重新請求)
      mutate();
    }
  };
  return (
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <button className="rounded-full border-2 border-black hover:bg-gray-100 transition cursor-pointer">
    //       <User className="size-6 text-black" />
    //     </button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end" className="w-24">
    //     <DropdownMenuLabel>帳號選單</DropdownMenuLabel>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuItem>個人資料</DropdownMenuItem>
    //     <DropdownMenuItem>設定</DropdownMenuItem>
    //     <DropdownMenuItem>登出</DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
    <Popover>
      {/* 觸發按鈕 */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-6 rounded-full border-2 border-black hover:bg-gray-100 transition cursor-pointer"
        >
          <User className="size-4 " />
        </Button>
      </PopoverTrigger>

      {/* 彈出內容 */}
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={4}
        className="w-48 p-2 z-1001"
      >
        {/* <div className="text-sm font-medium text-gray-500 mb-2">帳號選單</div> */}
        <div className="flex flex-col gap-1">
          <PopoverClose asChild>
            <Link href="/profile">
              <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">
                個人資料
              </button>
            </Link>
          </PopoverClose>
          <PopoverClose asChild>
            <Link href="/coupons">
              <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">
                優惠券
              </button>
            </Link>
          </PopoverClose>
          <PopoverClose asChild>
            <Link href="/groups">
              <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">
                揪團
              </button>
            </Link>
          </PopoverClose>
          <PopoverClose asChild>
            <Link href="/">
              {isAuth && (
                <button
                  className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  登出
                </button>
              )}
            </Link>
          </PopoverClose>
          <PopoverClose asChild>
            <Link href="/auth/login">
              {!isAuth && (
                <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">
                  登入
                </button>
              )}
            </Link>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
