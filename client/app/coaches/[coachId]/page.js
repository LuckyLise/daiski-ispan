'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
export default function CoachIdPage(props) {
  // state 宣告
  const [coach, setCoach] = useState(null); // 存放教練物件
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const coachesId = useParams().coachId;
  console.log(coachesId);
  console.log(coach);
  useEffect(() => {
    if (!coachesId) return;
    fetch(`http://localhost:3005/api/coaches/${coachesId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`錯誤`);
        }
        return res.json();
      })
      .then((data) => {
        setCoach(data);
      })
      .catch((err) => {
        console.error('取得教練失敗:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [coachesId]);
  console.log(coach);
  if (loading) {
    return <p className="text-center p-4">載入中…</p>;
  }
  if (error) {
    return (
      <p className="text-center p-4 text-red-600">讀取資料失敗：{error}</p>
    );
  }
  if (!coach) {
    return <p className="text-center p-4">找不到教練資料。</p>;
  }
  console.log(coach.license);
  return (
    <>
      <main className="mx-auto p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 教練照片 */}
          <div className="w-full lg:w-1/3">
            <img
              src={`http://localhost:3005${coach.profilephoto}`}
              alt={coach.name}
              width={500}
              height={600}
              className="rounded-lg object-cover"
            />
          </div>
          {/* 教練資訊 */}
          <div className="flex-1 space-y-6">
            {/* 教練姓名 */}
            <h1 className="text-3xl">{coach.name}</h1>
            {/* 板類標籤 */}
            <div className="flex flex-wrap gap-2">
              {coach.boardtypes.join('、') || '無資料'}
            </div>
            {/* 授課語言 */}
            <div className="">
              <h2 className="text-lg mb-1 text-primary-600 dark:text-white font-semibold">
                授課語言
              </h2>
              <p className="text-gray-700 dark:text-white">
                {coach.languages.join('、') || '無資料'}
              </p>
            </div>
            {/* 個人經歷 */}
            <div className="">
              <h2 className="text-lg mb-1 text-primary-600 dark:text-white font-semibold">
                個人經歷
              </h2>
              <p className="text-gray-700 dark:text-white">
                {coach.experience}
              </p>
            </div>
            {/* 自我介紹 */}
            <div className="">
              <h2 className="text-lg mb-1 text-primary-600 dark:text-white font-semibold">
                自我介紹
              </h2>
              <p className="text-gray-700 dark:text-white">{coach.bio}</p>
            </div>
            {/* 證照 */}
            <div className="">
              <h2 className="text-lg mb-1 text-primary-600  dark:text-white font-semibold">
                專業證照
              </h2>
              {coach.license.map((l, i) => {
                return (
                  <React.Fragment key={i}>
                    <p>{l}</p>

                    {/* <br /> */}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-12" id="courses">
          <h2 className="text-2xl mb-6 ">課程資訊</h2>
          {coach.courses.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row items-center bg-white  border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6"
            >
              {/* 課程封面 */}
              <div className=" sm:w-1/4 w-full  h-40 relative overflow-hidden ">
                <Image
                  src={`http://localhost:3005${c.photo}`}
                  alt={c.name}
                  width={500}
                  height={200}
                  className="object-cover  "
                />
              </div>
              <div className="flex-1 p-2">
                <p className="text-sm text-gray-500">
                  {new Date(c.date).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </p>
                <h3 className="dark:text-black">{c.name}</h3>
              </div>
              <div className="p-4">
                <button className="m-8 px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700">
                  <Link href={`/courses/${c.id}`}>查看課程</Link>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
