'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import GroupForm from '../_components/group-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart'; // 確保你已經引入 useCart

const STEPS_CONFIG = [
  { id: 'step1', name: '步驟 1', description: '基本資訊' },
  { id: 'step2', name: '步驟 2', description: '預覽與發佈' },
];

const DEFAULT_CREATE_VALUES = {
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
  coverFile: null, // 用於 GroupForm 的 File Object
  id: 0, // 標識為新創建，後端不需要
  coverPreview: '', // 用於即時預覽
};

// 水平步驟條組件 (內容與你提供的一致)
const HorizontalStepper = ({ steps, currentStepId, setCurrentStep }) => {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);
  return (
    <nav aria-label="Progress" className="mb-10">
      <ol className="flex items-start">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={`relative flex-1 ${stepIdx < steps.length - 1 ? 'pr-8 sm:pr-12' : ''}`}
          >
            <button
              type="button"
              onClick={() =>
                stepIdx <= currentStepIndex && setCurrentStep(step.id)
              }
              className={`flex flex-col items-center text-center group w-full ${stepIdx <= currentStepIndex ? 'cursor-pointer' : 'cursor-default'}`}
              disabled={stepIdx > currentStepIndex}
            >
              <span
                className={`relative flex h-10 w-10 items-center justify-center rounded-full ${stepIdx === currentStepIndex ? 'bg-primary border-2 border-primary text-primary-foreground' : stepIdx < currentStepIndex ? 'bg-primary text-primary-foreground' : 'border-2 border-border bg-card dark:border-border-dark dark:bg-card-dark text-muted-foreground dark:text-muted-foreground-dark'}`}
              >
                {stepIdx < currentStepIndex ? '✓' : stepIdx + 1}
              </span>
              <span
                className={`mt-2 block text-xs sm:text-sm font-medium ${stepIdx <= currentStepIndex ? 'text-primary' : 'text-muted-foreground dark:text-muted-foreground-dark'}`}
              >
                {step.name}
              </span>
              <span
                className={`text-xs ${stepIdx <= currentStepIndex ? 'text-primary/80' : 'text-muted-foreground/80 dark:text-muted-foreground-dark/80'} hidden sm:block`}
              >
                {step.description}
              </span>
            </button>
            {stepIdx < steps.length - 1 ? (
              <div
                className={`absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 ${stepIdx < currentStepIndex ? 'bg-primary' : 'bg-border dark:bg-border-dark'}`}
                style={{
                  transform:
                    'translateX(calc(50% + var(--stepper-icon-radius, 1.25rem) / 2 + var(--stepper-gap, 0.5rem)))',
                  width:
                    'calc(100% - var(--stepper-icon-radius, 1.25rem) - 2 * var(--stepper-gap, 0.5rem))',
                }}
                aria-hidden="true"
              />
            ) : null}
          </li>
        ))}
      </ol>
      <style jsx>{`
        li {
          --stepper-icon-radius: 2.5rem;
          --stepper-gap: 0.5rem;
        }
        @media (min-width: 640px) {
          li {
            --stepper-gap: 1.5rem;
          }
        }
      `}</style>
    </nav>
  );
};

// 即時預覽卡片組件 (內容與你提供的一致，略作調整以確保圖片錯誤處理)
const LivePreviewCard = ({
  formData,
  typeOptions,
  locationOptions,
  coverPreview,
}) => {
  const {
    title,
    type,
    startDate,
    endDate,
    locationId,
    customLocation,
    difficulty,
    minPeople,
    maxPeople,
    price,
    allowNewbie,
    description,
  } = formData || {};

  const selectedTypeLabel = type
    ? typeOptions.find((opt) => opt.value === type)?.label || type
    : '未選擇';
  let locationDisplay = '未指定';
  if (type === '滑雪' && locationId) {
    locationDisplay =
      locationOptions.find((l) => String(l.id) === String(locationId))?.name ||
      '讀取中...';
  } else if (customLocation) {
    locationDisplay = customLocation;
  }
  const skiDifficultyOptionsPreview = [
    { value: '初級', label: '初級' },
    { value: '中級', label: '中級' },
    { value: '進階', label: '進階' },
  ];
  const difficultyDisplay = difficulty
    ? skiDifficultyOptionsPreview.find((opt) => opt.value === difficulty)
        ?.label || difficulty
    : '';

  return (
    <Card className="shadow-lg bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark border border-border dark:border-border-dark">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">即時預覽</CardTitle>
      </CardHeader>
      <CardContent>
        {coverPreview ? (
          <Image
            width={600}
            height={400}
            src={coverPreview}
            alt="封面預覽"
            className="w-full h-48 object-cover rounded-md mb-4 bg-muted dark:bg-muted-dark border border-border dark:border-border-dark"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://placehold.co/600x400/E2E8F0/A0AEC0?text=圖片預覽失敗';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-muted dark:bg-muted-dark rounded-md mb-4 flex flex-col items-center justify-center text-muted-foreground dark:text-muted-foreground-dark border border-dashed border-border dark:border-border-dark">
            <span className="text-3xl">🖼️</span>
            <p className="mt-2 text-sm">封面圖片預覽</p>
          </div>
        )}
        <h3 className="text-xl font-bold mb-2 truncate">
          {title || '您的揪團標題'}
        </h3>
        <div className="space-y-1.5 text-sm text-muted-foreground dark:text-muted-foreground-dark">
          <p>
            <span className="font-medium text-foreground dark:text-foreground-dark">
              類型：
            </span>
            {selectedTypeLabel}
          </p>
          <p>
            <span className="font-medium text-foreground dark:text-foreground-dark">
              日期：
            </span>
            {startDate || '開始日期'} ~ {endDate || '結束日期'}
          </p>
          <p>
            <span className="font-medium text-foreground dark:text-foreground-dark">
              地點：
            </span>
            {locationDisplay}
          </p>
          {type === '滑雪' && difficultyDisplay && (
            <p>
              <span className="font-medium text-foreground dark:text-foreground-dark">
                難度：
              </span>
              {difficultyDisplay}
            </p>
          )}
          <p>
            <span className="font-medium text-foreground dark:text-foreground-dark">
              人數：
            </span>
            {minPeople || 'N'} - {maxPeople || 'N'} 人
          </p>
          <p>
            <span className="font-medium text-foreground dark:text-foreground-dark">
              費用：
            </span>
            NT$ {price || '0'} / 每人
          </p>
          <p>
            <span className="font-medium text-foreground dark:text-foreground-dark">
              歡迎新手：
            </span>
            {allowNewbie ? '是' : '否'}
          </p>
          {description && (
            <div className="mt-2 pt-2 border-t border-border dark:border-border-dark">
              <p className="font-medium text-foreground dark:text-foreground-dark">
                描述：
              </p>
              <p className="whitespace-pre-wrap break-words h-16 overflow-y-auto">
                {description}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function CreateGroupPageWithAuth() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';
  const {
    user: authUser,
    isAuth,
    isLoading: authIsLoading,
    didAuthMount,
  } = useAuth();
  const { onAdd } = useCart(); // 從 useCart hook 獲取 onAdd 方法

  const [currentStep, setCurrentStep] = useState('step1');
  const [typeOptions, setTypeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [previewFormData, setPreviewFormData] = useState(DEFAULT_CREATE_VALUES);
  const [previewCover, setPreviewCover] = useState('');

  useEffect(() => {
    async function loadTypes() {
      try {
        const res = await fetch(`${API_BASE}/api/group?onlyTypes=true`);
        if (!res.ok) throw new Error('無法獲取活動類型');
        const labels = await res.json();
        const opts = labels.map((label) => ({ value: label, label: label }));
        setTypeOptions(opts);
        // 確保在類型選項載入後，如果表單中尚未選擇類型，則設定一個預設類型
        if (opts.length > 0 && !previewFormData.type) {
          setPreviewFormData((prev) => ({ ...prev, type: opts[0].value }));
        }
      } catch (err) {
        console.error('Error loading types:', err);
        setFormError('無法載入活動類型');
      }
    }
    loadTypes();
  }, [API_BASE]); // 移除 previewFormData.type 作為依賴，除非你有特定理由在類型改變時重新載入所有類型

  useEffect(() => {
    if (previewFormData.type !== '滑雪') {
      setLocationOptions([]);
      setPreviewFormData((prev) => ({ ...prev, locationId: '' })); // 清除已選的滑雪場
      return;
    }
    async function loadLocations() {
      try {
        const res = await fetch(`${API_BASE}/api/location`);
        if (!res.ok) throw new Error('無法獲取滑雪場列表');
        setLocationOptions((await res.json()) || []);
      } catch (err) {
        console.error('Error loading locations:', err);
        setFormError('無法載入滑雪場地點');
      }
    }
    loadLocations();
  }, [previewFormData.type, API_BASE]);

  const handleFormChange = useCallback(
    (formDataFromChild, coverPreviewFromChild) => {
      setPreviewFormData(formDataFromChild);
      if (coverPreviewFromChild !== undefined) {
        setPreviewCover(coverPreviewFromChild);
      }
    },
    []
  );

  const validateStep1 = useCallback((formData) => {
    setFormError('');
    if (!formData.type) {
      setFormError('請選擇活動類型');
      return false;
    }
    if (!formData.title?.trim()) {
      setFormError('請輸入揪團標題');
      return false;
    }
    // **確保圖片已上傳**
    if (!formData.coverFile) {
      setFormError('請上傳封面圖片');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      setFormError('請選擇活動日期');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setFormError('開始日期不能晚於結束日期');
      return false;
    }
    if (formData.type === '滑雪' && !formData.locationId) {
      setFormError('滑雪活動請選擇滑雪場');
      return false;
    }
    if (formData.type !== '滑雪' && !formData.customLocation?.trim()) {
      setFormError('此類型活動請輸入地點');
      return false;
    }
    if (
      Number(formData.minPeople) < 1 ||
      Number(formData.maxPeople) < 1 ||
      Number(formData.minPeople) > Number(formData.maxPeople)
    ) {
      setFormError(
        '請輸入有效的人數範圍 (最少1人，且最少人數不能超過最多人數)'
      );
      return false;
    }
    if (Number(formData.price) < 0) {
      setFormError('費用不能為負數');
      return false;
    }
    if (!formData.description?.trim()) {
      setFormError('請填寫活動描述');
      return false;
    }
    return true;
  }, []);

  const handleNextStep = () => {
    if (validateStep1(previewFormData)) {
      setCurrentStep('step2');
      window.scrollTo(0, 0);
    }
  };
  const handlePrevStep = () => {
    setCurrentStep('step1');
    window.scrollTo(0, 0);
  };

  const handleFinalSubmit = async () => {
    if (!validateStep1(previewFormData)) {
      if (currentStep === 'step2') {
        setCurrentStep('step1');
      }
      return;
    }
    if (!isAuth) {
      setFormError('請先登入才能建立揪團。');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    const formDataToSend = new FormData();

    Object.keys(previewFormData).forEach((key) => {
      const value = previewFormData[key];
      if (key === 'coverFile' && value instanceof File) {
        formDataToSend.append('cover', value);
      } else if (key === 'startDate' || key === 'endDate') {
        if (
          value &&
          typeof value === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
          formDataToSend.append(
            key === 'startDate' ? 'start_date' : 'end_date',
            value
          );
        } else if (value instanceof Date && !isNaN(value)) {
          const year = value.getFullYear();
          const month = (value.getMonth() + 1).toString().padStart(2, '0');
          const day = value.getDate().toString().padStart(2, '0');
          formDataToSend.append(
            key === 'startDate' ? 'start_date' : 'end_date',
            `${year}-${month}-${day}`
          );
        }
      } else if (key === 'locationId' && previewFormData.type === '滑雪') {
        if (value) formDataToSend.append('location', String(value));
      } else if (key === 'customLocation' && previewFormData.type !== '滑雪') {
        if (value) formDataToSend.append('customLocation', value);
      } else if (
        key === 'minPeople' ||
        key === 'maxPeople' ||
        key === 'price'
      ) {
        formDataToSend.append(
          key === 'minPeople'
            ? 'min_people'
            : key === 'maxPeople'
              ? 'max_people'
              : key,
          String(value)
        );
      } else if (key === 'allowNewbie') {
        formDataToSend.append('allow_newbie', value ? '1' : '0');
      } else if (
        key !== 'id' &&
        key !== 'coverPreview' &&
        value !== null &&
        value !== undefined &&
        typeof value !== 'object'
      ) {
        formDataToSend.append(key, value);
      }
    });

    try {
      const res = await fetch(`${API_BASE}/api/group`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: '建立揪團時發生未知錯誤' }));
        throw new Error(errorData.error || `伺服器錯誤 (${res.status})`);
      }

      const responseData = await res.json(); // 後端應回傳包含 groupMemberId 的完整揪團資訊
      console.log(responseData);
      // **關鍵：檢查後端是否回傳了 groupMemberId**
      if (responseData && responseData.id && responseData.groupMemberId) {
        const imageUrlForCart =
          responseData.images?.[0]?.imageUrl || '/default-group-image.png'; // 提供預設圖片

        // **使用後端回傳的 groupMemberId 加入購物車**
        onAdd('CartGroup', {
          id: responseData.groupMemberId, // 使用開團者在 group_member 表中的 ID
          price: responseData.price,
          title: responseData.title,
          imageUrl: imageUrlForCart,
          startDate: responseData.startDate, // 確保後端回傳這些
          endDate: responseData.endDate, // 確保後端回傳這些
          groupId: responseData.id, // 原始揪團 ID
        });
        
        alert('揪團建立成功！您的參與資格已加入購物車，請完成付款。');
        console.log(`揪團建立成功，已加入購物車：`, responseData);
        router.push(`/groups/${responseData.id}`); // 導向新揪團的詳細頁面
      } else {
        // 如果後端沒有回傳 groupMemberId，表示後端邏輯可能有問題，或回傳格式不符預期
        console.error(
          '後端 API 回應中缺少揪團 ID 或開團者成員 ID (groupMemberId):',
          responseData
        );
        setFormError(
          '建立揪團成功，但加入購物車資訊不完整。請檢查您的揪團或聯繫客服。'
        );
        // 即使加入購物車流程出錯，揪團本身可能已建立，仍嘗試導向
        if (responseData && responseData.id) {
          router.push(`/groups/${responseData.id}`);
        } else {
          router.push('/groups');
        }
      }
    } catch (err) {
      console.error('建立揪團失敗:', err);
      setFormError(`建立失敗：${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialFormValuesForCreate = useMemo(() => {
    return {
      ...DEFAULT_CREATE_VALUES,
      type: typeOptions[0]?.value || DEFAULT_CREATE_VALUES.type,
    };
  }, [typeOptions]);

  // --- Loading 和 Auth 檢查 UI (保持不變) ---
  if (authIsLoading || !didAuthMount) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
        <svg
          className="animate-spin -ml-1 mr-3 h-8 w-8 text-sky-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        身份驗證中...
      </div>
    );
  }
  if (!isAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              請先登入
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              您需要登入才能建立揪團。
            </p>
            <Button
              onClick={() => router.push('/auth/login')}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              前往登入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 主要 JSX 結構 (保持不變) ---
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 py-8 px-4">
      <div className="max-w-screen-2xl mx-auto">
        <HorizontalStepper
          steps={STEPS_CONFIG}
          currentStepId={currentStep}
          setCurrentStep={setCurrentStep}
        />
        {formError && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500 text-red-700 dark:text-red-200 rounded-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <span role="img" aria-label="error-icon" className="text-xl">
                  ⚠️
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">發生錯誤</h3>
                <div className="mt-1 text-sm">
                  <p>{formError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="lg:flex lg:gap-8 xl:gap-12">
          <div className="lg:w-7/12 xl:w-2/3">
            {currentStep === 'step1' && (
              <GroupForm
                initialValues={initialFormValuesForCreate}
                onSubmit={() => {}}
                isLoading={isSubmitting}
                typeOptions={typeOptions}
                locationOptions={locationOptions}
                formError={formError}
                setFormError={setFormError}
                onFormDataChange={handleFormChange}
                isEditMode={false}
              />
            )}
            {currentStep === 'step2' && (
              <Card className="shadow-xl bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark border border-border dark:border-border-dark">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    確認揪團資訊
                  </CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-muted-foreground-dark">
                    請仔細核對以下資訊，確認無誤後即可發佈揪團！
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-secondary-foreground dark:text-secondary-foreground-dark">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <p>
                      <strong>活動類型：</strong>
                      {typeOptions.find(
                        (opt) => opt.value === previewFormData.type
                      )?.label ||
                        previewFormData.type ||
                        '未選擇'}
                    </p>
                    <p>
                      <strong>揪團標題：</strong>
                      {previewFormData.title || '未填寫'}
                    </p>
                    <p>
                      <strong>開始日期：</strong>
                      {previewFormData.startDate || '未填寫'}
                    </p>
                    <p>
                      <strong>結束日期：</strong>
                      {previewFormData.endDate || '未填寫'}
                    </p>
                    <p className="md:col-span-2">
                      <strong>活動地點：</strong>
                      {previewFormData.type === '滑雪'
                        ? locationOptions.find(
                            (l) =>
                              String(l.id) ===
                              String(previewFormData.locationId)
                          )?.name || '未選擇滑雪場'
                        : previewFormData.customLocation || '未填寫自訂地點'}
                    </p>
                    {previewFormData.type === '滑雪' &&
                      previewFormData.difficulty && (
                        <p>
                          <strong>滑雪難易度：</strong>
                          {previewFormData.difficulty || '未指定'}
                        </p>
                      )}
                    <p>
                      <strong>最少人數：</strong>
                      {previewFormData.minPeople} 人
                    </p>
                    <p>
                      <strong>最多人數：</strong>
                      {previewFormData.maxPeople} 人
                    </p>
                    <p className="md:col-span-2">
                      <strong>預估費用：</strong>NT$ {previewFormData.price} /
                      每人
                    </p>
                    <p className="md:col-span-2">
                      <strong>歡迎新手：</strong>
                      {previewFormData.allowNewbie ? '是' : '否'}
                    </p>
                  </div>
                  {previewCover && (
                    <div className="mt-4">
                      <p className="font-medium">
                        <strong>封面圖片預覽：</strong>
                      </p>
                      <Image
                        width={400}
                        height={240}
                        src={previewCover}
                        alt="已選封面預覽"
                        className="w-full max-w-sm h-auto object-cover rounded-md mt-1 border border-border dark:border-border-dark"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://placehold.co/400x240/E2E8F0/A0AEC0?text=圖片預覽失敗';
                        }}
                      />
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t border-border dark:border-border-dark">
                    <p className="font-medium">
                      <strong>活動描述：</strong>
                    </p>
                    <p className="whitespace-pre-wrap break-words pl-1 mt-1 bg-muted dark:bg-muted-dark p-3 rounded-md min-h-[60px]">
                      {previewFormData.description || '無描述內容'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="mt-8 flex justify-end space-x-4">
              {currentStep === 'step1' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/groups')}
                    type="button"
                  >
                    放棄
                  </Button>
                  <Button onClick={handleNextStep} type="button">
                    下一步 <span aria-hidden="true">→</span>
                  </Button>
                </>
              )}
              {currentStep === 'step2' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    type="button"
                    disabled={isSubmitting}
                  >
                    <span aria-hidden="true">←</span> 上一步
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    type="button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '發佈中...' : '確認發佈'}
                  </Button>
                </>
              )}
            </div>
          </div>
          <aside className="hidden lg:block lg:w-5/12 xl:w-1/3 mt-10 lg:mt-0">
            <div className="space-y-6 sticky top-10">
              <LivePreviewCard
                formData={previewFormData}
                typeOptions={typeOptions}
                locationOptions={locationOptions}
                coverPreview={previewCover}
              />
              {currentStep === 'step2' && (
                <Card className="shadow-lg bg-card text-card-foreground dark:bg-card-dark dark:text-card-foreground-dark border border-border dark:border-border-dark">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center text-primary">
                      <span className="text-xl mr-2">💡</span> 發佈後小提醒
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground dark:text-muted-foreground-dark space-y-2">
                    <p>✓ 揪團發佈後，您可以在「我的揪團」頁面管理。</p>
                    <p>✓ 記得將揪團連結分享給朋友或相關社群！</p>
                    <p>✓ 留意系統通知，即時掌握報名與留言互動。</p>
                  </CardContent>
                </Card>
              )}
              <Card className="bg-destructive/10 border-destructive/30 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center text-destructive">
                    <span className="text-xl mr-2">⚠️</span> 注意事項
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-destructive/80 space-y-1">
                  <p>• 請確保揪團資訊真實、準確，避免誤導。</p>
                  <p>• 禁止發佈任何違反平台社群守則的內容。</p>
                  <p>• 揪團涉及費用時，請明確說明收退款規則。</p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
