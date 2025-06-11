// app/groups/list/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CustomPagination } from '../_components/group-pagination'; // 假設分頁元件路徑
import Image from 'next/image';
import Link from 'next/link';
import { PopoverClose } from '@radix-ui/react-popover';

export default function GroupListPage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';

  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '全部',
    date: '',
    location: '全部',
    keyword: '',
  });
  const [typeOptions, setTypeOptions] = useState(['全部']);
  const [locationOptions, setLocationOptions] = useState(['全部']);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 12;

  // 用於篩選類型顯示與後端請求的映射
  const typeDisplayMap = {
    SKI: '滑雪團',
    MEAL: '美食團',
    // ... 其他類型對應
  };
  const typeEnumKeyMap = {
    // 反向映射，用於發送給後端
    滑雪團: 'SKI',
    美食團: 'MEAL',
  };

  // 載入篩選選項
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [typesRes, locsRes] = await Promise.all([
          fetch(`${API_BASE}/api/group?onlyTypes=true`),
          fetch(`${API_BASE}/api/location`),
        ]);
        if (!typesRes.ok || !locsRes.ok) {
          console.error(
            'Failed to fetch filter options:',
            typesRes.status,
            locsRes.status
          );
        }
        const typesData = await typesRes.json(); // 預期是 ['SKI', 'MEAL', ...]
        const locsData = await locsRes.json();

        const uniqueTypes = Array.from(
          new Set(typesData?.map((t) => typeDisplayMap[t] || t) || [])
        );
        setTypeOptions(['全部', ...uniqueTypes]);

        const locationNames = (locsData || []).map((loc) => loc.name);
        const uniqueLocationNames = Array.from(new Set(locationNames));
        setLocationOptions(['全部', ...uniqueLocationNames]);
      } catch (err) {
        console.error('載入篩選選項失敗:', err);
        setTypeOptions(['全部']);
        setLocationOptions(['全部']);
      }
    }
    loadFilterOptions();
  }, [API_BASE]);

  // 獲取揪團列表
  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
        });
        if (filters.type && filters.type !== '全部') {
          const typeParam = typeEnumKeyMap[filters.type] || filters.type; // 轉換為 Enum Key
          params.append('type', typeParam);
        }
        if (filters.date) params.append('date', filters.date);
        if (filters.location && filters.location !== '全部')
          params.append('location', filters.location);
        if (filters.keyword && filters.keyword.trim() !== '')
          params.append('keyword', filters.keyword.trim());

        const res = await fetch(`${API_BASE}/api/group?${params.toString()}`);
        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ error: `HTTP error! status: ${res.status}` }));
          throw new Error(
            errorData.error || `無法獲取揪團列表 (狀態 ${res.status})`
          );
        }
        const data = await res.json();
        if (data && Array.isArray(data.groups)) {
          setGroups(
            data.groups.map((g) => ({
              ...g,
              imageUrl:
                g.images && g.images.length > 0 && g.images[0].imageUrl
                  ? g.images[0].imageUrl
                  : g.imageUrl || '/deadicon.png',
              // 假設後端返回的 group.type 是 Enum Key (例如 SKI)
              // 我們在渲染時將其轉換為中文
            }))
          );
          setTotalPages(data.totalPages || 1);
        } else {
          setGroups([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('獲取揪團列表失敗:', err);
        setGroups([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, [filters, page, API_BASE]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '日期未定';
    try {
      const start = new Date(startDate).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      if (!endDate || startDate === endDate) return start;
      const end = new Date(endDate).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return `${start} ~ ${end}`;
    } catch (err) {
      console.warn('日期格式錯誤:', startDate, endDate, err);
      return '日期格式錯誤';
    }
  };

  const difficultyDisplayMap = {
    BEGINNER: '初級',
    INTER: '中級',
    ADVANCE: '進階',
  };

  // 難易度標籤的樣式，如果需要特別的背景色，可以保留，否則可以直接顯示文字
  // const getDifficultyBadgeStyle = (difficultyKey) => { ... };

  return (
    <>
      <title>所有揪團 - Daiski</title>

      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          所有揪團
        </h1>
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-md rounded-lg">
          <div>
            <Label
              htmlFor="type-filter"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              類型
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="type-filter"
                  variant="outline"
                  className="w-full justify-between dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                >
                  {filters.type}{' '}
                  <span aria-hidden="true" className="ml-2">
                    ▾
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverClose>
                <PopoverContent
                  side="bottom"
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] bg-white dark:bg-slate-800 border-border dark:border-slate-700 max-h-60 overflow-y-auto"
                >
                  <div className="flex flex-col space-y-1 p-1">
                    {typeOptions.map((opt) => (
                      <Button
                        key={opt}
                        variant={filters.type === opt ? 'secondary' : 'ghost'}
                        onClick={() =>
                          handleFilterChange({ ...filters, type: opt })
                        }
                        className="w-full justify-start dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </PopoverClose>
            </Popover>
          </div>
          <div>
            <Label
              htmlFor="date-filter"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              日期
            </Label>
            <Input
              id="date-filter"
              type="date"
              value={filters.date}
              onChange={(e) =>
                handleFilterChange({ ...filters, date: e.target.value })
              }
              className="w-full dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
            />
          </div>
          <div>
            <Label
              htmlFor="location-filter"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              地點
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="location-filter"
                  variant="outline"
                  className="w-full justify-between dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                >
                  {filters.location}{' '}
                  <span aria-hidden="true" className="ml-2">
                    ▾
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverClose>
                <PopoverContent
                  side="bottom"
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] bg-white dark:bg-slate-800 border-border dark:border-slate-700 max-h-60 overflow-y-auto"
                >
                  <div className="flex flex-col space-y-1 p-1">
                    {locationOptions.map((opt) => (
                      <Button
                        key={opt}
                        variant={
                          filters.location === opt ? 'secondary' : 'ghost'
                        }
                        onClick={() =>
                          handleFilterChange({ ...filters, location: opt })
                        }
                        className="w-full justify-start dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </PopoverClose>
            </Popover>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <Label
              htmlFor="keyword-filter"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              關鍵字搜尋
            </Label>
            <Input
              id="keyword-filter"
              placeholder="名稱、描述..."
              value={filters.keyword}
              onChange={(e) =>
                handleFilterChange({ ...filters, keyword: e.target.value })
              }
              className="w-full dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
            />
          </div>
        </form>
      </section>

      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 pb-16">
        {loading ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-10">
            載入揪團列表中...
          </p>
        ) : groups.length === 0 ? (
          <div className="text-center py-10 text-slate-600 dark:text-slate-400">
            <p>目前沒有符合條件的揪團，試試調整篩選條件吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group, index) => {
              const groupTypeEnumKey = String(group.type || '').toUpperCase(); // 假設 group.type 是 SKI, MEAL 等
              const displayType =
                typeDisplayMap[groupTypeEnumKey] || group.type; // 轉換為中文顯示類型

              const isSkiGroup = groupTypeEnumKey === 'SKI';
              const difficultyKey = String(
                group.difficulty || ''
              ).toUpperCase();
              const chineseDifficulty = difficultyDisplayMap[difficultyKey];
              const shouldShowDifficulty =
                isSkiGroup && group.difficulty && chineseDifficulty;

              return (
                <Card
                  key={group.id}
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow rounded-lg flex flex-col group bg-white dark:bg-slate-800 p-0"
                >
                  <Link
                    href={`/groups/${group.id}`}
                    className="block flex flex-col flex-grow cursor-none"
                  >
                    <div className="relative w-full aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-t-lg">
                      <Image
                        src={
                          group.imageUrl && group.imageUrl.startsWith('/')
                            ? `${API_BASE}${group.imageUrl}`
                            : group.imageUrl || '/deadicon.png'
                        }
                        alt={group.title || '揪團封面'}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        priority={index < 4}
                        onError={(e) => {
                          e.currentTarget.src = '/deadicon.png';
                          e.currentTarget.alt = '圖片載入失敗';
                        }}
                      />
                    </div>
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 truncate mr-2">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage
                              src={
                                group.user?.avatar
                                  ? group.user.avatar.startsWith('http')
                                    ? group.user.avatar
                                    : `${API_BASE}${group.user.avatar}`
                                  : undefined
                              }
                              alt={group.user?.name || '開團者'}
                            />
                            <AvatarFallback>
                              {group.user?.name
                                ? group.user.name[0].toUpperCase()
                                : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-sm text-slate-600 dark:text-slate-400">
                            {group.user?.name || '匿名用戶'}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs flex-shrink-0 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                        >
                          {displayType} {/* 顯示轉換後的中文類型 */}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1 leading-tight truncate text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {group.title || '無標題揪團'}
                      </h3>
                      <p
                        className="text-xs text-slate-500 dark:text-slate-400 mb-1 truncate"
                        title={group.location || '地點未提供'}
                      >
                        地點：{group.location || '地點未提供'}
                      </p>
                      {/* 條列式顯示難易度 */}
                      {shouldShowDifficulty && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center">
                          難易度：{chineseDifficulty}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        時間：{formatDateRange(group.startDate, group.endDate)}
                      </p>
                      <div className="mt-auto pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>
                          {group.currentPeople || 0}/{group.maxPeople || '不限'}{' '}
                          人
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          NT${' '}
                          {typeof group.price === 'number'
                            ? group.price.toLocaleString()
                            : '洽詢'}
                        </span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>
    </>
  );
}
