'use client';

import React, { forwardRef } from 'react';

const ClubLi = forwardRef(({ src, title, isActive, onSelect }, ref) => (
  <li
    ref={ref}
    data-active={isActive}
    onClick={onSelect}
    onMouseEnter={onSelect}
    onFocus={onSelect}
    className={`
        relative overflow-hidden rounded-lg border cursor-pointer
        transition-opacity duration-600
        ease-[linear(0_0%,_.154_4.1%,_.293_8.3%,_.417_12.6%,_.528_17.1%,_.626_21.8%,_.71_26.6%,_.782_31.7%,_.843_37%,_.889_42.2%,_.926_47.8%,_.954_53.8%,_.975_60.3%,_.988_67.1%,_.996_75%,_1_100%)]
        ${isActive ? 'opacity-100 h-[150px] sm:h-full' : 'opacity-80 sm:h-full h-[50px]'}
      `}
  >
    <article className="h-full flex flex-col justify-end gap-4 px-4 pb-4">
      {/* 左側旋轉標題 */}
      <h3
        data-active-text
        className={`
            absolute top-12 left-4 origin-left -rotate-90 text-lg uppercase
            font-light whitespace-nowrap z-[1]
            transition-opacity duration-600
            ease-[linear(0_0%,_.154_4.1%,_.293_8.3%,_.417_12.6%,_.528_17.1%,_.626_21.8%,_.71_26.6%,_.782_31.7%,_.843_37%,_.889_42.2%,_.926_47.8%,_.954_53.8%,_.975_60.3%,_.988_67.1%,_.996_75%,_1_100%)]
            ${isActive ? 'opacity-60' : 'opacity-0'}
          `}
      >
        {title}
      </h3>

      {/* 圖片 */}
      <a href="/courses">
        <img
          src={src}
          alt={title}
          className={`
              absolute inset-0 w-full h-full object-cover
              transition-[filter,transform] duration-600
              ease-[linear(0_0%,_.154_4.1%,_.293_8.3%,_.417_12.6%,_.528_17.1%,_.626_21.8%,_.71_26.6%,_.782_31.7%,_.843_37%,_.889_42.2%,_.926_47.8%,_.954_53.8%,_.975_60.3%,_.988_67.1%,_.996_75%,_1_100%)]
              ${
                isActive
                  ? 'scale-100 filter-none brightness-100'
                  : 'scale-110 grayscale brightness-150'
              }
            `}
        />
      </a>
    </article>
  </li>
));

export default ClubLi;
