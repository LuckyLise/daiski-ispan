import { User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useAuthGet, useAuthLogout } from '@/services/rest-client/use-user';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export function MobileAccountMenu() {
  // 透過 hooks 取得驗證與資料重驗證
  const { mutate } = useAuthGet();
  const { logout } = useAuthLogout();
  const { isAuth } = useAuth();

  // 處理登出
  const handleLogout = async () => {
    const res = await logout();
    const resData = await res.json();
    if (resData.status === 'success') {
      mutate();
    }
  };

  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="account-menu">
          <AccordionTrigger
            className="
              size-6 
              rounded-full 
              border-2 
              border-black
              dark:border-white 
              hover:bg-gray-100
              dark:hover:bg-gray-700 
              transition 
              cursor-pointer
              flex 
              items-center 
              justify-center  data-[state=open]:rotate-0
            "
          >
            <div className="flex items-center justify-between text-base gap-3">
              <User className="size-4 text-black dark:text-white" />
              <span>會員</span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-2 z-1001 space-y-1">
            {isAuth ? (
              <>
                <Link
                  href="/profile"
                  className="w-full block text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700  text-base"
                >
                  個人資料
                </Link>
                <Link
                  href="/coupons"
                  className="w-full block text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700  text-base"
                >
                  優惠券
                </Link>
                <Link
                  href="/groups"
                  className="w-full block text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700  text-base"
                >
                  揪團
                </Link>
                <button
                  className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700  text-base"
                  onClick={handleLogout}
                >
                  登出
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="w-full block text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700  text-base"
              >
                登入
              </Link>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
