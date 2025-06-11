'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Clock5, MapPin, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

import Image from 'next/image';
import { memo, useMemo } from 'react';
import Container from '@/components/container';
import Link from 'next/link';
// import CourseMap from '../_component/coursemap';

const CourseMap = dynamic(() => import('../_component/coursemap'), {
  ssr: false,
  loading: () => <p>地圖載入中…</p>,
});
export default function CoursesIdPage() {
  // useEffect(() => {
  //   // 解決 icon 不顯示的問題
  //   delete L.Icon.Default.prototype._getIconUrl;
  //   L.Icon.Default.mergeOptions({
  //     iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  //     iconUrl: require('leaflet/dist/images/marker-icon.png'),
  //     shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  //   });
  // }, []);

  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const coaches = () => {
    if (!Array.isArray(course.variants)) return [];
    const map = new Map();
    course.variants.forEach((v) => {
      if (v.coach) map.set(v.coach.id, v.coach); // v.coach = { id, name, photo }
    });
    return [...map.values()];
  };

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3005/api/courses/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`${res.status}: ${txt}`);
        }
        return res.json();
      })
      .then((data) => setCourse(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-center">載入中…</p>;
  if (error)
    return <p className="p-8 text-center text-red-600">錯誤：{error}</p>;
  if (!course) return <p className="p-8 text-center">找不到課程資料。</p>;
  const variant = coaches.length ? course.variants[0] : null;

  return (
    <>
      <main className=" py-8 bg-gray-100 dark:bg-background  min-h-screen">
        {/* 主卡片 */}
        <Container>
          <div className="bg-white dark:bg-background md:grid md:grid-cols-[3fr_1fr] gap-8 rounded-2xl shadow-lg mb-8">
            {/* hero圖片 */}
            <div className="relative md:col-span-2 ">
              <Image
                src={
                  course.images
                    ? `http://localhost:3005${course.images[course.images.length - 1]}`
                    : ''
                }
                alt="{course.name}"
                width={1080}
                height={360}
                className="w-full h-64 object-cover  rounded-t-lg overflow-hidden "
              />

              {/* 標籤 */}
              <div className="absolute left-0 px-8 flex flex-wrap gap-2 py-6">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-white rounded bg-blue-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 課程名稱 */}
            <div className="p-6 space-y-8 w-full">
              <h1 className="text-2xl mb-2 font-bold">{course.name}</h1>
              <ul className="flex flex-col w-full">
                {/* 課程日期 */}
                <li className="flex items-center justify-start mb-2">
                  <Clock5
                    size={20}
                    className="min-w-[20px] inline-block pr-0.5"
                  />
                  {course.period}
                </li>
                {/* 課程地點 */}
                <li className="flex lg:items-center justify-start mb-2">
                  <MapPin size={20} className="min-w-[20px] inline-block " />
                  {course.variants[0]?.location.city}
                  {course.variants[0]?.location.country &&
                    `,${course.variants[0].location.country}`}
                  {course.variants[0]?.location.address &&
                    `,${course.variants[0].location.address}`}
                </li>
                <li className="flex lg:items-center justify-start mb-2">
                  <LocateFixed size={20} />
                  {course.variants[0]?.location.name}
                </li>
              </ul>
              <div className="bg-white dark:bg-background border border-gray-200 rounded-2xl p-6 mb-6  w-full ">
                {/* 單雙板 */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">單/雙板</h2>
                  <p>{course.variants[0]?.boardtype.name}</p>
                </div>
                {/* 難易度 */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">難易度</h2>
                  <p>{course.difficulty}</p>
                </div>
                {/* 教練 */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">指導教練</h2>
                  <p>{course.variants[0]?.coach.name}</p>
                </div>
                {/* 課程簡介 */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">課程簡介</h2>
                  <p className="text-gray-700 dark:text-white">
                    {course.description}
                  </p>
                </div>
                {/* 課程內容 */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">課程內容</h2>
                  <div
                    className="text-gray-700 dark:text-white"
                    dangerouslySetInnerHTML={{ __html: course.content }}
                  >
                    {/* {course.content} */}
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="px-8 py-6 space-y-6"></div> */}

            {/* ——— 右側側邊欄 ——— */}
            <div className="w-80 md:p-0 px-6 ">
              {/* sticky 直到距離頂端 6rem (= top-24) */}
              <div className="sticky top-24  space-y-4">
                {/* 報名卡片 */}
                <div className="bg-white  p-6 sm:ml-0 ml-17 rounded-2xl shadow-lg  ">
                  <div className="flex justify-center">
                    {/* Logo */}
                    <img
                      src="/LOGO-dark.svg"
                      width={100}
                      height={48}
                      alt="logo"
                      className="item-center"
                    />
                  </div>
                  <Link href={`/courses/${id}/sign-up`}>
                    <button className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-500 transition">
                      立即報名
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            {course.variants[0]?.location?.latitude && (
              <div className="bg-white dark:bg-background rounded-2xl shadow-lg mt-0 p-6 space-y-4">
                <h2 className="text-xl font-semibold">課程地點地圖</h2>
                <CourseMap
                  lat={course.variants[0].location.latitude}
                  lng={course.variants[0].location.longitude}
                  name={course.variants[0].location.name}
                />
              </div>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}
