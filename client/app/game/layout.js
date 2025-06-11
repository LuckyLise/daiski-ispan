'use client';
import React, { useEffect } from 'react';

export default function GameLayout({ children }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' || event.key === ' ') {
        // 阻止瀏覽器預設的「空白鍵向下滾動」行為
        event.preventDefault();
      }
    };
    // 這裡用 window.addEventListener，而且指定 { passive: false } 才能讓 preventDefault 生效
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}
