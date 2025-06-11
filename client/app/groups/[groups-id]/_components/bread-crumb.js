// app/groups/[groups-id]/_components/GroupBreadcrumbAndBack.js
'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
// import { FaChevronLeft } from 'react-icons/fa'; // 如果使用 react-icons
import Link from 'next/link';

export default function GroupBreadCrumb({ title, router }) {
  return (
    <div className="w-full max-w-screen-2xl mx-auto space-y-2">
      <nav className="text-sm text-secondary-800 mb-2 " aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:underline dark:text-white">
              首頁
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/groups" className="hover:underline dark:text-white">
              揪團總覽
            </Link>
          </li>
          <li>/</li>
          <li className="text-muted-foreground truncate max-w-[200px] sm:max-w-xs dark:text-white">
            {title || '揪團標題'}
          </li>
        </ol>
      </nav>
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/groups')}
          className="inline-flex items-center font-medium bg-secondary-500 text-primary-500 px-3 py-1 hover:bg-secondary-500/80 transition rounded-md text-sm dark:text-white"
        >
          {/* <FaChevronLeft className="mr-1 h-3 w-3" /> */}
          <span className="mr-1 ">←</span>返回揪團總覽
        </Button>
      </div>
    </div>
  );
}
