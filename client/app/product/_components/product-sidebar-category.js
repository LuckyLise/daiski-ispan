'use client';

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

export default function ProductSidebarCategory({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  openCategories = [],
  onToggleCategory,
}) {
  // 建樹函式
  const buildTree = (list) => {
    const root = {};
    list.forEach((item) => {
      const path =
        typeof item.fullPath === 'string'
          ? item.fullPath.split(' > ').map((s) => s.trim())
          : [String(item.fullPath)];
      let current = root;
      path.forEach((label, idx) => {
        if (!current[label]) current[label] = { __children: {}, __id: null };
        if (idx === path.length - 1) current[label].__id = item.id;
        current = current[label].__children;
      });
    });
    return root;
  };

  // 遞迴渲染
  const renderTree = (node) =>
    Object.entries(node).map(([label, data]) => {
      const children = data.__children || {};
      const hasChildren = Object.keys(children).length > 0;
      const isOpen = openCategories.includes(label);
      const isActive = data.__id === selectedCategoryId;

      return (
        <Collapsible
          key={label}
          open={isOpen}
          onOpenChange={(open) => {
            onToggleCategory?.(label, open);
          }}
        >
          <div className="flex justify-between items-center w-full px-2 py-1 hover:bg-gray-100 hover:dark:bg-secondary-800 rounded-md ">
            {/* 點名稱導航主分類 */}
            <button
              type="button"
              onClick={() => onSelectCategory?.(data.__id)}
              className={`
           flex-1 text-left font-medium cursor-none
           ${
             isActive
               ? 'text-primary-500 dark:text-blue-300' // ← 被選中時的顏色
               : ' text-black dark:text-white'
           }   
           hover:text-primary-500
         `}
            >
              {label}
            </button>

            {/* 點箭頭展開／收合 */}
            {hasChildren && (
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-4 h-4 flex-shrink-0 focus:outline-none transition-transform data-[state=open]:rotate-180 hover:text-primary-500  cursor-none"
                >
                  <svg
                    className="w-4 h-4 "
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </CollapsibleTrigger>
            )}
          </div>

          <CollapsibleContent
            className="pl-4  border-l border-gray-200 space-y-1 overflow-hidden
       data-[state=open]:animate-[var(--animate-expand)]
    data-[state=closed]:animate-[var(--animate-collapse)]"
          >
            {/* 子分類 */}
            {hasChildren && <ul>{renderTree(children)}</ul>}
          </CollapsibleContent>
        </Collapsible>
      );
    });

  const tree = buildTree(categories);

  return (
    <div className="px-4 py-2 ">
      <h3 className="mb-2 text-2xl font-semibold uppercase">商品分類</h3>
      <div className="space-y-2">{renderTree(tree)}</div>
    </div>
  );
}
