// 'use client';
// import Container from '@/components/container';
// import ProductList from './_components/product-list';
// import ProductPagination from './_components/product-pagination';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { useEffect, useState, useCallback } from 'react';
// import ProductSidebar from './_components/product-sidebar';
// import useSWR from 'swr';
// import { useDebounce } from 'use-debounce';
// import {
//   Sheet,
//   SheetTrigger,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetClose,
// } from '@/components/ui/sheet';
// import { Button } from '@/components/ui/button';
// import { X, Sliders } from 'lucide-react';

// import { useFavorite } from '@/hooks/use-favorite';
// import { useAuth } from '@/hooks/use-auth';

// // 1. Next.js Server Component（可直接 await fetch）
// // export default async function ProductsPage() {
// //   // 2. 呼叫後端 API
// //   const res = await fetch('http://localhost:4000/api/products')
// //   const products = await res.json()

// //   console.log(products)
// //   console.log(typeof [products])
// //   return (
// //     <>
// //       <Container>
// //         <main className="">
// //           <ProductList products={products} />
// //         </main>
// //       </Container>
// //     </>
// //   )
// // }

// /*
// 商品V3 (已修復 category_id 同步問題)
// */
// // SWR fetcher：把 URL 拿去 fetch 然後轉成 JSON
// const fetcher = (url) =>
//   fetch(`http://localhost:3005${url}`, { credentials: 'include' }).then((r) =>
//     r.json()
//   );

// export default function ProductPage() {
//   const { user, isAuth, isLoading } = useAuth();

//   const searchParams = useSearchParams();
//   const router = useRouter();

//   // ─── 1. 搜尋輸入 state & 防抖 ───
//   const initialSearch = searchParams.get('search') || '';
//   const [searchText, setSearchText] = useState(initialSearch);
//   const [debouncedSearch] = useDebounce(searchText, 300);

//   // ==================== 新增的 useEffect 同步防抖值到 URL ====================
//   useEffect(() => {
//     const params = new URLSearchParams(Array.from(searchParams.entries()));
//     const currentSearch = params.get('search') || '';

//     // 只有當防抖值與當前 URL 參數不同時才更新
//     if (debouncedSearch !== currentSearch) {
//       // 更新或刪除 search 參數
//       if (debouncedSearch) {
//         params.set('search', debouncedSearch);
//       } else {
//         params.delete('search');
//       }
//       // 重置頁碼並導航
//       params.set('page', '1');
//       router.push(`?${params.toString()}`, undefined, { shallow: true }); // <--- 使用 shallow routing
//     }
//   }, [debouncedSearch, router, searchParams]); // <--- 加入這裡

//   // ─── 2. 取得「搜尋建議」──

//   // 當 debouncedSearch 長度 >= 2 時呼叫，否則 key = null（不發請求）

//   const { data: suggestions = [], isValidating: sugLoading } = useSWR(
//     debouncedSearch.length >= 2
//       ? `/api/products/search-suggestions?search=${encodeURIComponent(debouncedSearch)}&limit=5`
//       : null,

//     fetcher
//   );

//   // 點選建議後：更新輸入、更新 URL (加上 search & 重設 page=1)

//   const handleSelect = (item) => {
//     setSearchText(item.name);

//     const params = new URLSearchParams(Array.from(searchParams.entries()));

//     params.set('search', item.name);

//     params.set('page', '1');

//     router.push(`?${params.toString()}`);
//   };

//   // ─── 3. 其他篩選條件 state ───
//   const [pageInfo, setPageInfo] = useState({
//     page: parseInt(searchParams.get('page') || '1', 10),
//     limit: parseInt(searchParams.get('limit') || '12', 10),
//     total: 0,
//     category_id: parseInt(searchParams.get('category_id') || '1', 10),
//   });
//   const [categories, setCategories] = useState([]);
//   // ─── 新增：品牌列表 & 已選品牌 state ───
//   const [brands, setBrands] = useState([]);
//   const [selectedBrands, setSelectedBrands] = useState(
//     searchParams
//       .get('brand_id')
//       ?.split(',')
//       .map((v) => Number(v)) || []
//   );

//   const [sizes, setSizes] = useState([]);
//   const [selectedSizes, setSelectedSizes] = useState(
//     searchParams
//       .get('size_id')
//       ?.split(',')
//       .map((v) => Number(v)) || []
//   );
//   const [showAllSizes, setShowAllSizes] = useState(false);
//   const previewCount = 12;
//   const sizesToShow = showAllSizes ? sizes : sizes.slice(0, previewCount);
//   const canToggleSizes = sizes.length > previewCount;
//   const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
//   const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
//   const [sidebarOpen, setSidebarOpen] = useState(false); //sidebar sheet 狀態

//   // 從 URL 同步 category_id (和 page) 到 pageInfo state
//   const categoryIdFromUrl = searchParams.get('category_id');
//   useEffect(() => {
//     const newCategoryId = parseInt(categoryIdFromUrl || '1', 10);
//     setPageInfo((prev) => {
//       // 只有當 URL 的 category_id 與 state 中的不同時才更新
//       if (prev.category_id !== newCategoryId) {
//         // 分類已改變，更新 category_id 並重置頁碼為 1
//         return { ...prev, category_id: newCategoryId, page: 1 };
//       }
//       // 如果 category_id 相同，但 URL 的 page 與 state 不同，也同步 page
//       // (這部分可以根據 productRes 更新 pageInfo 的邏輯來決定是否需要)
//       // const newPage = parseInt(searchParams.get('page') || '1', 10);
//       // if (prev.page !== newPage) {
//       //   return { ...prev, page: newPage };
//       // }
//       return prev; // 否則保持不變
//     });
//   }, [categoryIdFromUrl, searchParams]); // 依賴從 URL 讀取的 category_id 和 searchParams 以捕獲 page 變化

//   // 讀分類清單（只做一次）
//   useEffect(() => {
//     fetch('http://localhost:3005/api/products/categories')
//       .then((r) => r.json())
//       .then(setCategories)
//       .catch(console.error);
//   }, []);

//   // 讀尺寸列表（當 pageInfo.category_id 變更時觸發）
//   useEffect(() => {
//     // 確保 pageInfo.category_id 是一個有效的值才去請求
//     if (!pageInfo.category_id) return;

//     const url = new URL('http://localhost:3005/api/products/sizes');
//     url.searchParams.set('category_id', String(pageInfo.category_id));
//     fetch(url)
//       .then((r) => r.json())
//       .then((data) => {
//         setSizes(data);
//         setSelectedSizes((prevSelected) =>
//           prevSelected.filter((id) => data.some((s) => s.id === id))
//         );
//       })
//       .catch(console.error);
//   }, [pageInfo.category_id]); // 關鍵依賴：確保 pageInfo.category_id 更新後此 effect 執行

//   // ─── 當 category_id 變更時，讀品牌列表 ───
//   useEffect(() => {
//     if (!pageInfo.category_id) return;
//     const url = new URL('http://localhost:3005/api/products/brands');
//     url.searchParams.set('category_id', String(pageInfo.category_id));
//     fetch(url)
//       .then((r) => r.json())
//       .then((data) => {
//         setBrands(data);
//         // 只保留仍存在於新列表裡的 selectedBrands
//         setSelectedBrands((prev) =>
//           prev.filter((id) => data.some((b) => b.id === id))
//         );
//       })
//       .catch(console.error);
//   }, [pageInfo.category_id]);

//   // ─── 4. 用 SWR 抓「商品列表」──
//   // Key function：
//   const productsKey = () => {
//     const sp = Object.fromEntries(searchParams.entries());
//     sp.include = 'card';
//     sp.page = sp.page || '1';
//     sp.limit = sp.limit || '12';
//     sp.category_id = sp.category_id || '1';
//     if (searchParams.get('search')) sp.search = searchParams.get('search');
//     const qs = new URLSearchParams(sp).toString();
//     return `/api/products?${qs}`;
//   };

//   const { data: productRes, error: productError } = useSWR(
//     productsKey(),
//     fetcher
//   );

//   // 當 SWR 回來結果後，更新 pageInfo（page, limit, total）
//   useEffect(() => {
//     if (productRes) {
//       setPageInfo((prev) => ({
//         ...prev, // 保留已同步的 category_id
//         page: productRes.page,
//         limit: productRes.limit,
//         total: productRes.total,
//       }));
//     }
//   }, [productRes]);

//   const products = productRes?.data || [];
//   const totalPages = Math.max(1, Math.ceil(pageInfo.total / pageInfo.limit));

//   // 取得收藏清單
//   const { data: favIds = [], mutate: mutateFav } = useSWR(
//     isAuth ? '/api/profile/favorites' : null,
//     fetcher
//   );

//   const toggleFavorite = useCallback(
//     async (productId) => {
//       const isFav = favIds.includes(productId);
//       const next = isFav
//         ? favIds.filter((id) => id !== productId)
//         : [...favIds, productId];
//       // 樂觀更新
//       mutateFav(next, false);
//       try {
//         if (isFav) {
//           await fetch(
//             `http://localhost:3005/api/profile/favorites/${productId}`,
//             { method: 'DELETE', credentials: 'include' }
//           );
//         } else {
//           await fetch('http://localhost:3005/api/profile/favorites', {
//             method: 'POST',
//             credentials: 'include',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ productId }),
//           });
//         }
//         mutateFav();
//       } catch {
//         mutateFav();
//       }
//     },
//     [favIds, mutateFav]
//   );

//   // ─── 5. 各種篩選操作 handler ───
//   const goToPage = (newPage) => {
//     const p = new URLSearchParams(Array.from(searchParams.entries()));
//     p.set('page', String(newPage)); // 確保是 string
//     router.push(`?${p.toString()}`);
//   };

//   const changeLimit = (newLimit) => {
//     const p = new URLSearchParams(Array.from(searchParams.entries()));
//     p.set('page', '1');
//     p.set('limit', String(newLimit)); // 確保是 string
//     router.push(`?${p.toString()}`);
//   };

//   const handleCategorySelect = (cid) => {
//     // setPageInfo 更新 category_id 的邏輯已移至上面的 useEffect
//     const p = new URLSearchParams(Array.from(searchParams.entries()));
//     p.set('page', '1');
//     p.set('category_id', String(cid)); // 確保是 string
//     router.push(`?${p.toString()}`);
//   };

//   const handleToggleCategory = (label, open) => {
//     setOpenCategories((prev) => {
//       const set = new Set(prev);
//       open ? set.add(label) : set.delete(label);
//       return Array.from(set);
//     });
//   };

//   // ─── 新增：切換品牌 checkbox───
//   const handleToggleBrand = (bid) => {
//     const next = selectedBrands.includes(bid)
//       ? selectedBrands.filter((i) => i !== bid)
//       : [...selectedBrands, bid];
//     const p = new URLSearchParams(Array.from(searchParams.entries()));
//     p.set('page', '1');
//     if (next.length) p.set('brand_id', next.join(','));
//     else p.delete('brand_id');
//     router.push(`?${p.toString()}`);
//     setSelectedBrands(next);
//   };

//   // ─── 新增：重置品牌───
//   const handleResetBrands = () => {
//     const p = new URLSearchParams(Array.from(searchParams.entries()));
//     p.delete('brand_id');
//     p.set('page', '1');
//     router.push(`?${p.toString()}`, undefined, { shallow: true });
//     setSelectedBrands([]);
//   };

//   // 1. Helper：根據 categories & selectedCategoryId 計算要預設開啟哪些 label
//   const getDefaultOpen = (categoriesList, selectedId) => {
//     const set = new Set();

//     // 總是展開 id=1 的那一路
//     const fixed = categoriesList.find((c) => c.id === 1);
//     if (fixed?.fullPath) {
//       fixed.fullPath
//         .split(' > ')
//         .map((s) => s.trim())
//         .forEach((label) => set.add(label));
//     }

//     // 如果有選中分類，再把它的 fullPath 也拆開加入
//     if (selectedId) {
//       const cur = categoriesList.find((c) => c.id === selectedId);
//       if (cur?.fullPath) {
//         cur.fullPath
//           .split(' > ')
//           .map((s) => s.trim())
//           .forEach((label) => set.add(label));
//       }
//     }

//     return Array.from(set);
//   };
//   // 2. openCategories state，初始值用 helper 計算
//   const [openCategories, setOpenCategories] = useState(() =>
//     getDefaultOpen(categories, pageInfo.category_id)
//   );
//   // 3. 當 categories 或 selectedCategoryId (= pageInfo.category_id) 變動時，重新同步
//   useEffect(() => {
//     setOpenCategories(getDefaultOpen(categories, pageInfo.category_id));
//   }, [categories, pageInfo.category_id]);

//   const handleToggleSize = (sid) => {
//     const next = selectedSizes.includes(sid)
//       ? selectedSizes.filter((i) => i !== sid)
//       : [...selectedSizes, sid];
//     const p = new URLSearchParams(Array.from(searchParams.entries()));
//     p.set('page', '1');
//     if (next.length) p.set('size_id', next.join(','));
//     else p.delete('size_id');
//     router.push(`?${p.toString()}`);
//     setSelectedSizes(next); // 立即更新 UI 反饋
//   };

//   // (其餘 handleSelect, JSX return 部分不變)
//   // 新增：重置所有尺寸的 handler
//   const handleResetSizes = () => {
//     // 1. 清掉 URL 上的 size_id，並把 page 重設1
//     const p = new URLSearchParams(Array.from(searchParams.entries()));
//     p.delete('size_id');
//     p.set('page', '1');
//     router.push(`?${p.toString()}`, undefined, { shallow: true });

//     // 2. 立即在 UI 上清空 selectedSizes
//     setSelectedSizes([]);
//   };

//   // 價格錯誤訊息 state
//   const [priceError, setPriceError] = useState('');

//   // onTriggerPriceFilter 改成帶驗證
//   const handlePriceFilter = () => {
//     const min = Number(minPrice);
//     const max = Number(maxPrice);
//     if (min < 0 || max < 0) {
//       setPriceError('價格不可為負數');
//       return;
//     }
//     if (max < min) {
//       setPriceError('最高價不能低於最低價');
//       return;
//     }
//     // 驗證通過
//     setPriceError('');
//     const p = new URLSearchParams(Array.from(searchParams.entries()));
//     p.set('page', '1');
//     if (minPrice) p.set('min_price', minPrice);
//     else p.delete('min_price');
//     if (maxPrice) p.set('max_price', maxPrice);
//     else p.delete('max_price');
//     router.push(`?${p.toString()}`, undefined, { shallow: true });
//   };

//   // 重置價格
//   const handleResetPrice = () => {
//     const p = new URLSearchParams(Array.from(searchParams.entries()));
//     p.delete('min_price');
//     p.delete('max_price');
//     p.set('page', '1');
//     router.push(`?${p.toString()}`, undefined, { shallow: true });
//     setMinPrice('');
//     setMaxPrice('');
//     setPriceError('');
//   };

//   if (isLoading) {
//     return <div>載入中...</div>; // 顯示 loading 畫面
//   }

//   if (!isAuth) {
//     // return <div>請先登入才能查看此頁面。</div>;
//   }

//   return (
//     <Container className="z-10 pt-4 md:pt-10 pb-20">
//       <div>
//         <h1>你好，{user?.name}！</h1>
//         <p>你的 Email 是：{user.email}</p>
//       </div>
//       <main className="flex flex-col md:flex-row min-h-1/2 gap-4 md:gap-20 justify-between">
//         {/* <ProductSidebar
//           limit={pageInfo.limit}
//           onChangeLimit={changeLimit}
//           categories={categories}
//           selectedCategoryId={pageInfo.category_id}
//           onSelectCategory={handleCategorySelect}
//           openCategories={openCategories}
//           onToggleCategory={handleToggleCategory}
//           sizes={sizesToShow}
//           selectedSizes={selectedSizes}
//           onToggleSize={handleToggleSize}
//           onResetSizes={handleResetSizes}
//           showAllSizes={showAllSizes}
//           canToggleSizes={canToggleSizes}
//           onToggleShowAllSizes={() => setShowAllSizes((prev) => !prev)}
//           brands={brands}
//           selectedBrands={selectedBrands}
//           onToggleBrand={handleToggleBrand}
//           onResetBrands={handleResetBrands}
//           minPrice={minPrice}
//           maxPrice={maxPrice}
//           onChangePrice={(type, val) => {
//             const clean = val.replace(/\D/g, '');
//             if (type === 'min') setMinPrice(clean);
//             else setMaxPrice(clean);
//             setPriceError('');
//           }}
//           onTriggerPriceFilter={handlePriceFilter}
//           onResetPrice={handleResetPrice}
//           priceError={priceError}
//           searchValue={searchText}
//           onChangeSearch={setSearchText}
//           suggestions={suggestions} // <--- 傳遞搜尋建議
//           isLoading={sugLoading} // <--- 傳遞加載狀態
//           onSelect={handleSelect} // <--- 傳遞點選建議處理
//         ></ProductSidebar> */}

//         {/* md+ 顯示常駐 Sidebar */}
//         <div className="hidden md:flex">
//           <ProductSidebar
//             limit={pageInfo.limit}
//             onChangeLimit={changeLimit}
//             categories={categories}
//             selectedCategoryId={pageInfo.category_id}
//             onSelectCategory={handleCategorySelect}
//             openCategories={openCategories}
//             onToggleCategory={handleToggleCategory}
//             sizes={sizesToShow}
//             selectedSizes={selectedSizes}
//             onToggleSize={handleToggleSize}
//             onResetSizes={handleResetSizes}
//             showAllSizes={showAllSizes}
//             canToggleSizes={canToggleSizes}
//             onToggleShowAllSizes={() => setShowAllSizes((prev) => !prev)}
//             brands={brands}
//             selectedBrands={selectedBrands}
//             onToggleBrand={handleToggleBrand}
//             onResetBrands={handleResetBrands}
//             minPrice={minPrice}
//             maxPrice={maxPrice}
//             onChangePrice={(type, val) => {
//               const clean = val.replace(/\D/g, '');
//               if (type === 'min') setMinPrice(clean);
//               else setMaxPrice(clean);
//               setPriceError('');
//             }}
//             onTriggerPriceFilter={handlePriceFilter}
//             onResetPrice={handleResetPrice}
//             priceError={priceError}
//             searchValue={searchText}
//             onChangeSearch={setSearchText}
//             suggestions={suggestions} // <--- 傳遞搜尋建議
//             isLoading={sugLoading} // <--- 傳遞加載狀態
//             onSelect={handleSelect} // <--- 傳遞點選建議處理
//           />
//         </div>

//         {/* md- 顯示按鈕 + Sheet */}
//         <div className="flex md:hidden">
//           <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
//             <SheetTrigger asChild>
//               <Button variant="outline" className="m-4">
//                 <Sliders className=" h-4 w-4" />
//                 篩選
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="left" className="w-full p-4 overflow-auto">
//               <SheetHeader className="flex items-center justify-between">
//                 <SheetTitle>篩選條件</SheetTitle>
//               </SheetHeader>
//               <ProductSidebar
//                 limit={pageInfo.limit}
//                 onChangeLimit={changeLimit}
//                 categories={categories}
//                 selectedCategoryId={pageInfo.category_id}
//                 onSelectCategory={handleCategorySelect}
//                 openCategories={openCategories}
//                 onToggleCategory={handleToggleCategory}
//                 sizes={sizesToShow}
//                 selectedSizes={selectedSizes}
//                 onToggleSize={handleToggleSize}
//                 onResetSizes={handleResetSizes}
//                 showAllSizes={showAllSizes}
//                 canToggleSizes={canToggleSizes}
//                 onToggleShowAllSizes={() => setShowAllSizes((prev) => !prev)}
//                 brands={brands}
//                 selectedBrands={selectedBrands}
//                 onToggleBrand={handleToggleBrand}
//                 onResetBrands={handleResetBrands}
//                 minPrice={minPrice}
//                 maxPrice={maxPrice}
//                 onChangePrice={(type, val) => {
//                   const clean = val.replace(/\D/g, '');
//                   if (type === 'min') setMinPrice(clean);
//                   else setMaxPrice(clean);
//                   setPriceError('');
//                 }}
//                 onTriggerPriceFilter={handlePriceFilter}
//                 onResetPrice={handleResetPrice}
//                 priceError={priceError}
//                 searchValue={searchText}
//                 onChangeSearch={setSearchText}
//                 suggestions={suggestions} // <--- 傳遞搜尋建議
//                 isLoading={sugLoading} // <--- 傳遞加載狀態
//                 onSelect={handleSelect} // <--- 傳遞點選建議處理
//               />
//             </SheetContent>
//           </Sheet>
//         </div>

//         <div className="flex flex-col gap-10 flex-1">
//           <ProductList
//             products={products}
//             favIds={favIds}
//             onToggleFavorite={toggleFavorite}
//           />
//           {productError && (
//             <div className="text-red-500">載入商品時發生錯誤</div>
//           )}
//           <ProductPagination
//             page={pageInfo.page}
//             totalPages={totalPages}
//             onPageChange={goToPage}
//           />
//         </div>
//       </main>
//     </Container>
//   );
// }

'use client';

// 引入必要的 React 函式庫和 Next.js 相關 Hook
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// 引入第三方函式庫，用於數據請求和防抖處理
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';

// 引入 UI 元件，包含頁面容器、側邊欄組件、按鈕和圖示
import Container from '@/components/container';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sliders } from 'lucide-react';

// 引入自定義元件，用於顯示商品列表、分頁和側邊篩選欄
import ProductList from './_components/product-list';
import ProductPagination from './_components/product-pagination';
import ProductSidebar from './_components/product-sidebar';
import ProductSort from './_components/product-sort';
import ProductHighlightCard from './_components/product-highlight-card';

// 引入自定義 Hook，用於管理用戶認證狀態
import { useAuth } from '@/hooks/use-auth';

/*
商品V3 (已修復 category_id 同步問題)
*/

// SWR 的數據獲取函式 (Fetcher)
// 這個函式負責從指定的 URL 獲取數據並將其解析為 JSON 格式。
// `credentials: 'include'` 確保在請求中包含憑證（例如 Cookie），用於處理需要驗證的 API。
const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';
const fetcher = (url) =>
  // fetch(`http://localhost:3005${url}`, { credentials: 'include' }).then((r) =>
  //   r.json()
  fetch(`${base}${url}`, {
    credentials: 'include',
  }).then((r) => r.json());

// 商品頁面主元件
export default function ProductPage() {
  // 使用 `useAuth` Hook 獲取用戶認證狀態、用戶資訊以及載入狀態。
  const { user, isAuth, isLoading } = useAuth();

  // 使用 Next.js 的 `useSearchParams` 來讀取 URL 中的查詢參數，
  // 並使用 `useRouter` 來進行頁面導航。
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- 搜尋功能相關 State 與邏輯 ---
  // 1. **搜尋文字 (searchText) 與防抖 (debouncedSearch)**
  //    `searchText` 用於綁定搜尋輸入框的即時值。
  //    `initialSearch` 從 URL 中獲取初始搜尋值。
  //    `useDebounce` 確保在用戶停止輸入 300 毫秒後，才會更新 `debouncedSearch` 的值，
  //    這樣可以避免在用戶輸入每個字元時都觸發 API 請求，優化性能。
  const initialSearch = searchParams.get('search') || '';
  const [searchText, setSearchText] = useState(initialSearch);
  const [debouncedSearch] = useDebounce(searchText, 300);

  // 2. **同步防抖後的搜尋值到 URL**
  //    這個 `useEffect` 會監聽 `debouncedSearch` 的變化。
  //    當 `debouncedSearch` 的值與 URL 中的 `search` 參數不同時，
  //    它會更新 URL 中的 `search` 參數，並將頁碼重置為 1。
  //    `shallow: true` 確保頁面不會完全重新載入，只更新 URL，提供更流暢的用戶體驗。
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    const currentSearch = params.get('search') || '';

    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, router, searchParams]);

  // 3. **獲取搜尋建議**
  //    使用 `useSWR` 獲取搜尋建議。只有當 `debouncedSearch` 的長度大於等於 2 時，
  //    才會觸發 API 請求，以減少不必要的請求。
  //    `suggestions` 儲存建議列表，`sugLoading` 表示建議是否正在載入。
  const { data: suggestions = [], isValidating: sugLoading } = useSWR(
    debouncedSearch.length >= 2
      ? `/api/products/search-suggestions?search=${encodeURIComponent(debouncedSearch)}&limit=5`
      : null,
    fetcher
  );

  // 4. **處理點選搜尋建議**
  //    當用戶點選搜尋建議時，這個函式會將搜尋輸入框的值更新為建議的商品名稱，
  //    同時更新 URL 中的 `search` 參數並重置頁碼。
  const handleSelect = (item) => {
    setSearchText(item.name);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('search', item.name);
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // --- 篩選條件相關 State 管理 ---
  // 1. **頁面資訊 (pageInfo)**
  //    這個 State 儲存了當前頁碼、每頁顯示數量、總商品數量和選中的分類 ID。
  //    初始值從 URL 參數中讀取。
  const [pageInfo, setPageInfo] = useState({
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '12', 10),
    total: 0,
    category_id: parseInt(searchParams.get('category_id') || '1', 10),
  });

  // 2. **分類、品牌、尺寸列表及選中狀態**
  //    這些 State 分別儲存了分類、品牌和尺寸的完整列表。
  //    `selectedBrands` 和 `selectedSizes` 儲存用戶選中的品牌 ID 和尺寸 ID。
  //    `showAllSizes` 和 `canToggleSizes` 用於控制尺寸列表的展開與收起顯示邏輯。
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams
      .get('brand_id')
      ?.split(',')
      .map((v) => Number(v)) || []
  );
  const [sizes, setSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState(
    searchParams
      .get('size_id')
      ?.split(',')
      .map((v) => Number(v)) || []
  );
  const [showAllSizes, setShowAllSizes] = useState(false);
  const previewCount = 12;
  const sizesToShow = showAllSizes ? sizes : sizes.slice(0, previewCount);
  const canToggleSizes = sizes.length > previewCount;

  // 3. **價格篩選 State**
  //    `minPrice` 和 `maxPrice` 儲存用戶輸入的最低和最高價格。
  //    `priceError` 用於顯示價格輸入的驗證錯誤訊息。
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [priceError, setPriceError] = useState('');

  // 4. **側邊欄 Sheet 狀態**
  //    `sidebarOpen` 控制在小螢幕上側邊篩選欄的開啟/關閉狀態。
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- 數據載入與同步 Effect ---
  // 1. **從 URL 同步 category_id 到 pageInfo**
  //    這個 `useEffect` 會監聽 URL 中 `category_id` 的變化。
  //    當 URL 中的 `category_id` 與 `pageInfo` 中的不同時，
  //    它會更新 `pageInfo` 的 `category_id` 並將頁碼重置為 1，確保篩選條件一致。
  const categoryIdFromUrl = searchParams.get('category_id');
  useEffect(() => {
    const newCategoryId = parseInt(categoryIdFromUrl || '1', 10);
    setPageInfo((prev) => {
      if (prev.category_id !== newCategoryId) {
        return { ...prev, category_id: newCategoryId, page: 1 };
      }
      return prev;
    });
  }, [categoryIdFromUrl, searchParams]);

  // 2. **載入分類清單**
  //    這個 `useEffect` 在元件首次載入時執行，只會執行一次，用於獲取所有商品分類列表。
  useEffect(() => {
    fetch(`${base}/api/products/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // 3. **載入尺寸列表**
  //    這個 `useEffect` 會監聽 `pageInfo.category_id` 的變化。
  //    當分類改變時，它會重新請求該分類下的可用尺寸列表，
  //    並過濾掉 `selectedSizes` 中不屬於新列表的尺寸 ID。
  useEffect(() => {
    if (!pageInfo.category_id) return;
    const url = new URL(`${base}/api/products/sizes`);
    url.searchParams.set('category_id', String(pageInfo.category_id));
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setSizes(data);
        setSelectedSizes((prevSelected) =>
          prevSelected.filter((id) => data.some((s) => s.id === id))
        );
      })
      .catch(console.error);
  }, [pageInfo.category_id]);

  // 4. **載入品牌列表**
  //    這個 `useEffect` 同樣監聽 `pageInfo.category_id` 的變化。
  //    當分類改變時，它會重新請求該分類下的可用品牌列表，
  //    並過濾掉 `selectedBrands` 中不屬於新列表的品牌 ID。
  useEffect(() => {
    if (!pageInfo.category_id) return;
    const url = new URL(`${base}/api/products/brands`);
    url.searchParams.set('category_id', String(pageInfo.category_id));
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setBrands(data);
        setSelectedBrands((prev) =>
          prev.filter((id) => data.some((b) => b.id === id))
        );
      })
      .catch(console.error);
  }, [pageInfo.category_id]);

  // 新增排序狀態，從 URL 讀取初始值，若無則使用預設值 (例如：依上架時間由新到舊)
  const [sortOption, setSortOption] = useState(
    () => searchParams.get('sort') || 'createdAt_desc'
  );

  // Effect Hook：當 URL 中的 'sort' 參數改變時，同步更新 sortOption state
  useEffect(() => {
    setSortOption(searchParams.get('sort') || 'createdAt_desc');
  }, [searchParams]);

  // 5. **用 SWR 獲取商品列表**
  //    `productsKey` 函式根據當前 URL 參數動態生成 SWR 的 Key。
  //    `useSWR` 根據這個 Key 和 `Workspaceer` 函式獲取商品列表數據。
  //    `productRes` 儲存 API 回傳的商品資料，`productError` 儲存錯誤訊息。
  const productsKey = () => {
    const sp = Object.fromEntries(searchParams.entries());
    sp.include = 'card';
    sp.page = sp.page || '1';
    sp.limit = sp.limit || '12';
    sp.category_id = sp.category_id || '1';
    if (searchParams.get('search')) sp.search = searchParams.get('search');
    const qs = new URLSearchParams(sp).toString();
    return `/api/products?${qs}`;
  };

  const { data: productRes, error: productError } = useSWR(
    productsKey(),
    fetcher
  );

  // 6. **更新 pageInfo (頁碼、每頁限制、總數)**
  //    當 `productRes`（商品列表數據）返回後，這個 `useEffect` 會更新 `pageInfo`，
  //    包含當前頁碼、每頁限制數量和總商品數量，以供分頁元件使用。
  useEffect(() => {
    if (productRes) {
      setPageInfo((prev) => ({
        ...prev,
        page: productRes.page,
        limit: productRes.limit,
        total: productRes.total,
      }));
    }
  }, [productRes]);

  // 計算總頁數，確保至少為 1 頁，避免除以零或負數的情況。
  const products = productRes?.data || [];
  const totalPages = Math.max(1, Math.ceil(pageInfo.total / pageInfo.limit));

  // 7. **獲取收藏清單與切換收藏**
  //    使用 `useSWR` 獲取用戶的收藏商品 ID 列表 (`favIds`)。只有在用戶登入時才觸發請求。
  //    `mutateFav` 用於手動更新 SWR 緩存，實現樂觀更新 (optimistic update)。
  //    `toggleFavorite` 函式處理商品收藏/取消收藏的邏輯，它會先進行樂觀更新，然後發送 API 請求。
  const { data: favIds = [], mutate: mutateFav } = useSWR(
    isAuth ? '/api/profile/favorites' : null,
    fetcher
  );

  const toggleFavorite = useCallback(
    async (productId) => {
      const isFav = favIds.includes(productId);
      const next = isFav
        ? favIds.filter((id) => id !== productId)
        : [...favIds, productId];
      mutateFav(next, false); // 樂觀更新

      try {
        if (isFav) {
          await fetch(`${base}/api/profile/favorites/${productId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } else {
          await fetch(`${base}/api/profile/favorites`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });
        }
        mutateFav(); // 重新驗證數據
      } catch {
        mutateFav(); // 錯誤時回滾
      }
    },
    [favIds, mutateFav]
  );

  // --- 各種篩選操作 Handler 函式 ---
  // 這些函式負責處理用戶與篩選條件的互動，並更新 URL 參數以觸發數據重新載入。
  // 1. **導航到指定頁碼**
  const goToPage = (newPage) => {
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.set('page', String(newPage));
    router.push(`?${p.toString()}`);
  };

  // 2. **改變每頁顯示數量**
  const changeLimit = (newLimit) => {
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.set('page', '1'); // 改變限制時重置頁碼
    p.set('limit', String(newLimit));
    router.push(`?${p.toString()}`);
  };

  // 3. **處理分類選擇**
  const handleCategorySelect = (cid) => {
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.set('page', '1'); // 改變分類時重置頁碼
    p.set('category_id', String(cid));
    router.push(`?${p.toString()}`, { scroll: false });
  };

  // 4. **切換分類展開/收起狀態**
  const handleToggleCategory = (label, open) => {
    setOpenCategories((prev) => {
      const set = new Set(prev);
      open ? set.add(label) : set.delete(label);
      return Array.from(set);
    });
  };

  // 5. **切換品牌選擇**
  const handleToggleBrand = (bid) => {
    const next = selectedBrands.includes(bid)
      ? selectedBrands.filter((i) => i !== bid)
      : [...selectedBrands, bid];
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.set('page', '1'); // 改變品牌時重置頁碼
    if (next.length) p.set('brand_id', next.join(','));
    else p.delete('brand_id');
    router.push(`?${p.toString()}`, { scroll: false });
    setSelectedBrands(next); // 立即更新 UI
  };

  // 6. **重置品牌篩選**
  const handleResetBrands = () => {
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.delete('brand_id');
    p.set('page', '1');
    router.push(`?${p.toString()}`, { scroll: false });
    setSelectedBrands([]); // 立即清空 UI
  };

  // 處理排序變更的函式
  const handleSortChange = (newSortValue) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (newSortValue) {
      params.set('sort', newSortValue);
    } else {
      // 如果允許清除排序或回到 API 預設排序，可以刪除 'sort' 參數
      params.delete('sort');
    }
    params.set('page', '1'); // 變更排序時，重置到第一頁
    router.push(`?${params.toString()}`, { scroll: false });
    // sortOption state 將通過 useEffect 因 searchParams 改變而更新
  };

  // --- 分類展開邏輯 ---
  // 1. **輔助函式：計算預設開啟的分類**
  //    這個函式會根據完整的分類列表和當前選中的分類 ID，
  //    判斷哪些分類應該預設展開（例如 ID 為 1 的分類以及當前選中分類的完整路徑）。
  const getDefaultOpen = (categoriesList, selectedId) => {
    const set = new Set();
    const fixed = categoriesList.find((c) => c.id === 1);
    if (fixed?.fullPath) {
      fixed.fullPath
        .split(' > ')
        .map((s) => s.trim())
        .forEach((label) => set.add(label));
    }
    if (selectedId) {
      const cur = categoriesList.find((c) => c.id === selectedId);
      if (cur?.fullPath) {
        cur.fullPath
          .split(' > ')
          .map((s) => s.trim())
          .forEach((label) => set.add(label));
      }
    }
    return Array.from(set);
  };

  // 2. **`openCategories` State**
  //    儲存當前展開的分類標籤列表，初始值由 `getDefaultOpen` 計算。
  const [openCategories, setOpenCategories] = useState(() =>
    getDefaultOpen(categories, pageInfo.category_id)
  );

  // 3. **同步 `openCategories`**
  //    當 `categories` 或 `pageInfo.category_id` 改變時，重新計算並同步 `openCategories`。
  useEffect(() => {
    setOpenCategories(getDefaultOpen(categories, pageInfo.category_id));
  }, [categories, pageInfo.category_id]);

  // --- 尺寸篩選邏輯 ---
  // 1. **切換尺寸選擇**
  const handleToggleSize = (sid) => {
    const next = selectedSizes.includes(sid)
      ? selectedSizes.filter((i) => i !== sid)
      : [...selectedSizes, sid];
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.set('page', '1'); // 改變尺寸時重置頁碼
    if (next.length) p.set('size_id', next.join(','));
    else p.delete('size_id');
    router.push(`?${p.toString()}`, { scroll: false });
    setSelectedSizes(next); // 立即更新 UI
  };

  // 2. **重置所有尺寸篩選**
  const handleResetSizes = () => {
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.delete('size_id');
    p.set('page', '1');
    router.push(`?${p.toString()}`, { scroll: false });
    setSelectedSizes([]); // 立即清空 UI
  };

  // --- 價格篩選邏輯 ---
  // 1. **觸發價格篩選**
  //    這個函式會驗證用戶輸入的最低和最高價格，確保其合法性（非負數且最高價不低於最低價）。
  //    驗證通過後，更新 URL 中的 `min_price` 和 `max_price` 參數，並重置頁碼。
  const handlePriceFilter = () => {
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (min < 0 || max < 0) {
      setPriceError('價格不可為負數');
      return;
    }
    if (max < min) {
      setPriceError('最高價不能低於最低價');
      return;
    }
    setPriceError(''); // 驗證通過，清除錯誤
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.set('page', '1'); // 改變價格時重置頁碼
    if (minPrice) p.set('min_price', minPrice);
    else p.delete('min_price');
    if (maxPrice) p.set('max_price', maxPrice);
    else p.delete('max_price');
    router.push(`?${p.toString()}`, { scroll: false });
  };

  // 2. **重置價格篩選**
  //    清空 URL 中的價格參數，重置頁碼，並清空輸入框和錯誤訊息。
  const handleResetPrice = () => {
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.delete('min_price');
    p.delete('max_price');
    p.set('page', '1');
    router.push(`?${p.toString()}`, { scroll: false });
    setMinPrice('');
    setMaxPrice('');
    setPriceError('');
  };

  // --- 載入狀態處理 ---
  // 在用戶認證資訊載入完成之前，顯示載入中的訊息。
  if (isLoading) {
    return <div>載入中...</div>;
  }

  // --- 頁面渲染 ---
  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative bg-cover bg-[center_80%] bg-no-repeat h-[30vh] md:h-[60vh]  text-center"
        // style={{
        //   backgroundImage: "url('/26852e04-a393-422d-bd61-8042373024da.png')", // 請確認此圖片路徑正確
        // }}
      >
        <video
          className="absolute w-full h-full object-cover "
          src="/ProductHeroSection.mp4" // 把這裡改成影片檔路徑，放在 public 資料夾下即可用相對路徑引用
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0  "></div>
        {/* 使用黑色疊加和模糊效果 */}
        {/* 背景使用 bg-white 加上透明度，或者如果 :root 的 --background 是白色，用 bg-background/85 */}
      </section>

      <Container className="z-10 pt-4 md:pt-10 pb-20">
        <ProductHighlightCard />
        {/* 顯示用戶歡迎訊息和 Email (如果用戶已登入) */}
        <div className="hidden md:flex">
          {/* <h1>你好，{user?.name}！</h1>
          <p>你的 Email 是：{user.email}</p> */}
          <ProductSort
            currentSort={sortOption}
            onSortChange={handleSortChange}
          />
        </div>

        <main className="flex flex-col md:flex-row min-h-1/2 gap-4 md:gap-20 justify-between">
          {/*
          側邊篩選欄 (ProductSidebar)：
          在 MD (中等) 及以上螢幕尺寸時，顯示為常駐側邊欄；
          在 MD 以下螢幕尺寸時，則通過 Sheet 元件以彈出方式顯示。
          所有篩選條件的 State 和 Handler 都會以 Props 傳遞給 ProductSidebar。
        */}
          {/* MD+ 尺寸螢幕顯示常駐 Sidebar */}
          <div className="hidden md:flex">
            <ProductSidebar
              limit={pageInfo.limit}
              onChangeLimit={changeLimit}
              categories={categories}
              selectedCategoryId={pageInfo.category_id}
              onSelectCategory={handleCategorySelect}
              openCategories={openCategories}
              onToggleCategory={handleToggleCategory}
              sizes={sizesToShow}
              selectedSizes={selectedSizes}
              onToggleSize={handleToggleSize}
              onResetSizes={handleResetSizes}
              showAllSizes={showAllSizes}
              canToggleSizes={canToggleSizes}
              onToggleShowAllSizes={() => setShowAllSizes((prev) => !prev)}
              brands={brands}
              selectedBrands={selectedBrands}
              onToggleBrand={handleToggleBrand}
              onResetBrands={handleResetBrands}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onChangePrice={(type, val) => {
                const clean = val.replace(/\D/g, '');
                if (type === 'min') setMinPrice(clean);
                else setMaxPrice(clean);
                setPriceError('');
              }}
              onTriggerPriceFilter={handlePriceFilter}
              onResetPrice={handleResetPrice}
              priceError={priceError}
              searchValue={searchText}
              onChangeSearch={setSearchText}
              suggestions={suggestions}
              isLoading={sugLoading}
              onSelect={handleSelect}
            />
          </div>

          {/* MD- 尺寸螢幕顯示篩選按鈕和 Sheet 彈出側邊欄 */}
          <div className="flex md:hidden justify-around">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="m-4">
                  <Sliders className=" h-4 w-4" />
                  篩選
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full p-4 overflow-auto z-99999"
              >
                <SheetHeader className="flex items-center justify-between">
                  <SheetTitle>篩選條件</SheetTitle>
                </SheetHeader>
                {/* Sheet 內部同樣渲染 ProductSidebar，保持功能一致性 */}
                <ProductSidebar
                  limit={pageInfo.limit}
                  onChangeLimit={changeLimit}
                  categories={categories}
                  selectedCategoryId={pageInfo.category_id}
                  onSelectCategory={handleCategorySelect}
                  openCategories={openCategories}
                  onToggleCategory={handleToggleCategory}
                  sizes={sizesToShow}
                  selectedSizes={selectedSizes}
                  onToggleSize={handleToggleSize}
                  onResetSizes={handleResetSizes}
                  showAllSizes={showAllSizes}
                  canToggleSizes={canToggleSizes}
                  onToggleShowAllSizes={() => setShowAllSizes((prev) => !prev)}
                  brands={brands}
                  selectedBrands={selectedBrands}
                  onToggleBrand={handleToggleBrand}
                  onResetBrands={handleResetBrands}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onChangePrice={(type, val) => {
                    const clean = val.replace(/\D/g, '');
                    if (type === 'min') setMinPrice(clean);
                    else setMaxPrice(clean);
                    setPriceError('');
                  }}
                  onTriggerPriceFilter={handlePriceFilter}
                  onResetPrice={handleResetPrice}
                  priceError={priceError}
                  searchValue={searchText}
                  onChangeSearch={setSearchText}
                  suggestions={suggestions}
                  isLoading={sugLoading}
                  onSelect={handleSelect}
                />
              </SheetContent>
            </Sheet>

            <ProductSort
              currentSort={sortOption}
              onSortChange={handleSortChange}
            />
          </div>

          {/* 商品列表和分頁區域 */}
          <div className="flex flex-col gap-10 flex-1">
            {/* 商品列表元件，顯示篩選後的商品。
              同時傳遞收藏相關的數據和函式。 */}
            <ProductList
              products={products}
              favIds={favIds}
              onToggleFavorite={toggleFavorite}
              isAuth={isAuth}
            />
            {/* 如果載入商品時發生錯誤，顯示錯誤訊息 */}
            {productError && (
              <div className="text-red-500">載入商品時發生錯誤</div>
            )}
            {/* 商品分頁元件，處理頁碼顯示和切換。 */}
            <ProductPagination
              page={pageInfo.page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        </main>
      </Container>
    </>
  );
}
