'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PiPersonSimpleSki } from 'react-icons/pi';
import { MapPinned } from 'lucide-react';
// import { InputWithButton } from './_component/input';
import { Input } from '@/components/ui/input';
import PaginationBar from './_component/pagination';
import { DatePickerWithRange } from './_component/datepicker';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Snowflake, LocateFixed, MountainSnow } from 'lucide-react';
import Image from 'next/image';
import Container from '@/components/container';

export default function CoursesPage() {
  const [draft, setDraft] = useState({
    location: '',
    difficulty: '',
    keyword: '',
    boardtype: '',
  });
  // 送出查詢的篩選條件
  // const [filters, setFilters] = useState({});
  // console.log(filters);
  /* -------- 後端載入下拉選單的選項 -------- */
  const [options, setOptions] = useState({
    boardTypes: [],
    locations: [],
    difficulties: [],
  });
  console.log(options);
  const [course, setCourses] = useState([]);
  const [showCourse, setShowCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clear, setClear] = useState(false);

  /* === A. 第一次載入先抓「可選條件」 === */
  useEffect(() => {
    fetch('http://localhost:3005/api/courses/filters')
      .then((res) => res.json())
      .then(setOptions)
      .catch(() => setError('載入篩選清單失敗'));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3005/api/courses`)
      .then((r) => r.json())
      .then((data) => {
        // ★ 後端回傳 { data, total }
        setCourses(data);
        setShowCourse(data);
      })
      .catch(() => setError('載入課程失敗'))
      .finally(() => setLoading(false));
  }, []);

  /* -------- C. 事件處理 -------- */
  const handleSearch = () => {
    const kw = draft.keyword.trim();
    setPage(1); // ★ 新搜尋回到第 1 頁
    const btmap = { 1: '單板', 2: '雙板' };
    console.log(draft);

    const result = course.filter((item) => {
      /* 如果某個篩選沒選，就略過該欄位的比較 */
      const okLocation = !draft.location || item.location === draft.location;
      const okDifficulty =
        !draft.difficulty || item.difficulty === draft.difficulty;
      const okBoardType =
        !draft.boardtype || btmap[item.boardtype] === draft.boardtype;
      const okKeyword = !kw || item.name.includes(kw);
      return okLocation && okDifficulty && okBoardType && okKeyword;
    });

    setShowCourse(result);
    console.log('fdkgj');
  };

  const [page, setPage] = useState(1);
  const pageSize = 12; //每頁12筆
  const pageCount = Math.ceil(showCourse.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageData = showCourse.slice(startIndex, endIndex);

  const clearFilters = () => {
    setDraft({ boardtype: '', location: '', difficulty: '', keyword: '' });
    // setFilters({}); // 顯示全部
    // handleSearch();
    setClear(!clear);
  };
  useEffect(() => {
    handleSearch();
  }, [clear]);

  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative bg-cover bg-[center_80%] bg-no-repeat h-[30vh] md:h-[60vh]  text-center"
        // style={{
        //   backgroundImage: "url('/26852e04-a393-422d-bd61-8042373024da.png')", // 請確認此圖片路徑正確
        // }}
      >
        <video
          className="absolute w-full h-full object-cover "
          src="/CourseHeroSection.mp4" // 把這裡改成影片檔路徑，放在 public 資料夾下即可用相對路徑引用
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0  "></div>
        {/* 使用黑色疊加和模糊效果 */}
        {/* 背景使用 bg-white 加上透明度，或者如果 :root 的 --background 是白色，用 bg-background/85 */}
      </section>
      <Container>
        {/* 篩選列 */}

        <div className=" mx-auto p-8">
          <div className="flex items-center justify-center  gap-2 mb-4 relative">
            {/* <div className="flex flex-wrap items-center gap-4"> */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="mx-auto sm:p-8 p-4 flex flex-wrap items-end gap-4"
            >
              {/* boardtype */}
              <Select
                value={draft.boardtype}
                /* 只會拿到 value（字串），沒有 e.target */
                onValueChange={(val) =>
                  setDraft((d) => ({ ...d, boardtype: val }))
                }
              >
                <SelectTrigger className="sm:w-[180px] w-[150px]">
                  <MountainSnow />
                  <SelectValue placeholder="單 / 雙板" />
                </SelectTrigger>

                <SelectContent>
                  {options.boardTypes.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Location */}
              <Select
                value={draft.location}
                /* 只會拿到 value（字串），沒有 e.target */
                onValueChange={(val) =>
                  setDraft((d) => ({ ...d, location: val }))
                }
              >
                <SelectTrigger className="sm:w-[180px] w-[150px]">
                  <LocateFixed />
                  <SelectValue placeholder="雪場" />
                </SelectTrigger>

                <SelectContent>
                  {options.locations.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* difficulty */}
              <Select
                value={draft.difficulty}
                /* 只會拿到 value（字串），沒有 e.target */
                onValueChange={(val) =>
                  setDraft((d) => ({ ...d, difficulty: val }))
                }
              >
                <SelectTrigger className="sm:w-[180px] w-[150px]">
                  <Snowflake />
                  <SelectValue placeholder="難易度" />
                </SelectTrigger>

                <SelectContent>
                  {options.difficulties.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Keyword */}
              <Input
                className="sm:w-[180px] w-[150px]"
                placeholder="請輸入關鍵字..."
                value={draft.keyword}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, keyword: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              {/* 查詢 / 清除按鈕 */}
              <div className="flex gap-2  ">
                <Button type="submit">查詢</Button>
                <Button type="button" variant="outline" onClick={clearFilters}>
                  清除
                </Button>
              </div>
            </form>
          </div>
          {/* </div> */}
        </div>
        {/* 課程卡片 */}
        {loading ? (
          <p className="text-center p-8">載入中…</p>
        ) : showCourse.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8  sm:mx-0 mx-10 align-items-center ">
            {pageData.map((c) => (
              <div
                key={c.id}
                className=" max-auto rounded-xl shadow-md overflow-hidden border bg-white"
              >
                <Link href={`/courses/${c.id}`}>
                  <Image
                    src={`http://localhost:3005/${c.photo}`}
                    alt={c.name}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover hover:scale-[1.02] transition"
                  />
                </Link>

                <div className="p-4">
                  <Link href={`/courses/${c.id}`}>
                    <h3 className="">{c.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500">{c.location}</p>
                  <p className="text-sm text-gray-500 mt-1">{c.period}</p>

                  <p className="text-sm  mt-2 mb-2">
                    售價
                    <span className="text-red-500">
                      {' '}
                      $NT {(+c.price).toLocaleString()}{' '}
                    </span>
                    起
                  </p>
                  <hr />
                  {/* 點按鈕也能進入詳細頁 */}
                  <Link href={`/courses/${c.id}`}>
                    <button className="mt-4 w-full bg-gray-800 text-white text-sm py-2 rounded-full hover:bg-gray-700 trsndition">
                      查看課程
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-gray-500">
            沒有符合條件的課程喔！
          </p>
        )}
      </Container>
      {/* 分頁 */}
      <Pagination className="mb-10 mt-10">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            />
          </PaginationItem>
          {Array.from({ length: pageCount }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <PaginationItem key={pageNum} onClick={() => setPage(pageNum)}>
                <PaginationLink href="#">{pageNum}</PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
              disabled={page === pageCount}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
