// 檔案路徑: components/GroupForm.js (或者您喜歡的其他共用元件路徑)
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'; // 引入 Card 相關元件
import Image from 'next/image';
// 預設的表單值
const DEFAULT_FORM_VALUES = {
  type: '',
  title: '',
  startDate: '',
  endDate: '',
  locationId: '',
  customLocation: '',
  difficulty: '',
  minPeople: 2,
  maxPeople: 10,
  price: 0,
  allowNewbie: true,
  description: '',
  coverFile: null,
};

export default function GroupForm({
  initialValues,
  onSubmit,
  isLoading = false,
  typeOptions = [],
  locationOptions = [], // 由父組件傳入，因為它依賴於 type
  skiDifficultyOptions = [
    // 可以是固定的，或由父組件傳入
    { value: '初級', label: '初級' },
    { value: '中級', label: '中級' },
    { value: '進階', label: '進階' },
  ],
  formError, // 從父組件接收錯誤訊息
  setFormError, // 從父組件接收設定錯誤訊息的函數
  onFormDataChange, // 新增一個回呼，當表單資料變化時通知父組件
}) {
  const [formData, setFormData] = useState({
    ...DEFAULT_FORM_VALUES,
    ...initialValues, // 如果有 initialValues，則覆蓋預設值
  });

  const [coverPreview, setCoverPreview] = useState('');
  const fileInputRef = useRef(null);

  // 當 initialValues 變化時 (例如，編輯模式下資料載入完成)，更新表單資料
  useEffect(() => {
    setFormData((prevData) => ({
      ...DEFAULT_FORM_VALUES, // 確保所有欄位都有預設值
      ...prevData, // 保留用戶可能已經修改的部分 (如果適用)
      ...initialValues, // 最新的初始值
    }));
    if (initialValues?.coverPreview) {
      // 假設 initialValues 可能包含已有的圖片預覽路徑
      setCoverPreview(initialValues.coverPreview);
    } else {
      setCoverPreview(''); // 如果沒有初始圖片，則清空預覽
    }
  }, [initialValues]);

  // 當表單資料變化時，通知父組件
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(formData, coverPreview);
    }
  }, [formData, coverPreview, onFormDataChange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePopoverSelect = (name, value, popoverSetter) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      // 如果類型改變，重置地點相關欄位
      if (name === 'type') {
        newState.locationId = '';
        newState.customLocation = '';
        newState.difficulty = ''; // 滑雪難度也跟類型有關
      }
      return newState;
    });
    popoverSetter(false);
  };

  const handleCoverChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        // 5MB 限制
        if (setFormError) setFormError('圖片檔案過大，請上傳小於 5MB 的圖片。');
        else alert('圖片檔案過大，請上傳小於 5MB 的圖片。');
        return;
      }
      setFormData((prev) => ({ ...prev, coverFile: f }));
      setCoverPreview(URL.createObjectURL(f));
      if (setFormError) setFormError(''); // 清除之前的錯誤
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) {
      if (f.size > 5 * 1024 * 1024) {
        if (setFormError) setFormError('圖片檔案過大，請上傳小於 5MB 的圖片。');
        else alert('圖片檔案過大，請上傳小於 5MB 的圖片。');
        return;
      }
      setFormData((prev) => ({ ...prev, coverFile: f }));
      setCoverPreview(URL.createObjectURL(f));
      if (setFormError) setFormError('');
    } else {
      if (setFormError) setFormError('請拖曳圖片檔案。');
      else alert('請拖曳圖片檔案。');
    }
  };

  const clearCoverImage = (e) => {
    if (e) e.stopPropagation(); // 防止觸發外層的點擊事件
    setFormData((prev) => ({ ...prev, coverFile: null }));
    setCoverPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 可以在這裡加入表單驗證邏輯，或者由父組件處理
    onSubmit(formData); // 將包含 coverFile 的 formData 傳遞給父組件
  };

  // Popover state
  const [openTypePopover, setOpenTypePopover] = useState(false);
  const [openLocationPopover, setOpenLocationPopover] = useState(false);
  const [openDifficultyPopover, setOpenDifficultyPopover] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-xl bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-50 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {initialValues?.id ? '編輯揪團活動' : '建立您的揪團活動'}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {initialValues?.id
              ? '請修改以下資訊。'
              : '請填寫以下基本資訊來發起您的揪團。'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          {/* 活動類型 */}
          <div>
            <Label
              htmlFor="type-popover-trigger"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              活動類型 <span className="text-red-500">*</span>
            </Label>
            <Popover open={openTypePopover} onOpenChange={setOpenTypePopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openTypePopover}
                  id="type-popover-trigger"
                  className="w-full mt-1 justify-between bg-white border-slate-300 text-slate-900 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:hover:bg-slate-600"
                >
                  {formData.type
                    ? typeOptions.find((o) => o.value === formData.type)?.label
                    : '請選擇活動類型'}
                  <span className="ml-2 text-xs opacity-50">▼▲</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="搜尋類型..."
                    className="h-9 border-slate-300 dark:border-slate-700"
                  />
                  <CommandList>
                    <CommandEmpty>找不到類型。</CommandEmpty>
                    <CommandGroup>
                      {typeOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={(currentValue) =>
                            handlePopoverSelect(
                              'type',
                              currentValue,
                              setOpenTypePopover
                            )
                          }
                          className="hover:bg-slate-100 dark:hover:bg-slate-700 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700"
                        >
                          <span
                            className={`mr-2 h-4 w-4 ${formData.type === option.value ? 'opacity-100 font-bold' : 'opacity-0'}`}
                          >
                            ✓
                          </span>
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* 揪團標題 */}
          <div>
            <Label
              htmlFor="title"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              揪團標題 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="例如：週末輕鬆滑雪新手團"
              className="mt-1 bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>

          {/* 日期 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div>
              <Label
                htmlFor="startDate"
                className="font-medium text-slate-700 dark:text-slate-300"
              >
                開始日期 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:[color-scheme:dark]"
                required
              />
            </div>
            <div>
              <Label
                htmlFor="endDate"
                className="font-medium text-slate-700 dark:text-slate-300"
              >
                結束日期 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate} // 確保結束日期不早於開始日期
                className="mt-1 bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:[color-scheme:dark]"
                required
              />
            </div>
          </div>

          {/* 活動地點 */}
          <div>
            <Label
              htmlFor="location-popover-trigger"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              活動地點 <span className="text-red-500">*</span>
            </Label>
            {formData.type === '滑雪' ? (
              <Popover
                open={openLocationPopover}
                onOpenChange={setOpenLocationPopover}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLocationPopover}
                    id="location-popover-trigger"
                    className="w-full mt-1 justify-between bg-white border-slate-300 text-slate-900 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:hover:bg-slate-600"
                  >
                    {formData.locationId
                      ? locationOptions.find(
                          (l) => String(l.id) === String(formData.locationId)
                        )?.name
                      : '請選擇滑雪場'}
                    <span className="ml-2 text-xs opacity-50">▼▲</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="搜尋滑雪場..."
                      className="h-9 border-slate-300 dark:border-slate-700"
                    />
                    <CommandList>
                      <CommandEmpty>找不到滑雪場。</CommandEmpty>
                      <CommandGroup>
                        {locationOptions.map((loc) => (
                          <CommandItem
                            key={loc.id}
                            value={loc.name} // CommandItem 的 value 建議用來搜尋的字串
                            onSelect={() =>
                              handlePopoverSelect(
                                'locationId',
                                String(loc.id),
                                setOpenLocationPopover
                              )
                            }
                            className="hover:bg-slate-100 dark:hover:bg-slate-700 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700"
                          >
                            <span
                              className={`mr-2 h-4 w-4 ${String(formData.locationId) === String(loc.id) ? 'opacity-100 font-bold' : 'opacity-0'}`}
                            >
                              ✓
                            </span>
                            {loc.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <Input
                id="customLocation"
                name="customLocation"
                value={formData.customLocation}
                onChange={handleChange}
                placeholder={
                  formData.type === '聚餐'
                    ? '請輸入餐廳名稱與地址'
                    : '請輸入詳細活動地點'
                }
                className="mt-1 bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                required={formData.type !== '滑雪'}
              />
            )}
          </div>

          {/* 滑雪難易度 (僅當類型為滑雪時顯示) */}
          {formData.type === '滑雪' && (
            <div>
              <Label
                htmlFor="difficulty-popover-trigger"
                className="font-medium text-slate-700 dark:text-slate-300"
              >
                滑雪難易度
              </Label>
              <Popover
                open={openDifficultyPopover}
                onOpenChange={setOpenDifficultyPopover}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDifficultyPopover}
                    id="difficulty-popover-trigger"
                    className="w-full mt-1 justify-between bg-white border-slate-300 text-slate-900 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:hover:bg-slate-600"
                  >
                    {formData.difficulty
                      ? skiDifficultyOptions.find(
                          (o) => o.value === formData.difficulty
                        )?.label
                      : '選擇難易度 (可選)'}
                    <span className="ml-2 text-xs opacity-50">▼▲</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                  align="start"
                >
                  <Command>
                    <CommandList>
                      <CommandEmpty>找不到難易度。</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() =>
                            handlePopoverSelect(
                              'difficulty',
                              '',
                              setOpenDifficultyPopover
                            )
                          }
                          className="hover:bg-slate-100 dark:hover:bg-slate-700 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700"
                        >
                          <span
                            className={`mr-2 h-4 w-4 ${formData.difficulty === '' ? 'opacity-100 font-bold' : 'opacity-0'}`}
                          >
                            ✓
                          </span>
                          不指定
                        </CommandItem>
                        {skiDifficultyOptions.map((o) => (
                          <CommandItem
                            key={o.value}
                            value={o.value}
                            onSelect={(currentValue) =>
                              handlePopoverSelect(
                                'difficulty',
                                currentValue,
                                setOpenDifficultyPopover
                              )
                            }
                            className="hover:bg-slate-100 dark:hover:bg-slate-700 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700"
                          >
                            <span
                              className={`mr-2 h-4 w-4 ${formData.difficulty === o.value ? 'opacity-100 font-bold' : 'opacity-0'}`}
                            >
                              ✓
                            </span>
                            {o.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* 人數 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div>
              <Label
                htmlFor="minPeople"
                className="font-medium text-slate-700 dark:text-slate-300"
              >
                最少人數 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minPeople"
                name="minPeople"
                type="number"
                min={1}
                value={formData.minPeople}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minPeople: Math.max(1, parseInt(e.target.value, 10) || 1),
                  }))
                }
                className="mt-1 bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                required
              />
            </div>
            <div>
              <Label
                htmlFor="maxPeople"
                className="font-medium text-slate-700 dark:text-slate-300"
              >
                最多人數 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxPeople"
                name="maxPeople"
                type="number"
                min={formData.minPeople}
                value={formData.maxPeople}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxPeople: Math.max(
                      formData.minPeople,
                      parseInt(e.target.value, 10) || formData.minPeople
                    ),
                  }))
                }
                className="mt-1 bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                required
              />
            </div>
          </div>

          {/* 費用 */}
          <div>
            <Label
              htmlFor="price"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              費用 (每人 TWD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: Math.max(0, parseFloat(e.target.value) || 0),
                }))
              }
              className="mt-1 bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>

          {/* 歡迎新手 */}
          <div className="flex items-center space-x-3 pt-2">
            <Switch
              id="allowNewbie"
              checked={formData.allowNewbie}
              onCheckedChange={(checked) =>
                handleSwitchChange('allowNewbie', checked)
              }
              className="data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-slate-200 dark:data-[state=checked]:bg-sky-600 dark:data-[state=unchecked]:bg-slate-600"
            />
            <Label
              htmlFor="allowNewbie"
              className="font-medium text-slate-700 dark:text-slate-300 cursor-none"
            >
              歡迎新手參加
            </Label>
          </div>

          {/* 活動描述 */}
          <div>
            <Label
              htmlFor="description"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              活動描述 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="請詳細描述您的活動內容、行程、注意事項、費用包含項目等..."
              className="mt-1 min-h-[120px] bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>

          {/* 封面圖片 */}
          <div>
            <Label
              htmlFor="cover"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              封面圖片 (建議比例 16:9)
            </Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) =>
                e.currentTarget.classList.add(
                  'border-sky-400',
                  'bg-sky-50',
                  'dark:bg-sky-900/30'
                )
              }
              onDragLeave={(e) =>
                e.currentTarget.classList.remove(
                  'border-sky-400',
                  'bg-sky-50',
                  'dark:bg-sky-900/30'
                )
              }
              className="mt-1 flex h-60 cursor-none flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30 hover:border-sky-500 dark:hover:border-sky-600 transition-colors"
            >
              {coverPreview ? (
                <div className="relative w-full h-full group">
                  <Image
                    width={400} // 你預估的一個寬
                    height={240} // 依比例算出高
                    src={coverPreview}
                    alt="封面預覽"
                    className="h-full w-full object-contain rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                    onClick={clearCoverImage} // 確保事件被正確傳遞
                  >
                    <span className="text-lg">✕</span>
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-5xl text-slate-400 dark:text-slate-500">
                    🖼️
                  </span>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    拖曳圖片到此，或{' '}
                    <span className="font-semibold text-sky-600 dark:text-sky-500">
                      點擊上傳
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    PNG, JPG, GIF (最大 5MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="cover"
                name="coverFile" // 注意：這裡的 name 不會直接被 formData 收集，我們透過 coverFile state 管理
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 pt-8">
          {/* 提交按鈕由父組件的步驟邏輯控制，這裡只顯示一個通用的提交按鈕 */}
          {/* 在實際的多步驟表單中，這個按鈕可能被 "下一步" 或 "上一步" 取代 */}
          {/* 為了通用性，我們假設父組件會處理按鈕的顯示和提交邏輯 */}
          {/* 如果 GroupForm 只用於單步驟提交，則可以保留這個按鈕 */}
        </CardFooter>
      </Card>
    </form>
  );
}
