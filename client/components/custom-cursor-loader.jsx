// components/DynamicCustomCursor.jsx
'use client'; // 關鍵：將這個加載器組件標記為客戶端組件

import dynamic from 'next/dynamic';

// 在這個客戶端組件內部動態導入 CustomCursor，並設置 ssr: false
// 確保下面的路徑 '@components/custom-cursor' 指向你實際的 custom-cursor.jsx 文件
const ActualCustomCursor = dynamic(() => import('@/components/custom-cursor'), {
  ssr: false,
  // 你甚至可以添加一個 loading 狀態，雖然對於鼠標組件可能不是必要的
  // loading: () => <p>Loading cursor...</p>,
});

export default function CustomCursorLoader() {
  return <ActualCustomCursor />;
}
