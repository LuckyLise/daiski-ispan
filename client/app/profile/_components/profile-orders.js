'use client';

import { useRouter } from 'next/navigation'; // ← 新增這行
import useSWR from 'swr';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import RateButton from '@/components/rate-button';
import { Button } from '@/components/ui/button';

const API_BASE_URL = 'http://localhost:3005/api';
const ORDERS_API_URL = `${API_BASE_URL}/cart/orders`;

const fetcher = async (url) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    const err = new Error('請求失敗');
    err.status = res.status;
    try {
      err.info = await res.json();
    } catch {
      err.info = res.statusText;
    }
    throw err;
  }
  return res.json();
};

export default function ProfileOrders() {
  const router = useRouter(); // ← 新增這行
  const { isAuth, isLoading: authLoading } = useAuth();
  const { data, error, isLoading } = useSWR(
    isAuth ? ORDERS_API_URL : null,
    fetcher
  );

  const orders = data?.orders ?? [];
  const base = process.env.NEXT_PUBLIC_API_BASE || '';

  if (authLoading || isLoading) return <p className="p-4">載入中…</p>;
  if (error)
    return <p className="p-4 text-red-500">載入失敗：{error.message}</p>;
  if (orders.length === 0) return <p className="p-4">目前沒有訂單紀錄</p>;

  return (
    <div className="container mx-0 xl:mx-auto overflow-y-auto h-dvh p-4">
      <Accordion type="multiple" className="space-y-4">
        {orders.map((order) => (
          <AccordionItem key={order.id} value={`order-${order.id}`}>
            <AccordionTrigger className="flex justify-self-start items-center pr-4 text-right">
              <div>
                <span className="font-semibold">訂單 #{order.id}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString('zh-TW')}
                </span>
              </div>
              <div className="w-[180px]">
                <span>NT$ {order.amount.toLocaleString()}</span>
              </div>
            </AccordionTrigger>
            <div className="flex justify-end p-4 space-x-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation(); // 避免與Accordion互動衝突
                  localStorage.setItem('summaryOrderId', order.id);
                  router.push('/cart/summary'); // 使用 Next.js Router
                }}
              >
                訂單詳細
              </Button>
            </div>
            <AccordionContent className="space-y-8 pt-4">
              {order.OrderProduct?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-lg font-medium">商品</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">預覽</TableHead>
                        <TableHead>名稱</TableHead>
                        <TableHead className="w-24 text-center">評價</TableHead>
                        <TableHead className="w-24 text-center">數量</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.OrderProduct.map((p) => (
                        <TableRow key={`product-${order.id}-${p.id}`}>
                          <TableCell>
                            <Image
                              src={`${base}/${p.imageUrl}`}
                              alt={p.name}
                              width={60}
                              height={60}
                              className="rounded-md object-cover"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {p.name}
                          </TableCell>
                          <TableCell className="text-center">
                            <RateButton
                              orderId={order.id}
                              productSkuId={p.id}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {p.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              )}

              {order.OrderCourse?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-lg font-medium">課程</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">預覽</TableHead>
                        <TableHead>名稱</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.OrderCourse.map((c, idx) => (
                        <TableRow key={`course-${order.id}-${idx}`}>
                          <TableCell>
                            <Image
                              src={`${base}/${c.imageUrl}`}
                              alt={c.name}
                              width={60}
                              height={60}
                              className="rounded-md object-cover"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {c.name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              )}

              {order.OrderGroup?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-lg font-medium">揪團</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">預覽</TableHead>
                        <TableHead>名稱</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.OrderGroup.map((g, idx) => (
                        <TableRow key={`group-${order.id}-${idx}`}>
                          <TableCell>
                            <Image
                              src={`${base}/${g.imageUrl}`}
                              alt={g.name}
                              width={60}
                              height={60}
                              className="rounded-md object-cover"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {g.name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
