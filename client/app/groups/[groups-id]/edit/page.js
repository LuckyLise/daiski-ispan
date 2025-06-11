// 檔案路徑: app/groups/[groups-id]/edit/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import GroupForm from '../../_components/group-form.js'; // 引入我們共用的表單元件
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'; // 引入 Card 相關元件
import { useAuth } from '@/hooks/use-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';

export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params['groups-id']; // 從 URL 獲取揪團 ID
  const {
    user: authUser,
    isAuth,
    isLoading: authIsLoading,
    didAuthMount,
  } = useAuth(); // <--- 2. 獲取驗證狀態
  useEffect(() => {
    console.log('[EditPage] useAuth - didAuthMount:', didAuthMount);
    console.log('[EditPage] useAuth - authIsLoading:', authIsLoading);
    console.log('[EditPage] useAuth - isAuth:', isAuth);
    console.log('[EditPage] useAuth - authUser:', authUser);
  }, [didAuthMount, authIsLoading, isAuth, authUser]);
  const [initialData, setInitialData] = useState(null); // 存放從 API 獲取的揪團初始資料
  const [isLoading, setIsLoading] = useState(true); // 頁面或表單提交的載入狀態
  const [isSubmitting, setIsSubmitting] = useState(false); // 表單提交的載入狀態
  const [formError, setFormError] = useState(''); // 表單錯誤訊息

  // 表單選項的狀態
  const [typeOptions, setTypeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  // 用於觸發地點選項重新載入的狀態 (當活動類型改變時)
  const [currentTypeForLocation, setCurrentTypeForLocation] = useState('');

  // 1. 載入活動類型選項 (與創建頁面邏輯相似)
  useEffect(() => {
    async function loadTypes() {
      try {
        const res = await fetch(`${API_BASE}/api/group?onlyTypes=true`);
        if (!res.ok) {
          const errData = await res
            .json()
            .catch(() => ({ error: '無法獲取活動類型 (回應非JSON)' }));
          throw new Error(errData.error || `請求失敗: ${res.status}`);
        }
        const labels = await res.json();
        const opts = labels.map((label) => ({ value: label, label: label }));
        setTypeOptions(opts);
      } catch (err) {
        console.error('編輯頁面 - 載入類型失敗:', err);
        setFormError(`無法載入活動類型選項：${err.message}`);
      }
    }
    loadTypes();
  }, [API_BASE]);

  // 2. 根據 groupId 載入現有揪團的資料
  useEffect(() => {
    if (!groupId) {
      setFormError('無效的揪團 ID。');
      setIsLoading(false);
      return;
    }
    // 確保 useAuth 的 didAuthMount 完成後再執行，避免在 isAuth 狀態未確定前就操作
    if (!didAuthMount) return;

    // 如果未登入，則不嘗試獲取揪團資料進行編輯
    if (!isAuth && didAuthMount) {
      setFormError('請先登入才能編輯揪團。');
      setIsLoading(false);
      // 可以考慮導向到登入頁面
      // router.push('/login'); // 假設登入頁路徑
      return;
    }
    setIsLoading(true);
    async function fetchGroupDetails() {
      try {
        const res = await fetch(`${API_BASE}/api/group/${groupId}`);
        if (!res.ok) {
          const errData = await res
            .json()
            .catch(() => ({ error: '無法解析伺服器回應' }));
          throw new Error(
            errData.error || `無法獲取揪團資料 (狀態 ${res.status})`
          );
        }
        const data = await res.json();

        // 轉換後端資料格式以匹配 GroupForm 的 initialValues
        // 並設定 coverPreview
        const formattedData = {
          ...data,
          // 後端回傳的 creator 物件可能叫做 user 或 creator
          // GroupForm 內部目前沒有直接使用 organizerId，但如果需要可以加入
          id: data.id, // 確保 ID 被傳遞，GroupForm 會用它來判斷是編輯還是創建模式
          type: data.type || '',
          title: data.title || '',
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().split('T')[0]
            : '',
          endDate: data.endDate
            ? new Date(data.endDate).toISOString().split('T')[0]
            : '',
          locationId: data.locationId ? String(data.locationId) : '',
          customLocation: data.customLocation || '',
          difficulty: data.ActivityType || '',
          minPeople: data.minPeople || 2,
          maxPeople: data.maxPeople || 10,
          price: data.price || 0,
          allowNewbie:
            data.allowNewbie === undefined ? true : Boolean(data.allowNewbie),
          description: data.description || '',
          coverFile: null, // 編輯時，coverFile 初始為 null，除非用戶選擇新檔案
          // 處理封面圖片預覽
          coverPreview:
            data.images && data.images.length > 0 && data.images[0].imageUrl
              ? data.images[0].imageUrl.startsWith('http')
                ? data.images[0].imageUrl
                : `${API_BASE}${data.images[0].imageUrl}`
              : data.cover_image // 假設後端列表也可能回傳 cover_image
                ? data.cover_image.startsWith('http')
                  ? data.cover_image
                  : `${API_BASE}${data.cover_image}`
                : '',
        };
        // **權限預先檢查 (可選，但建議)**
        // 雖然最終權限由後端決定，但前端可以做初步判斷以改善使用者體驗
        if (
          isAuth &&
          authUser &&
          data.organizerId !== undefined &&
          data.organizerId !== authUser.id
        ) {
          setFormError('您沒有權限編輯此揪團 (前端檢查)。');
          setInitialData(null); // 清空資料，不讓表單顯示
        } else {
          setInitialData(formattedData);
          setCurrentTypeForLocation(formattedData.type);
          setFormError('');
        }
      } catch (err) {
        console.error('編輯頁面 - 獲取揪團詳情失敗:', err);
        setFormError(`獲取揪團資料失敗：${err.message}`);
        setInitialData(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGroupDetails();
  }, [groupId, API_BASE, isAuth, authUser, didAuthMount]); // 加入 isAuth, authUser, didAuthMount 作為依賴

  // 3. 載入滑雪場地點選項 (當 currentTypeForLocation 為 '滑雪' 時)
  useEffect(() => {
    if (currentTypeForLocation !== '滑雪') {
      setLocationOptions([]); // 如果不是滑雪類型，清空地點選項
      return;
    }
    async function loadLocations() {
      try {
        const res = await fetch(`${API_BASE}/api/location`); // 假設這是獲取滑雪場列表的 API
        if (!res.ok) {
          const errData = await res
            .json()
            .catch(() => ({ error: '無法獲取滑雪場列表 (回應非JSON)' }));
          throw new Error(errData.error || `請求失敗: ${res.status}`);
        }
        const list = await res.json();
        setLocationOptions(list || []);
      } catch (err) {
        console.error('編輯頁面 - 載入滑雪場地點失敗:', err);
        setFormError(`無法載入滑雪場列表：${err.message}`);
      }
    }
    loadLocations();
  }, [currentTypeForLocation, API_BASE]);

  // 處理表單提交 (更新揪團)
  const handleEditSubmit = async (formDataFromComponent) => {
    if (!groupId) {
      setFormError('無法更新：缺少揪團 ID。');
      return;
    }
    // 基本前端驗證 (可以做得更完整)
    if (
      !formDataFromComponent.type ||
      !formDataFromComponent.title ||
      !formDataFromComponent.startDate ||
      !formDataFromComponent.endDate
    ) {
      setFormError('請填寫所有必填欄位 (*)。');
      return;
    }
    if (
      new Date(formDataFromComponent.startDate) >
      new Date(formDataFromComponent.endDate)
    ) {
      setFormError('開始日期不能晚於結束日期。');
      return;
    }

    setIsLoading(true);
    setFormError('');

    const formDataToSend = new FormData();
    // 根據 GroupForm 返回的 formDataFromComponent 組裝要發送到後端的 FormData
    // 注意：欄位名稱需要與後端 API (PUT /api/group/:groupId) 期望的一致
    formDataToSend.append('type', formDataFromComponent.type);
    formDataToSend.append('title', formDataFromComponent.title);
    formDataToSend.append('start_date', formDataFromComponent.startDate); // 後端期望 start_date
    formDataToSend.append('end_date', formDataFromComponent.endDate); // 後端期望 end_date

    if (formDataFromComponent.type === '滑雪') {
      if (formDataFromComponent.locationId) {
        formDataToSend.append('location', formDataFromComponent.locationId); // 後端期望 location 作為 ID
      }
      if (formDataFromComponent.difficulty) {
        formDataToSend.append('difficulty', formDataFromComponent.difficulty);
      }
    } else {
      if (formDataFromComponent.customLocation) {
        formDataToSend.append(
          'customLocation',
          formDataFromComponent.customLocation
        );
      }
    }
    formDataToSend.append(
      'min_people',
      String(formDataFromComponent.minPeople)
    ); // 後端期望 min_people
    formDataToSend.append(
      'max_people',
      String(formDataFromComponent.maxPeople)
    ); // 後端期望 max_people
    formDataToSend.append('price', String(formDataFromComponent.price));
    formDataToSend.append(
      'allow_newbie',
      formDataFromComponent.allowNewbie ? '1' : '0'
    );
    formDataToSend.append('description', formDataFromComponent.description);

    if (formDataFromComponent.coverFile instanceof File) {
      formDataToSend.append('cover', formDataFromComponent.coverFile); // 後端期望 'cover' 作為檔案欄位名
    }
    // 注意：organizerId 通常不由前端在編輯時提交，後端應通過身份驗證來確認操作者權限

    let responseStatus = null;
    try {
      const res = await fetch(`${API_BASE}/api/group/${groupId}`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include',
      });
      responseStatus = res.status;

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          console.error('無法解析伺服器錯誤回應:', parseError);
          throw new Error(
            `伺服器錯誤 (狀態 ${responseStatus})，且無法解析回應內容。`
          );
        }
        throw new Error(
          errorData?.error || `伺服器錯誤 (狀態 ${responseStatus})。`
        );
      }
      alert('揪團更新成功！');
      router.push(`/groups/${groupId}`);
      router.refresh();
    } catch (err) {
      console.error('更新揪團失敗:', err);
      setFormError(`更新失敗：${err.message}`);
    } finally {
      setIsSubmitting(false); // 完成提交後，設定為非提交中
    }
  };

  // 當 GroupForm 內部資料變化時的回呼
  const handleFormChangeForEdit = useCallback(
    (formDataFromComponent) => {
      if (formDataFromComponent.type !== currentTypeForLocation) {
        setCurrentTypeForLocation(formDataFromComponent.type);
      }
    },
    [currentTypeForLocation]
  );

  // --- 渲染邏輯 ---
  if (authIsLoading || (isLoading && !initialData && !formError)) {
    // 初始載入 auth 或頁面資料時
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
        載入中...
      </div>
    );
  }

  // 如果 useAuth 完成掛載但未登入，或者初始資料載入失敗
  if (didAuthMount && !isAuth) {
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
              您需要登入才能編輯揪團。
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              前往登入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialData && !isLoading) {
    // 確保不是仍在載入中
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              錯誤
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              {formError || '找不到指定的揪團資料，或載入時發生錯誤。'}
            </p>
            <Button
              onClick={() => router.push('/groups')}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              返回揪團列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-screen-lg mx-auto">
        {formError && !isSubmitting && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500/70 text-red-700 dark:text-red-200 rounded-md shadow-sm"
          >
            {/* ... (錯誤訊息顯示) ... */}
            <div className="flex">
              <div className="flex-shrink-0">
                <span role="img" aria-label="錯誤圖示" className="text-xl">
                  ⚠️
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">操作時發生錯誤</h3>
                <div className="mt-1 text-sm">
                  <p>{formError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 只有在 initialData 存在時才渲染表單 */}
        {initialData && (
          <GroupForm
            initialValues={initialData}
            onSubmit={handleEditSubmit}
            isLoading={isSubmitting} // 表單提交的載入狀態
            submitButtonText="儲存變更"
            typeOptions={typeOptions}
            locationOptions={locationOptions}
            formError={formError}
            setFormError={setFormError}
            onFormDataChange={handleFormChangeForEdit}
          />
        )}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => router.push(`/groups/${groupId}`)}
            className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-6 py-2"
            disabled={isSubmitting}
          >
            取消編輯
          </Button>
        </div>
      </div>
    </main>
  );
}
