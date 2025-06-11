'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Container from '@/components/container';
//頭像互動引入
import EditableAvatar from './_components/EditableAvatar';
// 優惠卷引入
import ProfileCoupons from './_components/profile-coupons';
// 收藏引入
import ProfileWishlist from './_components/profile-wishlist';
//揪團頁引入
import ProfileGroups from './_components/profile-groups';
//課程頁引入
import ProfileCourses from './_components/profile-courses';
//訂單頁面引入
import ProfileOrders from './_components/profile-orders';

//會員資訊的驗證 schema  限制字數上限
const FormSchema = z.object({
  name: z.string().min(1, '必填'),
  email: z.string().email('Email 格式錯誤'),
  phone: z.string().min(1, '必填'),
  bio: z.string().max(2000, '最多 2000 字'),
});

export default function MemberPage() {
  const { user } = useAuth();
  //個人資訊區塊，使用Textarea+form元件的變數宣告
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
      bio: user?.bio ?? '',
    }, // 建議加上預設值，避免未定義警告
  });
  const base = process.env.NEXT_PUBLIC_API_BASE || '';
  async function onSubmit(values) {
    try {
      const res = await fetch(`${base}/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('更新失敗');

      toast.success('更新成功！');
    } catch (err) {
      toast.error(err.message ?? '發生錯誤');
    }
  }
  const [src, setSrc] = useState(
    // user.avatar ? `http://localhost:3005${user.avatar}` : '/avatar.webp'
    user.avatar
    // `http://localhost:3005/api/profile/avatar/${user.id}`
  ); // 當前顯示的頭像 URL
  console.log(src);
  return (
    <div className="min-h-screen w-full bg-fixed bg-cover pt-8 bg-[url('/home-images/layer2.png')]  dark: bg-no-repeat relative">
      <div className="absolute inset-0  dark:bg-black/60 hidden dark:block" />
      <div className="relative z-10">
        <Container className="">
          {/* Header */}
          <header className="flex flex-col items-center gap-4">
            {/* Avatar */}
            <EditableAvatar
              userId={user.id}
              src={src}
              setSrc={setSrc}
              className="mt-5"
            />
            <h1 className="text-h6-tw font-medium tracking-tight text-base pb-3">
              會員中心
            </h1>
          </header>
          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            {/* Tabs Navigation */}
            <TabsList className="flex flex-col md:flex-row w-full h-full">
              <div className="grid w-full grid-cols-3">
                <TabsTrigger value="info">會員資訊</TabsTrigger>
                <TabsTrigger value="courses">課程</TabsTrigger>
                <TabsTrigger value="groups">揪團</TabsTrigger>
              </div>

              <div className="grid w-full grid-cols-3">
                <TabsTrigger value="favorites">我的收藏</TabsTrigger>
                <TabsTrigger value="orders">訂單紀錄</TabsTrigger>
                <TabsTrigger value="coupons">優惠卷</TabsTrigger>
              </div>
            </TabsList>
            {/* Tabs Content */}
            <TabsContent
              value="info"
              className="space-y-6 max-h-[580px] overflow-y-auto"
            >
              {/* Example Card inside a tab */}
              <Card className="">
                <CardHeader>
                  <CardTitle>基本資料</CardTitle>
                  <CardDescription>
                    更新您的個人信息以保持資料最新。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    {/* shadcn 的 Form 只是 Context Provider，不會輸出 <form> 標籤 */}
                    <Form {...form}>
                      {/* 這裡保留唯一的 <form>，負責整段提交 */}
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Input your name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="you@example.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>電話</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="09xx-xxx-xxx"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {/* ---- React-Hook-Form 欄位 ---- */}
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>個人簡介</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us a little bit about yourself"
                                  className="resize-none  overflow-y-auto h-64 max-h-64 "
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* 送出按鈕 */}
                        <Button type="submit">更新</Button>
                      </form>
                    </Form>
                  </div>
                  {/* ------- */}
                </CardContent>

                <CardFooter></CardFooter>
              </Card>
            </TabsContent>
            {/* 課程頁引入 */}
            <TabsContent value="courses" className="overflow-y-auto">
              <ProfileCourses />
            </TabsContent>
            {/* 揪團頁引入 */}
            <TabsContent value="groups" className="overflow-y-auto">
              <ProfileGroups />
            </TabsContent>
            {/* 訂單紀錄頁引入 */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>訂單紀錄</CardTitle>
                </CardHeader>
                <CardContent>
                <ProfileOrders />
                </CardContent>
              </Card>
            </TabsContent>
            {/* 收藏頁引入 */}
            <TabsContent value="favorites">
              <Card className="p-4">
                <ProfileWishlist />
              </Card>
            </TabsContent>
            {/* 優惠卷引入 */}
            <TabsContent value="coupons" className="">
              <Card>
                <ProfileCoupons />
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </div>
    </div>
  );
}
