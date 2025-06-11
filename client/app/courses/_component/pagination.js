import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

/**
 * 根據當前頁與總頁數，回傳要顯示的頁碼陣列（中心±2）。
 * @param {number} current
 * @param {number} total
 */
function getPages(current, total) {
  const window = 2; // 當前頁左右各 2
  let start = Math.max(1, current - window);
  let end = Math.min(total, current + window);

  const padLeft = Math.max(0, window - (current - start));
  const padRight = Math.max(0, window - (end - current));
  start = Math.max(1, start - padRight);
  end = Math.min(total, end + padLeft);

  const list = [];
  for (let i = start; i <= end; i++) list.push(i);
  return list;
}

/**
 * 分頁元件 – 基於 shadcn/ui Pagination。
 *
 * @param {Object} props
 * @param {number} props.page          目前頁碼（從 1 開始）
 * @param {number} props.totalItems    總筆數
 * @param {number} [props.pageSize=8]  每頁筆數
 * @param {Function} props.onPageChange 切換頁碼時呼叫，會帶入新頁碼
 */
export default function PaginationBar({
  page,
  totalItems,
  pageSize = 8,
  onPageChange,
}) {
  const totalPage = Math.ceil(totalItems / pageSize);
  if (totalPage <= 1) return null; // 只有 0 或 1 頁時不顯示分頁列

  const pages = getPages(page, totalPage);

  const goto = (p) => {
    if (p < 1 || p > totalPage || p === page) return;
    if (typeof onPageChange === 'function') onPageChange(p);
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* 上一頁 */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            onClick={(e) => {
              e.preventDefault();
              goto(page - 1);
            }}
          />
        </PaginationItem>

        {/* 若第一頁不在 window 內，顯示 "1 …" */}
        {pages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goto(1);
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {pages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {/* 中間頁碼列表 */}
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              onClick={(e) => {
                e.preventDefault();
                goto(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* 若最後一頁不在 window 內，顯示 "… N" */}
        {pages[pages.length - 1] < totalPage && (
          <>
            {pages[pages.length - 1] < totalPage - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goto(totalPage);
                }}
              >
                {totalPage}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* 下一頁 */}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page >= totalPage}
            onClick={(e) => {
              e.preventDefault();
              goto(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
