import { useState, useRef, useEffect, useLayoutEffect } from 'react';
// 首頁
/* 讓父層自由展開 N 張卡片 & 計算 CSS 變數 */
export default function UseHomeClub(itemCount, wideSpan = 10) {
  const [activeIdx, setActiveIdx] = useState(0); // 0 = 預設第一張
  const listRef = useRef(null); // <ul>
  const itemRefs = useRef([]); // <li>[]

  /* activeIdx 變 -> 重算 grid-template-columns */
  useEffect(() => {
    if (!listRef.current) return;
    const media = window.matchMedia('(min-width: 640px)'); // sm 斷點

    const applyCols = () => {
      if (!media.matches) {
        // < sm 直接清空
        listRef.current.style.removeProperty('--cols');
        return;
      }
      const cols = Array(itemCount)
        .fill(0)
        .map((_, i) => (i === activeIdx ? `${wideSpan}fr` : '1fr'))
        .join(' ');
      listRef.current.style.setProperty('--cols', cols);
    };

    applyCols();
    media.addEventListener('change', applyCols); // 斷點來回切換也能重算
    return () => media.removeEventListener('change', applyCols);
  }, [activeIdx, itemCount, wideSpan]);

  /* resize 時量測最大寬度，寫入 CSS 變數 */
  useLayoutEffect(() => {
    const syncVars = () => {
      if (!itemRefs.current.length) return;
      const maxW = Math.max(...itemRefs.current.map((el) => el.offsetWidth));
      listRef.current?.style.setProperty('--article-width', `${maxW}px`);
      listRef.current?.style.setProperty(
        '--base',
        getComputedStyle(itemRefs.current[0]).minWidth
      );
    };
    syncVars();
    window.addEventListener('resize', syncVars);
    return () => window.removeEventListener('resize', syncVars);
  }, []);

  return { listRef, itemRefs, activeIdx, setActiveIdx };
}
