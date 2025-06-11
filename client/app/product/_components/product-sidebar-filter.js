import { Button } from '@/components/ui/button';

export default function ProductFilter({
  limit,
  onChangeLimit, // 新增這兩個 props
  sizes,
  selectedSizes,
  onToggleSize,
  onResetSizes,
  showAllSizes,
  onToggleShowAllSizes,
  canToggleSizes,
  brands,
  selectedBrands,
  onToggleBrand,
  onResetBrands,
  minPrice,
  maxPrice,
  onChangePrice,
  onTriggerPriceFilter,
  onResetPrice,
  priceError,
}) {
  return (
    <div className="flex flex-col md:max-w-48 xl:max-w-64 w-full mx-auto">
      {/* Filter Checkboxes */}
      <div className="px-4 py-2">
        {/* ====== 品牌篩選 ====== */}
        <div className="px-4 py-2 border-t mt-4">
          <h4 className="font-medium mb-2">品牌篩選</h4>

          <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
            {brands.map((b) => (
              <label key={b.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b.id)}
                  onChange={() => onToggleBrand(b.id)}
                  className="rounded border-[#cccccc]"
                />
                <span>{b.name}</span>
              </label>
            ))}
          </div>
          <Button
            onClick={onResetBrands}
            className="w-full mt-4 hover:bg-primary-500 cursor-none"
          >
            重置品牌
          </Button>
        </div>

        {/* 尺寸篩選
        <div className="px-4 py-2 border-t">
          <h4 className="font-medium mb-2">尺寸篩選</h4>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {sizes.map((s) => (
              <label key={s.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(s.id)}
                  onChange={() => onToggleSize(s.id)}
                  className="rounded border-[#cccccc]"
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
          <Button
            onClick={onResetSizes}
            className="w-full mt-4 hover:bg-primary-500 cursor-pointer"
          >
            重置尺寸
          </Button>
        </div> */}

        {/* ====== 尺寸篩選 ====== */}
        <div className="px-4 py-2 border-t">
          <h4 className="font-medium mb-2">尺寸篩選</h4>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {sizes.map((s) => (
              <label key={s.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(s.id)}
                  onChange={() => onToggleSize(s.id)}
                  className="rounded border-[#cccccc]"
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>

          {canToggleSizes && (
            <div className="text-center mt-2">
              <button
                onClick={onToggleShowAllSizes}
                className="text-sm font-medium text-primary-600 dark:text-blue-300 hover:underline cursor-none"
              >
                {showAllSizes ? '收合尺寸' : '查看更多尺寸'}
              </button>
            </div>
          )}

          <Button
            onClick={onResetSizes}
            className="w-full mt-4 hover:bg-primary-500 dark:hover:text-blue-300 cursor-none"
          >
            重置尺寸
          </Button>
        </div>

        {/* 價格篩選 */}
        <div className="px-4 py-2 border-t mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">價格篩選</h4>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minPrice}
              onChange={(e) => onChangePrice('min', e.target.value)}
              placeholder="最低價"
              className="w-full border px-2 py-1 "
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={maxPrice}
              onChange={(e) => onChangePrice('max', e.target.value)}
              placeholder="最高價"
              className="w-full border px-2 py-1 "
            />
          </div>
          <Button
            onClick={onTriggerPriceFilter}
            className="w-full mt-2 hover:bg-primary-500 cursor-none"
          >
            價格篩選
          </Button>

          {priceError && (
            <p className="mt-1 text-sm text-red-500">{priceError}</p>
          )}

          <Button
            className="w-full mt-4 hover:bg-primary-500 cursor-none"
            onClick={onResetPrice}
          >
            重置價格
          </Button>
        </div>

        {/* 每頁筆數選項 */}
        <div className="flex flex-col gap-4 mt-4 px-2 py-2 border-t border-secondary-800 pt-4">
          <label className="flex items-center space-x-2 text-sm mb-2 ">
            <span>每頁顯示：</span>
            <select
              value={limit}
              onChange={(e) => onChangeLimit(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {[4, 8, 12, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} 筆
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
