'use client';

import React, { useEffect, useState } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import Link from 'next/link';
import { SelectTrigger } from '@radix-ui/react-select';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tempFilters, setTempFilters] = useState({
    keyword: '',
    boardTypes: [],
    languages: [],
  });
  const [filters, setFilters] = useState({
    keyword: '',
    boardTypes: [],
    languages: [],
  });

  useEffect(() => {
    fetch('http://localhost:3005/api/coaches')
      .then((res) => {
        if (!res.ok) throw new Error('讀取失敗');
        return res.json();
      })
      .then((data) => {
        setCoaches(data);
        setFiltered(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(
      coaches.filter((t) => {
        const mk = !filters.keyword || t.name.includes(filters.keyword);
        const mb =
          filters.boardTypes.length === 0 ||
          filters.boardTypes.some((bt) => t.boardtypes.includes(bt));
        const ml =
          filters.languages.length === 0 ||
          filters.languages.some((lg) => t.languages.includes(lg));
        return mk && mb && ml;
      })
    );
  }, [coaches, filters]);

  const handleSearch = () => setFilters({ ...tempFilters });
  const handleClear = () => {
    const empty = { keyword: '', boardTypes: [], languages: [] };
    setTempFilters(empty);
    setFilters(empty);
  };

  const toggleItem = (key, value) => {
    setTempFilters((f) => {
      const list = f[key].includes(value)
        ? f[key].filter((x) => x !== value)
        : [...f[key], value];
      return { ...f, [key]: list };
    });
  };

  if (loading) return <p className="text-center p-4">載入中…</p>;
  if (error)
    return <p className="text-center p-4 text-red-600">錯誤：{error}</p>;
  if (!filtered.length)
    return <p className="text-center p-4">找不到符合的教練。</p>;

  return (
    <main className=" min-h-screen pb-8">
      <div className="mx-auto p-8 ">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* 板別 下拉多選 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  單/雙板{' '}
                  {tempFilters.boardTypes.length > 0
                    ? `(${tempFilters.boardTypes.length})`
                    : ''}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel></DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['單板', '雙板'].map((bt) => (
                  <DropdownMenuCheckboxItem
                    key={bt}
                    checked={tempFilters.boardTypes.includes(bt)}
                    onCheckedChange={() => toggleItem('boardTypes', bt)}
                  >
                    {bt}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* 語言 下拉多選 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  授課語言{' '}
                  {tempFilters.languages.length > 0
                    ? `(${tempFilters.languages.length})`
                    : ''}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel>選擇語言</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['中文', '日文', '英文', '韓文', '粵語'].map((lg) => (
                  <DropdownMenuCheckboxItem
                    key={lg}
                    checked={tempFilters.languages.includes(lg)}
                    onCheckedChange={() => toggleItem('languages', lg)}
                  >
                    {lg}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* 關鍵字 */}
            <Input
              placeholder="請輸入關鍵字…"
              value={tempFilters.keyword}
              onChange={(e) =>
                setTempFilters((f) => ({ ...f, keyword: e.target.value }))
              }
              className="flex-shrink-0 w-40"
            />
            {/* 按鈕 */}
            <div className=" flex gap-2">
              <Button size="sm" onClick={handleSearch}>
                <Send className="mr-1" /> 搜尋
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear}>
                <X className="mr-1" /> 清除
              </Button>
            </div>
          </div>
        </CardContent>
      </div>

      {/* 教練列表 */}
      <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl shadow p-6 text-center transform hover:scale-[1.02] transition"
          >
            <Link href={`/coaches/${t.id}`}>
              <Image
                src={`http://localhost:3005/${t.profilephoto}`}
                alt={t.name}
                width={150}
                height={150}
                className="w-32 h-32 rounded-full mx-auto object-cover"
              />
            </Link>
            <h2 className="mt-4 text-xl font-semibold">{t.name}</h2>
            <p className="mt-2 text-sm text-gray-600">
              板別：{t.boardtypes.join('、') || '無'}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              語言：{t.languages.join('、') || '無'}
            </p>
            {/* <Link href={`/coaches/${t.id}`}>
              <Button className="mt-4 w-full">查看課程</Button>
            </Link> */}
          </div>
        ))}
      </div>
    </main>
  );
}
