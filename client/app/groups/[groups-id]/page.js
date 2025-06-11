// app/groups/[groups-id]/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
// 引入子組件
import GroupBreadCrumb from './_components/bread-crumb';
import GroupMainInfoCard from './_components/group-info';
import OrganizerIntroduction from './_components/organizer-introduction';
import ActivityDescription from './_components/activity-description';
import CommentSection from './_components/comment-section';
import MobileStickyButtons from './_components/sticky-buttons';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';

export default function GroupDetailPage() {
  const { onAdd } = useCart();
  const params = useParams();
  const groupId = params['groups-id'];
  const router = useRouter();

  const { user: currentUser, isAuth, isLoading: isAuthLoading } = useAuth(); // 使用 useAuth hook

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState('計算中...'); // Initial state for countdown
  const [progressWidth, setProgressWidth] = useState('0%');

  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isClient, setIsClient] = useState(false);
  // --- 「我要參加」功能相關狀態 ---
  const [isJoining, setIsJoining] = useState(false); // 是否正在處理加入請求
  const [joinError, setJoinError] = useState(''); // 加入失敗的錯誤訊息
  const [joinSuccess, setJoinSuccess] = useState(''); // 加入成功的訊息
  const [isAlreadyMember, setIsAlreadyMember] = useState(false); // 當前使用者是否已是成員
  const [currentMemberCount, setCurrentMemberCount] = useState(0); // 目前參加人數，用於判斷是否已滿+
  const [hasPaidForThisGroup, setHasPaidForThisGroup] = useState(false);

  const [calendarButtonLoaded, setCalendarButtonLoaded] = useState(false);
  useEffect(() => {
    setIsClient(true);
    // 動態引入 add-to-calendar-button
    if (typeof window !== 'undefined') {
      import('add-to-calendar-button')
        .then(() => {
          setCalendarButtonLoaded(true);
          // console.log('add-to-calendar-button loaded'); // 開發時調試用
        })
        .catch((err) =>
          console.error('Failed to load add-to-calendar-button', err)
        );
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchGroupData = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      setError('無效的揪團 ID。');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/group/${groupId}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `無法獲取揪團資料 (狀態碼 ${response.status})`
        );
      }
      const data = await response.json();
      setGroup(data);
      if (currentUser && data.creator && data.creator.id === currentUser.id) {
        setIsOrganizer(true);
      } else {
        setIsOrganizer(false);
      }

      if (
        data &&
        typeof data.currentPeople === 'number' &&
        typeof data.maxPeople === 'number' &&
        data.maxPeople > 0
      ) {
        setProgressWidth(
          `${Math.min((data.currentPeople / data.maxPeople) * 100, 100)}%`
        );
      } else {
        setProgressWidth('0%');
      }
      if (isAuth && currentUser?.id && data?.id) {
        try {
          // 假設後端有一個 API /api/group/:groupId/member-status?userId=:userId
          // 或者在獲取揪團資料時，後端就一併檢查並返回 isCurrentUserMember 欄位
          // 為了簡化，我們先假設後端 /api/group/:groupId 回應中包含了成員列表，前端來判斷
          // 實際上，更好的做法是後端直接提供一個 boolean 值
          const member = data.members?.find(
            (m) => m.userId === currentUser.id && m.groupId === data.id
          );
          if (member) {
            setIsAlreadyMember(true);
            setHasPaidForThisGroup(!!member.paidAt);
          } else {
            setIsAlreadyMember(false);
            setHasPaidForThisGroup(false);
          }
        } catch (memberStatusError) {
          console.error('檢查成員狀態時發生錯誤:', memberStatusError);
          setIsAlreadyMember(false); // 出錯時假設未加入
        }
      } else {
        setIsAlreadyMember(false);
        setHasPaidForThisGroup(false); // 未登入則肯定未加入
      }
      setError('');
    } catch (err) {
      console.error('[主頁面] 獲取揪團或成員狀態時發生錯誤:', err);
      setError(err.message);
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [groupId, currentUser, isAuth]); // 依賴 currentUser 和 isAuth

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [fetchGroupData, groupId]);

  // 倒數計時的 useEffect - *** 修正處 ***
  useEffect(() => {
    if (!group) return;

    const deadline = group.registrationDeadline || group.startDate;
    if (!deadline) {
      setCountdown('未設定截止日期');
      return;
    }

    const deadlineTime = new Date(deadline).getTime();
    let intervalId = null; // 1. Initialize intervalId to null

    const updateTimer = () => {
      const now = Date.now();
      let diff = deadlineTime - now;

      if (diff <= 0) {
        setCountdown('報名已截止');
        if (intervalId) {
          // 2. Check if intervalId has been set before clearing
          clearInterval(intervalId);
          intervalId = null; // Optional: reset to null after clearing
        }
        return;
      }

      const d = String(Math.floor(diff / 86400000)).padStart(2, '0');
      const h = String(Math.floor((diff % 86400000) / 3600000)).padStart(
        2,
        '0'
      );
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setCountdown(`${d}天 ${h}時 ${m}分 ${s}秒`);
    };
    updateTimer();
    if (new Date().getTime() < deadlineTime) {
      intervalId = setInterval(updateTimer, 1000); // intervalId is assigned here
    } else {
      // If deadline already passed on component mount and was not caught by the first updateTimer call
      // (e.g. if updateTimer logic was slightly different), ensure countdown is "報名已截止"
      setCountdown('報名已截止');
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        // 3. Ensure intervalId is valid before clearing in cleanup
        clearInterval(intervalId);
      }
    };
  }, [group]); // Dependency array remains [group]

  const handleNewCommentPosted = useCallback((newComment) => {
    setGroup((prevGroup) => {
      if (!prevGroup) return null;
      const updatedComments = [newComment, ...(prevGroup.comments || [])];
      return { ...prevGroup, comments: updatedComments };
    });
  }, []);

  // --- 「我要參加」按鈕的處理函數 ---
  const handleJoinGroup = async () => {
    if (!isAuth || !currentUser?.id) {
      setJoinError('請先登入才能參加揪團！');
      alert('請先登入才能參加揪團！'); // 彈窗提示
      // router.push('/login'); // 或導向登入頁
      return;
    }
    if (!groupId || !group) {
      // 確保 group 物件存在，以便檢查人數上限
      setJoinError('無法確定要加入的揪團或揪團資訊不完整。');
      return;
    }
    if (isAlreadyMember) {
      // setJoinError('您已經是此揪團的成員了。'); // 可以用 alert 或其他方式提示
      alert('您已經是此揪團的成員了。');
      return;
    }
    // 檢查是否已達人數上限
    if (group.maxPeople && currentMemberCount >= group.maxPeople) {
      setJoinError('抱歉，此揪團人數已滿。');
      alert('抱歉，此揪團人數已滿。');
      return;
    }

    setIsJoining(true);
    setJoinError('');
    setJoinSuccess('');

    try {
      const response = await fetch(`${API_BASE}/api/group/${groupId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newMemberEntry = data.groupMemberId;
        setJoinSuccess(data.message || '成功加入揪團！');
        setIsAlreadyMember(true);
        // 成功加入後，更新參加人數 (前端樂觀更新，或重新獲取資料)
        setCurrentMemberCount((prevCount) => prevCount + 1);
        // 為了獲取最新的 group 資料 (例如 currentPeople)，可以重新呼叫
        // fetchGroupDataAndMemberStatus(); // 或者只更新部分UI
        // 顯示成功訊息
        // 加入購物車 byCart
        onAdd('CartGroup', {
          id: newMemberEntry,
          price: group.price,
          title: group.title,
          imageUrl: group.images[0].imageUrl,
          startDate: group.startDate,
          endDate: group.endDate,
        });
        alert(`已成功參加揪團！`);
      } else {
        setJoinError(data.message || `加入揪團失敗: ${response.status}`);
        alert(data.message || `加入揪團失敗: ${response.status}`);
      }
    } catch (error) {
      console.error('加入揪團請求失敗:', error);
      setJoinError('加入揪團時發生網路或客戶端錯誤，請稍後再試。');
      alert('加入揪團時發生網路或客戶端錯誤，請稍後再試。');
    } finally {
      setIsJoining(false);
    }
  };
  const handleJoinChat = () => {
    if (!isAuth || !currentUser?.id) {
      alert('請先登入才能使用聊天功能。');
      return;
    }
    // 建立一個變數來判斷是否為「已付款的成員」
    const isPaidMember = isAlreadyMember && hasPaidForThisGroup;

    // 如果「是開團者」或者「是已付款的成員」，則允許進入
    if (isOrganizer || isPaidMember) {
      // 在這裡放置進入聊天室的實際邏輯
      alert(`您已成功加入聊天室！`);
      // 例如: router.push(`/chat/${group.chatRoom.id}`);
    } else {
      // 如果不符合上述任一條件，則根據情況給出提示
      if (!isAlreadyMember || !hasPaidForThisGroup) {
        alert('請先參加此揪團才能進入聊天室。');
      } else {
        alert('您尚未完成付款，無法進入此揪團的聊天室。');
      }
    }
  };
  const handleEditGroup = () => router.push(`/groups/${groupId}/edit`);
  const handleDeleteGroup = async () => {
    if (
      window.confirm(
        `確定要刪除揪團 "${group?.title}" 嗎？此操作將標記為刪除。`
      )
    ) {
      try {
        const response = await fetch(`${API_BASE}/api/group/${groupId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || '刪除失敗');
        }
        alert('揪團已標記為刪除');
        router.push('/groups');
      } catch (error) {
        console.error('刪除揪團失敗:', error);
        alert(`刪除失敗: ${error.message}`);
      }
    }
  };

  if (loading && !group)
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-primary-800 text-xl bg-secondary-200">
        載入中…
      </div>
    );
  if (error && !group)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-destructive bg-secondary-200">
        <p className="mb-4 text-p-tw">錯誤：{error}</p>
        <Button
          onClick={() => router.push('/groups')}
          className="bg-primary-500 text-white hover:bg-primary-600 text-p-tw px-4 py-2 rounded-md"
        >
          回揪團列表
        </Button>
      </div>
    );
  if (!group && !loading)
    // If not loading and group is still null
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-secondary-800 bg-secondary-200">
        <p className="mb-4 text-p-tw">查無此揪團資料。</p>
        <Button
          onClick={() => router.push('/groups')}
          className="bg-primary-500 text-white hover:bg-primary-600 text-p-tw px-4 py-2 rounded-md"
        >
          回揪團列表
        </Button>
      </div>
    );

  // If group data exists, render the page
  if (!group) return null; // Should be caught by above conditions, but as a fallback
  // 格式化日期時間以符合 add-to-calendar-button 的要求
  const formatForCalendar = (dateString, isEndDate = false) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // 檢查日期是否有效
      console.warn('Invalid date string for calendar:', dateString);
      return '';
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // 假設活動有具體的開始和結束時間，如果沒有，則默認為一天的開始和結束
    // 你的 group 物件中似乎沒有 startTime 和 endTime 欄位，這裡我們假設全天
    // 對於全天事件，endDate 的處理方式可能因行事曆服務而異
    // 為了簡化，我們先假設開始時間為 00:00，結束時間為 23:59
    // 但 add-to-calendar-button 對全天事件的 endDate 處理可能需要是結束日的隔天 YYYY-MM-DD
    // 請務必參考 add-to-calendar-button 的文件
    let hours = '00';
    let minutes = '00';
    let seconds = '00';

    if (isEndDate) {
      hours = '23';
      minutes = '59';
      seconds = '59';
    }
    // 如果你的 group 物件中有 startTime/endTime，則使用它們
    // e.g., if (group.startTime && !isEndDate) { [hours, minutes] = group.startTime.split(':'); }
    // e.g., if (group.endTime && isEndDate) { [hours, minutes] = group.endTime.split(':'); }

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const eventName = group.title;
  const eventStartDate = formatForCalendar(group.startDate);
  const eventEndDate = formatForCalendar(group.endDate, true);
  const eventDescription = group.description || '';
  const eventLocation =
    (typeof group.location === 'string'
      ? group.location
      : group.location?.name) ||
    group.customLocation ||
    '';
  const PageLevelError = () =>
    error ? (
      <div className="w-full max-w-[1920px] mx-auto px-4 py-2 text-center bg-destructive/10 text-destructive border border-destructive rounded-md mb-4">
        <p>{error}</p>
      </div>
    ) : null;
  console.log(
    '[Render] isOrganizer:',
    isOrganizer,
    'isClient:',
    isClient,
    'currentUser ID:',
    currentUser?.id,
    'group.creator.id:',
    group?.creator?.id
  );

  return (
    <div className="bg-secondary-200 text-secondary-800 min-h-screen dark:bg-background">
      <main className="w-full max-w-[1920px] mx-auto px-4 py-8 space-y-8">
        <PageLevelError />
        <div className="flex justify-between items-center mb-6">
          <GroupBreadCrumb title={group.title || '揪團標題'} router={router} />
        </div>
        <GroupMainInfoCard
          group={group}
          API_BASE={API_BASE}
          isClient={isClient}
          countdown={countdown}
          progressWidth={progressWidth}
          onJoinGroup={handleJoinGroup}
          onJoinChat={handleJoinChat}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
          isAlreadyMember={isAlreadyMember}
          hasPaid={hasPaidForThisGroup}
          isOrganizer={isOrganizer}
          calendarButtonLoaded={calendarButtonLoaded}
          eventName={eventName}
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
          eventDescription={eventDescription}
          eventLocation={eventLocation}
        />

        {group.creator?.introduction && (
          <OrganizerIntroduction user={group.creator} API_BASE={API_BASE} />
        )}

        <ActivityDescription description={group.description} />

        <CommentSection
          groupId={groupId}
          initialComments={group.comments || []}
          API_BASE={API_BASE}
          currentUserId={currentUser?.id}
          currentUserInfo={currentUser}
          isClient={isClient}
          onCommentPosted={handleNewCommentPosted}
        />
      </main>

      <MobileStickyButtons
        groupTitle={group.title}
        groupId={groupId}
        onJoinGroup={handleJoinGroup}
        onJoinChat={handleJoinChat}
        hasPaid={hasPaidForThisGroup}
        isOrganizer={isOrganizer}
        onEdit={handleEditGroup}
        onDelete={handleDeleteGroup}
      />
    </div>
  );
}
