'use client';

import { useRouter } from 'next/navigation'; // 加入 useRouter
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { HiCalendarDateRange } from 'react-icons/hi2';
import { IoLocationOutline } from 'react-icons/io5';
import { GiArtificialHive } from 'react-icons/gi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';

const base = process.env.NEXT_PUBLIC_API_BASE || '';

const COURSES_API = 'http://localhost:3005/api/coaches/me/courses';
const DELETE_API = (coachId, courseId) =>
  `http://localhost:3005/api/coaches/${coachId}/courses/${courseId}`;

const fetcher = async (url) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    const err = new Error('請求失敗');
    err.status = res.status;
    err.info = await res.text();
    throw err;
  }
  return res.json();
};

export default function ProfileCourses() {
  const router = useRouter(); // 使用 Next.js router
  const { isAuth, user } = useAuth(); // 假設 useAuth 提供當前使用者資訊
  const { mutate } = useSWRConfig();
  const [filter, setFilter] = useState('student');
  const [pendingDelete, setPendingDelete] = useState(null);

  const { data, isLoading, error } = useSWR(
    isAuth ? COURSES_API : null,
    fetcher
  );

  if (!isAuth) return <p className="text-sm">尚未登入</p>;
  if (isLoading) return <p className="text-sm">載入中…</p>;
  if (error)
    return (
      <p className="text-sm text-destructive">讀取失敗（{error.status}）</p>
    );

  const rawCourses =
    filter === 'student' ? data?.asStudent ?? [] : data?.asCoach ?? [];

  const courses = rawCourses.map((c) => {
    const [startAt = '', endAt = ''] = (c.date ?? '').split(' ~ ');
    return {
      id: c.id,
      name: c.name,
      startAt,
      endAt,
      image: c.photo,
      location: '',
      coachId: c.coach_id ?? c.coachId,
    };
  });

  const doDelete = async (coachId, courseId) => {
    try {
      const res = await fetch(DELETE_API(coachId, courseId), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      mutate(COURSES_API);
    } catch (err) {
      console.error(err);
      alert('刪除失敗 - ' + err.message);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {filter === 'student' ? '已報名課程' : '我開辦的課程'}
              </CardTitle>
              <CardDescription>共 {courses.length} 筆</CardDescription>
            </div>
            <div className="flex items-center justify-end gap-2">
              {filter === 'coach' && (
                <Button
                  onClick={() => {
                    if (user?.id) {
                      router.push(`/coaches/${user.id}/create`);
                    } else {
                      alert('無法取得使用者 ID');
                    }
                  }}
                  className="flex flex-wrap items-center gap-2 md:flex-row"
                >
                  創立課程
                </Button>
              )}

              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="篩選課程" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">參加課程</SelectItem>
                  <SelectItem value="coach">開辦課程</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {courses.length === 0 && (
            <p className="text-muted-foreground">目前沒有任何課程。</p>
          )}

          {courses.map((c, idx) => (
            <article
              key={`${c.id}-${idx}`}
              className="flex flex-col md:flex-row justify-between gap-4 rounded-lg border p-4 min-w-0"
            >
              <Image
                src={c.image?.startsWith('http') ? c.image : `${base}${c.image}`}
                alt={c.name}
                width={20}
                height={20}
                className="w-full md:w-1/2 flex-shrink-0 aspect-[4/3] rounded-md object-cover"
              />

              <div className="flex flex-col md:w-1/2">
                <div className="flex flex-col justify-center gap-3 flex-grow">
                  <div className="font-medium flex gap-2 items-center line-clamp-2">
                    <GiArtificialHive /> {c.name}
                  </div>

                  <div className="text-sm text-muted-foreground flex gap-2 items-center">
                    <HiCalendarDateRange className="size-4" />
                    {c.startAt} ~ {c.endAt}
                  </div>

                  {c.location && (
                    <div className="text-sm flex gap-2 items-center">
                      <IoLocationOutline /> {c.location}
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-end gap-2">
                  <Button asChild variant="outline">
                    <Link
                      href={
                        filter === 'coach'
                          ? `/coaches/${c.coachId}/courses/${c.id}/edit`
                          : `/courses/${c.id}`
                      }
                    >
                      {filter === 'coach' ? '編輯' : '查看'}
                    </Link>
                  </Button>

                  {filter === 'coach' && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        setPendingDelete({
                          coachId: c.coachId,
                          courseId: c.id,
                          courseName: c.name,
                        })
                      }
                    >
                      刪除
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確定刪除？</DialogTitle>
          </DialogHeader>
          <p>
            將永久刪除課程「
            <span className="font-semibold">{pendingDelete?.courseName}</span>
            」，此操作不可復原。
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDelete)
                  doDelete(pendingDelete.coachId, pendingDelete.courseId);
                setPendingDelete(null);
              }}
            >
              確定刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
