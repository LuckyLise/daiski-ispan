// 檔案路徑: app/groups/layout.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth'; // << --- 確保這是您 use-auth.js 的正確路徑
import { ChatBubble } from './_components/chat-bubble'; // << --- 確保這是您 chat-bubble.js 的正確路徑
export default function GroupsLayout({ children }) {
  const { user: currentUser, isAuth, isLoading: isAuthLoading } = useAuth();
  const [isChatBubbleOpen, setIsChatBubbleOpen] = useState(false);

  // apiBase 應該來自環境變數或設定檔
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';

  // 在初始載入認證狀態時，可以先不渲染 ChatBubble，或者讓 ChatBubble 內部處理
  if (isAuthLoading) {
    return (
      <>
        {children}
        {/* <div>載入中...</div> */}
      </>
    );
  }

  return (
    <>
      {children}
      {/* 只有當使用者已登入時，才考慮顯示 ChatBubble */}
      {isAuth && currentUser && (
        <ChatBubble
          apiBase={apiBase}
          currentUser={currentUser}
          // 注意：這裡不再傳遞 groupId 或 isChatAllowed
          // ChatBubble 元件將自己處理與特定群組相關的邏輯
          open={isChatBubbleOpen}
          onOpenChange={setIsChatBubbleOpen}
        />
      )}
    </>
  );
}
