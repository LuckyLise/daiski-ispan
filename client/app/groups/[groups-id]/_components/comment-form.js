// app/groups/[groups-id]/_components/CommentForm.js
'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function CommentForm({
  // API_BASE, // 如果有需要在表單內部直接呼叫 API，則需要此 prop
  // groupId,  // 同上
  parentId = null, // 要回覆的留言 ID，頂層留言則為 null
  isSubmitting, // 是否正在提交，由父元件控制
  onSubmit, // 提交處理函數，(content, parentId) => Promise<void>
  onCancel, // 取消回覆時的處理函數 (可選)
  // currentUserInfo, // 僅用於檢查或顯示提示，目前未使用
  isAuth, // 用戶是否已登入
  placeholderText = '輸入你的留言…',
}) {
  const [text, setText] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuth) {
      setFormError('請先登入才能發表。');
      return;
    }
    if (!text.trim()) {
      setFormError('內容不可為空。');
      return;
    }
    setFormError('');
    try {
      await onSubmit(text, parentId); // 調用外部傳入的 onSubmit
      setText(''); // 成功提交後清空
      if (parentId && onCancel) {
        // 如果是回覆表單，提交後也執行取消邏輯 (例如關閉表單)
        onCancel();
      }
    } catch (error) {
      // onSubmit 函數的錯誤會由父元件的 try/catch 處理，
      // 但如果 onSubmit 本身沒有 try/catch，錯誤會在這裡被捕獲。
      // 一般來說，isSubmitting 和 setError 會由父元件的 onSubmit 處理。
      console.error('CommentForm handleSubmit error:', error);
      setFormError(error.message || '提交時發生錯誤');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 mt-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-1 w-full border-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition resize-none rounded-md bg-background text-foreground"
        rows="3"
        placeholder={placeholderText}
        disabled={isSubmitting || !isAuth}
      />
      {formError && (
        <p className="text-sm text-destructive mt-1">{formError}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <Button
          type="submit"
          className="px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 transition active:scale-95 active:shadow-sm rounded-md text-p-tw"
          disabled={isSubmitting || !text.trim() || !isAuth}
        >
          {isSubmitting ? '發送中...' : '送出'}
        </Button>
        {parentId &&
          onCancel && ( // 只有回覆表單且有 onCancel prop 才顯示取消按鈕
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-4 py-2"
            >
              取消
            </Button>
          )}
      </div>
      {!isAuth && (
        <p className="mt-2 text-sm text-muted-foreground">
          請先
          <a href="/auth/login" className="text-primary-500 hover:underline">
            登入
          </a>
          以發表。
        </p>
      )}
    </form>
  );
}
