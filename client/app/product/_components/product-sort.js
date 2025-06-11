'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel, // 可選
  DropdownMenuSeparator, // 可選
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';

const ProductSort = ({ currentSort, onSortChange }) => {
  const sortOptions = [
    { value: 'publish_at_desc', label: '上架時間：新到舊' },
    { value: 'publish_at_asc', label: '上架時間：舊到新' },
    { value: 'price_asc', label: '價格：低到高' },
    { value: 'price_desc', label: '價格：高到低' },
    // { value: '', label: '預設排序' }, // 如果有預設選項
  ];

  const currentSortLabel =
    sortOptions.find((option) => option.value === currentSort)?.label ||
    (currentSort === '' && sortOptions.find((o) => o.value === '')?.label) || // 處理預設值為空字串的情況
    '選擇排序方式';

  return (
    <div className="flex items-center gap-2 my-4">
      <span className="text-sm font-medium  text-black dark:text-white">
        {/* 排序方式： */}
      </span>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-auto md:w-[220px] flex items-center justify-between cursor-none"
          >
            <span>{currentSortLabel}</span>
            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col w-auto items-center ">
          {/* <DropdownMenuLabel className="">選擇排序依據</DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuRadioGroup
            value={currentSort}
            onValueChange={onSortChange}
          >
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="cursor-none"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProductSort;
