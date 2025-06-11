'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'; // 假設已經有這個元件

export default function NewProductForm() {
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';

  // 下拉選單資料
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);

  // 取得分類／品牌／尺寸列表
  useEffect(() => {
    fetch(`${base}/api/products/categories/list`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);

    fetch(`${base}/api/products/brands`)
      .then((res) => res.json())
      .then(setBrands)
      .catch(console.error);

    fetch(`${base}/api/products/sizes`)
      .then((res) => res.json())
      .then(setSizes)
      .catch(console.error);
  }, []);

  // React Hook Form 初始化
  const form = useForm({
    defaultValues: {
      name: '',
      category_id: '',
      brand_id: '',
      introduction: '',
      spec: '',
      images: [],
      skus: [{ size_id: '', price: '', sku_code: '', stock: '' }],
    },
  });

  // 動態 SKU 陣列管理
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'skus',
  });

  // 表單提交
  const onSubmit = async (values) => {
    const fd = new FormData();
    fd.append('name', values.name);
    if (values.category_id) fd.append('category_id', values.category_id);
    if (values.brand_id) fd.append('brand_id', values.brand_id);
    fd.append('introduction', values.introduction);
    fd.append('spec', values.spec);
    fd.append(
      'skus',
      JSON.stringify(
        values.skus.map((s) => ({
          size_id: Number(s.size_id),
          price: Number(s.price),
          sku_code: s.sku_code,
          stock: Number(s.stock),
        }))
      )
    );
    Array.from(values.images).forEach((file) => {
      fd.append('images', file);
    });

    const res = await fetch(`${base}/api/products`, {
      method: 'POST',
      body: fd,
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/product/${data.product.id}`);
    } else {
      alert('建立商品失敗');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl mb-4">新增商品</h1>

      {/* 傳入 form 實例 */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 商品名稱 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品名稱</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="輸入商品名稱" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 分類 Dropdown */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分類</FormLabel>
                <FormControl>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full text-left">
                        {categories.find((c) => String(c.id) === field.value)
                          ?.name || '選擇分類'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {categories.map((cat) => (
                        <DropdownMenuItem
                          key={cat.id}
                          onSelect={() => field.onChange(String(cat.id))}
                        >
                          {cat.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 品牌 Dropdown */}
          <FormField
            control={form.control}
            name="brand_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>品牌</FormLabel>
                <FormControl>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full text-left">
                        {brands.find((b) => String(b.id) === field.value)
                          ?.name || '選擇品牌'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {brands.map((b) => (
                        <DropdownMenuItem
                          key={b.id}
                          onSelect={() => field.onChange(String(b.id))}
                        >
                          {b.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 商品介紹 */}
          <FormField
            control={form.control}
            name="introduction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品介紹</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} placeholder="簡短介紹" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 商品規格 */}
          <FormField
            control={form.control}
            name="spec"
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品規格</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} placeholder="詳細規格" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 多檔圖片上傳 */}
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品圖片</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormDescription>可多選，上傳後依順序排序</FormDescription>
              </FormItem>
            )}
          />

          {/* 動態 SKU 列表 */}
          <div>
            <h2 className="text-xl mb-2">商品變體 (SKU)</h2>
            {fields.map((item, idx) => (
              <div
                key={item.id}
                className="grid grid-cols-4 gap-4 items-end mb-4"
              >
                {/* 尺寸 Dropdown */}
                <FormField
                  control={form.control}
                  name={`skus.${idx}.size_id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>尺寸</FormLabel>
                      <FormControl>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              {sizes.find((s) => String(s.id) === field.value)
                                ?.name || '選尺寸'}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {sizes.map((s) => (
                              <DropdownMenuItem
                                key={s.id}
                                onSelect={() => field.onChange(String(s.id))}
                              >
                                {s.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 價格 */}
                <FormField
                  control={form.control}
                  name={`skus.${idx}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>價格</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="NT$" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 庫存 */}
                <FormField
                  control={form.control}
                  name={`skus.${idx}.stock`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>庫存</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="數量" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SKU Code */}
                <FormField
                  control={form.control}
                  name={`skus.${idx}.sku_code`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="輸入 SKU 編碼" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 刪除按鈕 */}
                <div className="col-span-4 text-right">
                  {fields.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      type="button"
                      onClick={() => remove(idx)}
                    >
                      刪除
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* 新增變體 */}
            <Button
              type="button"
              variant=""
              onClick={() =>
                append({ size_id: '', price: '', sku_code: '', stock: '' })
              }
            >
              新增變體
            </Button>
          </div>

          {/* 送出按鈕 */}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? '建立中…' : '建立商品'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
