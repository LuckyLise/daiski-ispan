// components/custom/CustomPagination.jsx
'use client'; // 如果組件內部直接使用了客戶端鉤子或事件處理器

import React from 'react';
import {
  Pagination as PaginationContainer,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'; // 確保路徑正確

// generatePageItems 輔助函式可以定義在此檔案內，或從 utils 匯入
// 注意：這裡的 onPageChangeCallback 就是從 props 傳入的 onPageChange
function generatePageItems(currentPage, totalPages, onPageChangeCallback) {
  const items = [];
  const pagesToShow = 5;
  const sidePages = Math.floor((pagesToShow - 1) / 2);

  if (totalPages <= 1) return items;

  let startPage = Math.max(1, currentPage - sidePages);
  let endPage = Math.min(totalPages, currentPage + sidePages);

  if (currentPage <= sidePages) {
    endPage = Math.min(totalPages, pagesToShow);
  }
  if (currentPage + sidePages >= totalPages) {
    startPage = Math.max(1, totalPages - pagesToShow + 1);
  }

  if (startPage > 1) {
    items.push(
      <PaginationItem key={1}>
        <PaginationLink onClick={() => onPageChangeCallback(1)}>
          1
        </PaginationLink>
      </PaginationItem>
    );
    if (startPage > 2) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    items.push(
      <PaginationItem key={i}>
        <PaginationLink
          href="#"
          onClick={() => onPageChangeCallback(i)} // 呼叫傳入的 onPageChange
          isActive={currentPage === i}
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    items.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          href="#"
          onClick={() => onPageChangeCallback(totalPages)}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
  }
  return items;
}

export function CustomPagination({ currentPage, totalPages, onPageChange }) {
  // 如果總頁數小於等於1，可能不需要渲染分頁
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1); // 呼叫從 props 傳入的 onPageChange
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1); // 呼叫從 props 傳入的 onPageChange
    }
  };

  return (
    <PaginationContainer>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePrevious}
            aria-disabled={currentPage === 1}
            // 根據需要添加禁用樣式，shadcn/ui 可能有自己的處理方式
            className={
              currentPage === 1 ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>

        {generatePageItems(currentPage, totalPages, onPageChange)}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handleNext}
            aria-disabled={currentPage === totalPages}
            className={
              currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationContainer>
  );
}
