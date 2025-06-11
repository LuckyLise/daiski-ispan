'use client';

import { useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner'; // shadcn 已內建小提示元件，若沒裝可改成 alert

/**
 * 可編輯頭像
 * @param {object} props
 * @param {number|string} props.memberId - 當前會員 ID，用來決定 API 路徑
 * @param {string} [props.defaultSrc='/avatar.webp'] - 預設圖片
 */
export default function EditableAvatar({
  userId = 0,
  src = '',
  setSrc = () => {},
}) {
  const [fresh, setFresh] = useState(false);
  const fileInputRef = useRef(null);
  /* ⬇︎ 1. 點擊頭像 → 模擬點擊 <input type="file"> */
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  const base = process.env.NEXT_PUBLIC_API_BASE || '';

  /* ⬇︎ 2. 選檔案後：先本地預覽，再上傳至後端 */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // (2-1) 先用 URL.createObjectURL 做本地預覽
    // const previewUrl = URL.createObjectURL(file);
    // setSrc(previewUrl);

    try {
      // (2-2) 上傳到後端，FormData 可傳檔案
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`${base}/api/profile/avatar/${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      // 後端回傳 { url: 'https://…' }，改成正式 URL
      const { url } = await res.json();
      setSrc(url);
      toast.success('頭像更新成功!');
      setFresh(!fresh);
    } catch (err) {
      toast.error('上傳失敗，請重試' + err);
      setSrc(src); // 還原舊頭像
    } finally {
      // 釋放記憶體
      //    URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <>
      {/* 隱藏的檔案上傳 input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Avatar 本體；加 hover 效果讓「可點擊」更明顯 */}
      <Avatar
        className="w-48 h-48 cursor-pointer transition hover:ring-4 hover:ring-primary/40"
        onClick={handleAvatarClick}
      >
        <AvatarImage
          src={`http://localhost:3005${src}`}
          alt="member avatar"
          className="w-full h-full object-cover"
        />
        <AvatarFallback className="text-3xl font-semibold bg-secondary-500 text-white">
          ME
        </AvatarFallback>
      </Avatar>
    </>
  );
}
