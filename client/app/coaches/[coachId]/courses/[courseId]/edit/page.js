'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseForm from '@/app/coaches/_component/courseform';

export default function EditCoursePage() {
  const { coachId, courseId } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:3005/api/coaches/${coachId}/courses/${courseId}/edit`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error('找不到課程或無權限');
        const json = await res.json();

        /* 轉成 CourseForm 需要的格式 ↓↓↓ */
        setData({
          ...json,
          start_at: json.start_at.slice(0, 10), // to datetime-local
          end_at: json.end_at.slice(0, 10),
          tags: json.CourseTag?.map((t) => t.tag.name).join(',') || '',
          course_imgs: [], // 先清空，新上傳才送
        });
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [coachId, courseId]);

  if (loading) return <p className="p-6">載入中…</p>;
  if (err) return <p className="p-6 text-red-500">{err}</p>;

  return <CourseForm mode="edit" initialData={data} />;
}
