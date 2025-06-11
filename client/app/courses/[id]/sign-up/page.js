'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
// import { isDev } from '@/config';
import { toast, ToastContainer } from 'react-toastify';
import { useParams, useRouter } from 'next/navigation';
// import { json } from 'stream/consumers';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
export default function SignUpPage({ params }) {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter(); // 取得 router
  const [submitting, setSubmitting] = useState(false);
  const [course, setCourse] = useState();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '2000-01-01',
    terms: false,
  });
  const { onAdd } = useCart();

  // 載入課程資料
  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(
          `http://localhost:3005/api/courses/${id}/sign-up`
        );
        if (!res.ok) throw new Error('不ok');
        const data = await res.json();
        setCourse(data);
      } catch (error) {
        console.error('載入課程資料失敗:', error);
      }
    }
    fetchCourse();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };
  const editorRef = useRef(null);
  const handleInput = () => {
    if (!editorRef.current) return;
    setForm((prev) => ({
      ...prev,
      content: editorRef.current.innerHTML,
    }));
  };

  // 送出報名
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.terms) {
      return toast.warn('請先同意報名須知');
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:3005/api/courses/${id}/sign-up`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email,
            birthday: form.birthday,
            user_id: user.id,
            course_variant_id: variant.id,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || '報名失敗');
      }
      toast.success('報名成功！');
      onAdd('CartCourse', {
        id: variant.id,
      });

      setTimeout(() => {
        router.push(`/courses/${id}`);
      }, 1200);
      // 清空表單
      setForm({ name: '', phone: '', email: '', birthday: '', terms: false });
    } catch (err) {
      console.log(err);
      toast.error(`報名失敗：${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  if (!course) {
    return <div className="text-center p-6">載入中...</div>;
  }
  // 取第一筆 variant 作為報名對象
  const variant = course.variants[0];
  return (
    <>
      <main className="mt-6 mb-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <Card className="p-8 space-y-6">
            <CardHeader>
              <CardTitle className="text-2xl">{course.name} </CardTitle>
              {/* 課程日期 */}
              <CardDescription className="mt-4">
                日期: {course.period}
              </CardDescription>
              {/* 上課地點 */}
              <CardDescription className="mt-4">
                上課地點:
                {variant.location_id.name ? variant.location_id.name : '未提供'}
              </CardDescription>
              {/* 售價 */}
              <CardDescription className="mt-4">
                費用:{' '}
                <span className=" text-red">NT${variant.price || ''}</span>
              </CardDescription>
            </CardHeader>
            <hr />
            <CardContent>
              <p>學員基本資料</p>
            </CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-6">
              <div className="grid gap-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="請輸入真實姓名"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">電話</Label>
                <Input
                  type="text"
                  id="phone"
                  placeholder=""
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="example@mail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthday">生日</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={handleChange}
                />
              </div>
            </div>
            <hr />
            <CardContent>
              <p>課程簡介</p>
            </CardContent>
            <div className=" sm:grid-cols-2 gap-6 px-6 space-y-3">
              {course.description &&
                course.description.split('\n').map((line, idx) => (
                  <div key={idx}>
                    <p className="text-sm text-gray-600">{line}</p>
                  </div>
                ))}
            </div>
            <CardContent>
              <p>課程內容</p>
            </CardContent>
            {/* <div className=" sm:grid-cols-2 gap-6 px-6 space-y-3">
              {course.content &&
                course.content.split('\n').map((line, idx) => (
                  <div key={idx}>
                    <p className="text-sm text-gray-600">{line}</p>
                  </div>
                ))}
            </div> */}
            <div>
              <Label htmlFor="content">詳細內容</Label>
              {/* 這才是真正的 contenteditable 區塊 */}
              <div
                ref={editorRef}
                onInput={handleInput}
                className="min-h-[200px] w-full border p-2 rounded focus:outline-none"
                style={{ whiteSpace: 'pre-wrap' }}
                // 下面這屬性只是讓 React 不再警告
                suppressContentEditableWarning
                // 初次 render 時放進 innerHTML
                dangerouslySetInnerHTML={{ __html: course.content }}
              />
            </div>
            <hr />
            <CardContent className="flex justify-center px-6">
              <p>《報名須知與退費政策》</p>
            </CardContent>
            <CardFooter>
              <ScrollArea className="h-[200px] w-[680px] rounded-md border p-4 mt-0">
                為保障您的權益，請詳細閱讀以下內容，並於報名前確認您已完全理解並同意本政策：
                一、報名須知 1.報名資格 本課程適合年滿 6
                歲以上身心健康者參加。未滿 18
                歲者需由法定監護人陪同或簽署同意書。 2.裝備說明
                課程不含個人裝備租借費用，若有需要請提前於租借頁面辦理。
                3.行前通知
                課程相關資訊（集合地點、時間、注意事項）將於課程前三日透過電子郵件通知，請務必填寫正確聯絡方式。
                4.保險說明
                課程費用包含基本旅遊平安保險。如需額外保險保障，請自行加保。
                二、退費政策 1.開課前 14 日（含）以前取消 可全額退費，將酌收 5%
                手續費。 2.開課前 7～13 日內取消 可退回已繳費用之 50%。 3.開課前
                6 日內或未到課 恕不退費，亦不得補課或轉讓。
                4.因天候或不可抗力因素取消課程
                主辦單位將提供延期或全額退費選項，無須負擔手續費。
              </ScrollArea>
            </CardFooter>
            <div className="flex justify-center px-6 space-x-2">
              <Checkbox
                id="terms"
                checked={form.terms}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, terms: checked }))
                }
              />
              <Label htmlFor="terms" className="text-sm">
                我已閱讀並同意《報名須知與退費政策》
              </Label>
            </div>

            <hr />
            <div className="flex justify-center px-6 gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  setForm({ name: '', phone: '', email: '', birthday: '' })
                }
              >
                取消
              </Button>
              <Button type="submit" disabled={submitting || !form.terms}>
                {submitting ? '填寫中' : '加入購物車'}
              </Button>
            </div>
          </Card>
        </form>
        <ToastContainer className="" />
      </main>
    </>
  );
}
