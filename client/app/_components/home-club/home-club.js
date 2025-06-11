'use client';

import ClubLi from './club-li';
import UseHomeClub from '@/hooks/use-home-club';

const cards = [
  { id: 1, src: '/home-images/0508-1.jpg', title: 'DAISKI' },
  { id: 2, src: '/home-images/0508-2.jpg', title: 'DAISKI' },
  { id: 3, src: '/home-images/0508-3.jpg', title: 'DAISKI' },
  { id: 4, src: '/home-images/2017Vol335.jpg', title: 'DAISKI' },
  { id: 5, src: '/home-images/hs00.jpg', title: 'DAISKI' },
  { id: 6, src: '/home-images/hs1-1.jpg', title: 'DAISKI' },
  { id: 7, src: '/home-images/hs5-1.jpg', title: 'DAISKI' },
  { id: 8, src: '/home-images/image12.png', title: 'DAISKI' },
];

export default function HomeClub() {
  /* 呼叫 Hook，取得 DOM ref 與狀態 */
  const { listRef, itemRefs, activeIdx, setActiveIdx } = UseHomeClub(
    cards.length,
    10
  );

  return (
    <section className="flex items-center justify-center m-10">
      <ul
        ref={listRef}
        className=" grid grid-cols-1 auto-rows-auto 
                    gap-2 w-full max-w-[calc(100%-4rem)]
                    h-auto
                    sm:h-[clamp(300px,40dvh,474px)]
                    sm:grid-cols-[var(--cols)]
                    transition-[grid-template-columns] duration-600
                    ease-[linear(0_0%,_.154_4.1%,_.293_8.3%,_.417_12.6%,_.528_17.1%,_.626_21.8%,_.71_26.6%,_.782_31.7%,_.843_37%,_.889_42.2%,_.926_47.8%,_.954_53.8%,_.975_60.3%,_.988_67.1%,_.996_75%,_1_100%)]"
      >
        {cards.map((card, idx) => (
          <ClubLi
            key={card.id}
            {...card}
            isActive={activeIdx === idx}
            onSelect={() => setActiveIdx(idx)}
            ref={(el) => (itemRefs.current[idx] = el)}
          />
        ))}
      </ul>
    </section>
  );
}
