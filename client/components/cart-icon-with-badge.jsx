'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';

export function CartIconWithBadge({ href = '/cart' }) {
  const { totalQty } = useCart();
  const { isAuth } = useAuth();

  // FIXME 等待實際數值
  // const count = items.length;
  let count = 0;
  if (isAuth) {
    count = totalQty.reduce((acc, v) => {
      return (acc += v.quantity);
    }, 0);
  }

  return (
    <Link href={href} className=" rounded-full transition">
      {/* 包住 SVG 和徽章，確保 badge 定位正確 */}
      <div className="relative inline-block">
        <ShoppingCart className=" size-6" />
        {/* 
  為什麼這邊使用 className="size-8" 而不是常見的 w-8 h-8 或lucide-react的 size={64}？
  原因是某些全域樣式（像是 tw-animate-css 或其他 UI 套件）會針對 svg:not([class*="size-"]) 套用預設寬高（如 size-4），
  導致設定的 w-* h-* 或元件本身的 size 屬性被覆蓋。
  為了避免這種樣式衝突，使用 Tailwind 的 size-* 類別（例如 size-8）能讓 SVG 正確套用寬高，並繞過全域樣式的影響。
*/}
        {count >= 0 && (
          <Badge className="absolute -top-3 -right-3 h-5 w-5 p-0 text-xs flex items-center justify-center bg-[#2770EA]">
            {count}
          </Badge>
        )}
      </div>
    </Link>
  );
}
