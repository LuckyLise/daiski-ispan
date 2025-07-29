'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import Container from '@/components/container';

// uploadImage 回傳時就附上 host
function getCkImageUrl(path) {
  // 假設後端跑在 3005 埠
  return `https://daiski-ispan.onrender.com${path}`;
}

// async function uploadImage(file) {
//   const fd = new FormData();
//   // fd.append('images', file);

//   const res = await fetch(
//     'https://daiski-ispan.onrender.com/api/coaches/uploads/ckeditor',
//     {
//       method: 'POST',
//       body: fd,
//       credentials: 'include',
//     }
//   );
//   if (!res.ok) throw new Error('上傳失敗');
//   const data = await res.json();
//   return getCkImageUrl(data.url);
// }

function insertImageAtCursor(editorEl, imageUrl) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    // 沒游標就直接 append 到最末
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.maxWidth = '100%';
    editorEl.appendChild(img);
    return;
  }

  let range = selection.getRangeAt(0);
  // 檢查游標是否在 editorEl 裡
  let node = range.commonAncestorContainer;
  let inside = false;
  while (node) {
    if (node === editorEl) {
      inside = true;
      break;
    }
    node = node.parentNode;
  }

  if (!inside) {
    // 如果游標原本不在 editor 區塊，就先 focus 並 collapse 到尾巴
    editorEl.focus();
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(editorEl);
    newRange.collapse(false);
    selection.addRange(newRange);
  }

  // 建立 img node
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = 'uploaded image';
  img.style.maxWidth = '100%';

  // 刪除範圍內的文字（若有）
  range.deleteContents();
  // 插入 img
  range.insertNode(img);

  // 把游標置於 <img> 之後
  range.setStartAfter(img);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  editorEl.focus();
}
/* -------- 建立時才需要的 Stepper -------- */
const STEPS = [
  { id: 'basic', name: '步驟 1', description: '填寫課程' },
  { id: 'preview', name: '步驟 2', description: '預覽與發佈' },
];
const HorizontalStepper = ({ steps, current, setCurrent }) => {
  const currIdx = steps.findIndex((s) => s.id === current);
  return (
    <nav className="mb-10">
      <ol className="flex items-start">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className={`relative flex-1 ${i < steps.length - 1 ? 'pr-8 sm:pr-12' : ''}`}
          >
            <button
              type="button"
              disabled={i > currIdx}
              onClick={() => i <= currIdx && setCurrent(s.id)}
              className="flex flex-col items-center w-full group"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full
                ${
                  i === currIdx
                    ? 'bg-primary text-primary-foreground border-2 border-primary'
                    : i < currIdx
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-border text-muted-foreground'
                }`}
              >
                {i < currIdx ? '✓' : i + 1}
              </span>
              <span
                className={`mt-2 text-xs sm:text-sm font-medium
                ${i <= currIdx ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {s.name}
              </span>
              <span className="hidden sm:block text-xs text-muted-foreground/80">
                {s.description}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 h-0.5 w-full -translate-y-1/2
                  ${i < currIdx ? 'bg-primary' : 'bg-border'}`}
                style={{ width: 'calc(100% - 2.5rem)' }}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
/* -------- 即時預覽卡 -------- */
const LivePreview = ({ data, coverPreview }) => {
  const diffMap = { 初級: '初級', 中級: '中級', 高級: '高級' };
  const boardMap = { 1: '單板', 2: '雙板' };

  return (
    <Card className="shadow-lg border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">即時預覽</CardTitle>
      </CardHeader>
      <CardContent>
        {coverPreview ? (
          <img
            src={coverPreview}
            alt="封面預覽"
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        ) : (
          <div className="w-full h-48 bg-muted rounded-md mb-4 flex flex-col items-center justify-center text-muted-foreground border border-dashed">
            <span className="text-3xl">🖼️</span>
            <p className="mt-2 text-sm">封面圖片預覽</p>
          </div>
        )}

        {data.tags && (
          <p className="pt-2">
            <strong>標籤：</strong>
            {data.tags
              .split(',')
              .filter(Boolean)
              .map((t) => (
                <span
                  key={t}
                  className="inline-block bg-sky-100 text-sky-700 px-2 py-0.5 text-xs rounded mr-1 mt-1"
                >
                  {t.trim()}
                </span>
              ))}
          </p>
        )}
        <h3 className="text-xl font-bold mb-2 truncate">
          {data.name || '課程名稱'}
        </h3>
        <div className="text-sm space-y-1.5 text-muted-foreground">
          <p>
            <strong>單／雙板：</strong>
            {boardMap[data.boardtype_id] || '未選擇'}
          </p>
          <p>
            <strong>日期：</strong>
            {data.start_at || '開始'} ~ {data.end_at || '結束'}
          </p>
          <p>
            <strong>難度：</strong>
            {diffMap[data.difficulty] || '未選擇'}
          </p>
          <p>
            <strong>價格：</strong>NT$ {data.price || '0'}
          </p>
          <p>
            <strong>人數上限：</strong>
            {data.max_people || '—'} 人
          </p>
          {data.description && (
            <p className="pt-2 border-t">
              <strong>簡介：</strong>
              <span className="whitespace-pre-wrap line-clamp-3">
                {data.description}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function CourseForm({ mode = 'create', initialData = null }) {
  /* ---------------- 基本 hooks ---------------- */
  const router = useRouter();
  const { coachId, courseId } = useParams();
  const { user, isAuth } = useAuth();

  /* ---------------- 狀態 ---------------- */
  const DEFAULT = {
    name: '',
    description: '',
    content: '',
    start_at: '',
    end_at: '',
    difficulty: '',
    price: '',
    duration: '',
    max_people: '',
    location_id: '',
    newLoc: { name: '', country: '', city: '', address: '' },
    course_imgs: [],
    boardtype_id: '',
    tags: '',
  };
  const [form, setForm] = useState(initialData || DEFAULT);
  const [locations, setLocations] = useState([]);
  // 在 useState 那邊，加：
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('basic');

  /* ---------------- 今天 (local) => YYYY-MM-DDTHH:MM ---------------- */
  const todayLocal = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // to local ISO
    return d.toISOString().slice(0, 10);
  })();

  /* ---------------- 載入初始資料 (edit) ---------------- */
  //   useEffect(() => {
  //     if (initialData) setForm((f) => ({ ...f, ...initialData }));
  //   }, [initialData]);
  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const editorRef = useRef(null);
  // ref：隱藏的 <input type="file">
  const fileInputRef = useRef(null);
  // 控制上傳狀態
  const [uploading, setUploading] = useState(false);

  // 取得雪場清單
  useEffect(() => {
    fetch('https://daiski-ispan.onrender.com/api/location')
      .then((r) => r.json())
      .then(setLocations)
      .catch(console.error);
  }, []);

  // 如果是 edit 模式，載入後把 initialData 塞入
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  // ---------- 處理 contenteditable 內文字變動 ----------
  // const handleInput = useCallback(() => {
  //   if (!editorRef.current) return;
  //   // 把 innerHTML 存回 form.content
  //   setForm(function (prev) {
  //     return Object.assign({}, prev, { content: editorRef.current.innerHTML });
  //   });
  // }, []);
  const handleInput = () => {
    if (!editorRef.current) return;
    setForm((prev) => ({
      ...prev,
      content: editorRef.current.innerHTML,
    }));
  };
  // ---------- 處理「點按插入圖片」按鈕 ----------
  // const handleClickInsertImage = useCallback(() => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click();
  //   }
  // }, []);
  // ---------- 處理 <input type="file"> 的 onChange，並插圖 ----------
  // const handleFileChange = useCallback(async function (e) {
  //   let files = e.target.files;
  //   if (!files || files.length === 0) return;
  //   let file = files[0];
  //   if (!editorRef.current) return;

  //   setUploading(true);
  //   try {
  //     let imageUrl = await uploadImage(file);
  //     insertImageAtCursor(editorRef.current, imageUrl);
  //     // 同步一次最新內容
  //     setForm(function (prev) {
  //       return Object.assign({}, prev, {
  //         content: editorRef.current.innerHTML,
  //       });
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     alert('圖片上傳或插入失敗');
  //   } finally {
  //     setUploading(false);
  //     // 清空 input
  //     e.target.value = '';
  //   }
  // }, []);
  // 新的 onChangeCover:
  const onChangeCover = (e) => {
    const file = e.target.files[0];
    if (file) {
      const { files } = e.target;
      const f = files[0];
      setForm((p) => ({ ...p, course_imgs: f }));
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file)); // 用於右側預覽
    } else {
      setCoverFile(null);
      setCoverPreview('');
    }
  };

  const onChange = (e) => {
    const { name, value, type, files } = e.target;
    console.log('欄位變更', name, value);
    console.log(type);
    if (type === 'file') {
      const f = files[0];
      setForm((p) => ({ ...p, course_imgs: f }));
      if (f) setCoverPreview(URL.createObjectURL(f));
    } else if (name.startsWith('newLoc')) {
      const key = name.replace('newLoc.', '');
      setForm((p) => ({
        ...p,
        newLoc: { ...p.newLoc, [key]: value },
      }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  /* ---------------- 驗證 ---------------- */
  //   const validate = useCallback(() => {
  //     const now = new Date();
  //     if (!form.name.trim()) return '請輸入課程名稱';
  //     if (!form.start_at || !form.end_at) return '請選擇日期';

  //     const start = new Date(form.start_at);
  //     const end = new Date(form.end_at);

  //     if (start < new Date(now.setHours(0, 0, 0, 0))) return '開始日期須晚於今天';
  //     if (end <= start) return '結束日期需晚於開始日期';

  //     if (!form.difficulty) return '請選擇難度';
  //     if (mode === 'create' && !form.course_imgs.length)
  //       return '請上傳至少 1 張圖片';
  //     return '';
  //   }, [form, mode]);
  const validate = () => {
    if (!form.name.trim()) return '請輸入課程名稱';
    if (!form.start_at || !form.end_at) return '請選擇日期';
    if (!form.difficulty) return '請選擇難度';
    return '';
  };

  /* ---------------- 送出 ---------------- */
  const handleSubmit = async () => {
    const errMsg = validate();
    if (errMsg) return setError(errMsg);
    if (!isAuth) return setError('請先登入');

    const fd = new FormData();
    const isCreate = mode === 'create';
    const targetCoachId = coachId || user.id;

    // fd.append('images', form.course_imgs);
    // console.log(form.course_imgs);
    // (Array.isArray(form.course_imgs) ? form.course_imgs : [form.course_imgs])
    //   .filter(Boolean) // 避免 null
    //   .forEach((file) => fd.append('images', file));
    // console.log([...fd.entries()]);
    console.log('-------' + coverFile);
    if (Array.isArray(form.course_imgs)) {
      form.course_imgs.forEach((file) => fd.append('images', file));
    }
    // else if (form.course_imgs) {
    //   fd.append('images', form.course_imgs);
    // }
    else if (coverFile) {
      fd.append('images', coverFile);
    }

    // if (coverFile) {
    //   // 把這個 File 直接 append 成 'cover'
    //   fd.append('cover', coverFile);
    // }

    // 文字欄位
    fd.append('name', form.name.trim());
    fd.append('description', form.description.trim());
    fd.append('start_at', form.start_at); // '2025-06-01T09:00'
    fd.append('end_at', form.end_at);
    fd.append('difficulty', form.difficulty);
    fd.append('content', form.content.trim());
    [
      // 數字欄位
      'price',
      'duration',
      'max_people',
      'boardtype_id',
      'location_id',
    ].forEach((k) => fd.append(k, Number(form[k]) || 0));

    fd.append('coach_id', +user.id);

    console.log(fd.get('price'));
    if (form.location_id === 'other') {
      fd.append('new_name', form.newLoc.name);
      fd.append('new_country', form.newLoc.country);
      fd.append('new_city', form.newLoc.city);
      fd.append('new_address', form.newLoc.address);
    }
    // 4. 把 tags 字串拆成陣列，送到 tagIds[]
    if (form.tags.trim()) {
      form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => {
          fd.append('tagIds[]', t);
        });
    }

    // **印出 FormData 裡的所有 key、value （不包括檔案二進位，只列 key）**
    console.log('>>> FormData keys:');
    for (let pair of fd.entries()) {
      console.log('    ', pair[0], pair[1]);
    }
    setIsSubmitting(true);

    try {
      // await fetch(`https://daiski-ispan.onrender.com/api/coaches/${user.id}/create`, { … })
      console.log(user.id);
      //   const res = await fetch(
      //     `https://daiski-ispan.onrender.com/api/coaches/${user.id}/create`,
      //     {
      //       method: 'POST',
      //       body: fd,
      //       credentials: 'include',
      //     }
      //   );
      const url = isCreate
        ? `https://daiski-ispan.onrender.com/api/coaches/${targetCoachId}/create`
        : `https://daiski-ispan.onrender.com/api/coaches/${targetCoachId}/courses/${courseId}`;
      console.log(url);
      const res = await fetch(url, {
        method: isCreate ? 'POST' : 'PUT',
        body: fd,
        credentials: 'include',
      });

      // 確定拿到 JSON
      const payload = await res.json();
      console.log('okay');
      if (!res.ok) {
        console.error('🛑 後端錯誤明細：', payload);
        throw new Error(payload.message || '伺服器錯誤');
      }
      // 成功導頁
      router.push('/courses');
    } catch (e) {
      console.error('建立錯誤細節：', e);
      setError(`建立失敗：${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- JSX ---- */
  return (
    <Container className="min-h-screen bg-white py-8 px-4 dark:bg-slate-900">
      <div className="max-w-screen-2xl mx-auto">
        {/* Stepper */}
        <HorizontalStepper steps={STEPS} current={step} setCurrent={setStep} />

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
            ⚠️ {error}
          </div>
        )}

        <div className="lg:flex lg:gap-8 xl:gap-12">
          {/* -------- 左欄 -------- */}
          <div className="lg:w-7/12 xl:w-2/3">
            {step === 'basic' && (
              <Card className="shadow-lg border">
                <CardHeader>
                  <CardTitle>新增滑雪課程</CardTitle>
                  <CardDescription>
                    請填寫下列欄位，快速建立新課程
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6">
                  {/* 課程名稱 */}
                  <div>
                    <Label htmlFor="name">課程名稱</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                    />
                  </div>
                  {/* 單雙板 */}
                  <select
                    id="boardtype_id"
                    name="boardtype_id"
                    value={form.boardtype_id}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  >
                    <option value="">請選擇單／雙板</option>
                    <option value="1">單板</option> {/* 假設 1=單板 */}
                    <option value="2">雙板</option> {/* 假設 2=雙板 */}
                  </select>
                  {/* 簡介 / 內容 */}
                  <div>
                    <Label htmlFor="description">課程簡介</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={onChange}
                      rows={2}
                    />
                  </div>
                  {/* <div>
                    <Label htmlFor="content">詳細內容</Label>
                    <Textarea
                      contentEditable="true"
                      id="content"
                      name="content"
                      value={form.content}
                      onChange={onChange}
                      rows={4}
                    />
                  </div> */}
                  <div>
                    <Label htmlFor="content">詳細內容</Label>
                    {/* 這才是真正的 contenteditable 區塊 */}
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleInput}
                      className="min-h-[200px] w-full border p-2 rounded focus:outline-none"
                      style={{ whiteSpace: 'pre-wrap' }}
                      // 下面這屬性只是讓 React 不再警告
                      suppressContentEditableWarning
                      // 初次 render 時放進 innerHTML
                      dangerouslySetInnerHTML={{ __html: form.content }}
                    />
                  </div>
                  {/* 日期 */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="start_at">開始時間</Label>
                      <Input
                        id="start_at"
                        name="start_at"
                        type="date"
                        value={form.start_at}
                        onChange={onChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_at">結束時間</Label>
                      <Input
                        id="end_at"
                        name="end_at"
                        type="date"
                        value={form.end_at}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  {/* 難度 / 價格 */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="difficulty">難度</Label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        value={form.difficulty}
                        onChange={onChange}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                      >
                        <option value="">請選擇難度</option>
                        {['初級', '中級', '高級'].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="price">價格 (TWD)</Label>
                      <Input
                        id="price"
                        name="price"
                        value={form.price}
                        onChange={onChange}
                        placeholder="例如：3000"
                      />
                    </div>
                  </div>
                  {/* 時長 / 人數 */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="duration">時長 (小時)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        value={form.duration}
                        onChange={onChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_people">人數上限</Label>
                      <Input
                        id="max_people"
                        name="max_people"
                        type="number"
                        value={form.max_people}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  {/* 地點 / 圖片 */}
                  <div>
                    <Label htmlFor="location_id">地點</Label>
                    <select
                      id="location_id"
                      name="location_id"
                      value={form.location_id}
                      onChange={onChange}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                    >
                      <option value="">請選擇地點</option>
                      {locations.map((loc) => {
                        return (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        );
                      })}
                      <option value="other">其他</option>
                    </select>
                  </div>
                  {form.location_id === 'other' && (
                    <div className="bg-slate-50 p-4 rounded mt-4 grid gap-4 sm:grid-cols-2">
                      <Input
                        name="newLoc.name"
                        value={form.newLoc.name}
                        onChange={onChange}
                        placeholder="雪場名稱*"
                      />
                      <Input
                        name="newLoc.country"
                        value={form.newLoc.country}
                        onChange={onChange}
                        placeholder="國家*"
                      />
                      <Input
                        name="newLoc.city"
                        value={form.newLoc.city}
                        onChange={onChange}
                        placeholder="城市*"
                      />
                      <div className="sm:col-span-2">
                        <Input
                          name="newLoc.address"
                          value={form.newLoc.address}
                          onChange={onChange}
                          placeholder="地址*"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="course_imgs">封面圖片</Label>
                    <Input
                      id="cover"
                      name="images"
                      type="file"
                      accept="image/*"
                      onChange={onChangeCover}
                    />
                    {coverPreview && (
                      <button
                        onClick={() => {
                          setForm((f) => ({ ...f, course_imgs: null }));
                          setCoverPreview('');
                        }}
                        className="text-sm text-red-500 underline mt-1"
                      >
                        移除圖片
                      </button>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="tags">關鍵字標籤</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={form.tags}
                      onChange={onChange}
                      placeholder="用逗號分隔，例如：初級,北海道"
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/courses')}
                  >
                    取消
                  </Button>
                  <Button className="ml-4" onClick={() => setStep('preview')}>
                    下一步
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 'preview' && (
              <Card className="shadow-lg border">
                <CardHeader>
                  <CardTitle>確認課程資訊</CardTitle>
                  <CardDescription>
                    請檢查以下內容，確認無誤後儲存
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    <strong>名稱：</strong>
                    {form.name}
                  </p>
                  <p>
                    <strong>日期：</strong>
                    {form.start_at} ~ {form.end_at}
                  </p>
                  <p>
                    <strong>難度：</strong>
                    {form.difficulty}
                  </p>
                  <p>
                    <strong>價格：</strong>NT$ {form.price}
                  </p>
                  <p>
                    <strong>人數上限：</strong>
                    {form.max_people}
                  </p>
                  <p>
                    <strong>簡介：</strong>
                    {form.description}
                  </p>
                  {/* 其他欄位自行補充 */}
                </CardContent>
                <CardFooter className="justify-end">
                  <Button variant="outline" onClick={() => setStep('basic')}>
                    上一步
                  </Button>
                  <Button
                    className="ml-4"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? '儲存中...' : '確認儲存'}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* -------- 右欄 -------- */}
          <aside className="hidden lg:block lg:w-5/12 xl:w-1/3 mt-10 lg:mt-0">
            <div className="space-y-6 sticky top-10">
              <LivePreview data={form} coverPreview={coverPreview} />
              {step === 'preview' && (
                <Card className="shadow-lg border bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center text-red-600">
                      <span className="text-xl mr-2">⚠️</span> 注意事項
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1 text-red-700">
                    <p>• 請確認課程資訊真實、準確。</p>
                    <p>• 儲存後可在「我的課程」頁面管理。</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
}
