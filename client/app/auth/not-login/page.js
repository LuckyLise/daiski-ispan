'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotLogin({ children }) {
  const router = useRouter();
  const { user, isAuth, isLoading, didAuthMount } = useAuth();
  if (isAuth) {
    return router.push('/');
  }

  // 等待 auth 初始化
  if (!didAuthMount || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        載入中...
      </div>
    );
  }

  // 未登入時顯示提示並導至登入
  if (!isAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              請先登入
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              您需要登入才能繼續操作。
            </p>
            <Button
              onClick={() => router.push('/auth/login')}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              前往登入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
