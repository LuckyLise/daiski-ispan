// ./_components/group-info.js (或你的實際路徑)
'use client';
import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// 引入 Lucide Icon
import {
  CalendarDays,
  MapPin,
  Users,
  CalendarPlus,
  Edit3,
  Trash2,
  MountainSnow, // 假設用於滑雪難易度圖示
} from 'lucide-react';

// 左側內容區塊 (內部組件) - 基本不變
function ImageAndMembersSection({
  groupUser,
  mainImageUrl,
  memberPreviews = [],
  totalMembers = 0,
  API_BASE,
}) {
  const displayedAvatars = memberPreviews.slice(0, 3);
  const remainingAvatars = totalMembers > 3 ? totalMembers - 3 : 0;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={
              groupUser?.avatar
                ? groupUser.avatar.startsWith('http')
                  ? groupUser.avatar
                  : `${API_BASE}${groupUser.avatar}`
                : `https://i.pravatar.cc/40?u=${groupUser?.id || 'default'}`
            }
            alt={groupUser?.name}
          />
          <AvatarFallback>
            {groupUser?.name ? groupUser.name[0].toUpperCase() : '主'}
          </AvatarFallback>
        </Avatar>
        <p className="font-semibold text-foreground">
          {groupUser?.name || '主辦人'}
        </p>
      </div>
      <div className="relative overflow-hidden h-64 md:h-80 rounded-md">
        <Image
          src={mainImageUrl}
          alt="揪團封面"
          fill
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-300 ease-out hover:scale-105"
          priority
          onError={(e) => {
            e.currentTarget.src = '/deadicon.png'; // 預設圖片
            e.currentTarget.alt = '圖片載入失敗';
          }}
        />
      </div>
      {memberPreviews.length > 0 && (
        <div className="flex space-x-[-10px] items-center pt-2">
          {displayedAvatars.map((memberUser) => (
            <Avatar
              key={memberUser.id}
              className="w-8 h-8 border-2 border-white dark:border-card rounded-full"
            >
              <AvatarImage
                src={
                  memberUser.avatar
                    ? memberUser.avatar.startsWith('http')
                      ? memberUser.avatar
                      : `${API_BASE}${memberUser.avatar}`
                    : `https://i.pravatar.cc/32?u=${memberUser.id}`
                }
                alt={memberUser.name}
              />
              <AvatarFallback>
                {memberUser.name ? memberUser.name[0].toUpperCase() : '員'}
              </AvatarFallback>
            </Avatar>
          ))}
          {remainingAvatars > 0 && (
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium border-2 border-white dark:border-card">
              +{remainingAvatars}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 右側內容區塊 (內部組件) - 修改按鈕佈局
function InfoAndActionsSection({
  group,
  isClient,
  countdown,
  progressWidth,
  onJoinGroup,
  onJoinChat,
  isAlreadyMember,
  isOrganizer,
  hasPaid,

  // 新增的 props for add-to-calendar-button
  calendarButtonLoaded,
  eventName,
  eventStartDate,
  eventEndDate,
  eventDescription,
  eventLocation,
}) {
  const difficultyMap = {
    BEGINNER: '初級',
    INTER: '中級',
    ADVANCE: '進階',
  };

  // 判斷是否應該顯示難易度
  // 條件：group.type 存在，group.type 不是 "聚餐"，並且 group.difficulty 存在
  // 您可以根據實際的 group.type 值來調整判斷條件，例如：
  // const isSkiGroup = group && group.type && (group.type.toLowerCase().includes('ski') || group.type.toLowerCase().includes('滑雪'));
  const groupTypeStr = String(group?.type || '').toLowerCase();
  const isRelevantTypeForDifficulty =
    groupTypeStr.includes('ski') || groupTypeStr.includes('滑雪');

  const shouldShowDifficulty = isRelevantTypeForDifficulty && group?.difficulty;

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="flex items-center text-2xl font-semibold text-primary-800 dark:text-white">
        <span className="inline-block w-1 h-6 bg-blue-600 dark:bg-blue-500 mr-2 rounded-sm"></span>
        {group.title || '揪團標題'}
      </h2>
      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
        <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span>
              {isClient && group.startDate
                ? `${new Date(group.startDate).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}`
                : '日期載入中...'}
              {isClient && group.endDate && group.startDate !== group.endDate
                ? ` – ${new Date(group.endDate).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}`
                : ''}
            </span>
          </div>
          {isClient && calendarButtonLoaded && eventStartDate && (
            <add-to-calendar-button
              name={eventName}
              startDate={eventStartDate}
              endDate={eventEndDate}
              description={eventDescription}
              location={eventLocation}
              options="'Google','Outlook.com','Apple','Yahoo','iCal'"
              timeZone="Asia/Taipei"
              buttonStyle="text"
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm p-1 hover:bg-blue-500/10"
            >
              <CalendarPlus size={14} className="mr-1" />
              <span>加入行事曆</span>
            </add-to-calendar-button>
          )}
        </div>

        <p className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          {group.location || group.customLocation || '地點未定'}
        </p>
        <p className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          成團人數：{group.minPeople || '不限'}–{group.maxPeople || '不限'} 人
        </p>
        {/* 條件渲染難易度 */}
        {shouldShowDifficulty && (
          <p className="flex items-center">
            <MountainSnow className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            難易度：
            {difficultyMap[String(group.difficulty).toUpperCase()] ||
              group.difficulty}
          </p>
        )}
      </div>
      <div>
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          價格：
        </p>
        <p className="text-lg font-bold text-green-600 dark:text-green-400">
          NT${group.price?.toLocaleString() || '洽主辦方'}／人
        </p>
      </div>
      {typeof group.currentPeople === 'number' &&
        typeof group.maxPeople === 'number' &&
        group.maxPeople > 0 && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              已報名：{group.currentPeople} 人{' '}
              <span className="float-right">上限：{group.maxPeople} 人</span>
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: progressWidth }}
              ></div>
            </div>
          </div>
        )}
      <div className="text-sm text-red-600 dark:text-red-400">
        <p>
          截止報名：
          {isClient && (group.registrationDeadline || group.startDate)
            ? new Date(
                group.registrationDeadline || group.startDate
              ).toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            : '未定'}
        </p>
        <p className="font-mono text-lg">{countdown}</p>
      </div>
      <div className="overflow-hidden h-40 rounded-md border border-slate-300 dark:border-slate-700">
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(group.location || group.customLocation || '台灣')}&hl=zh-TW&z=15&output=embed`} // 修正 Google Maps URL
          className="w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          title="活動地點地圖"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      {/* 操作按鈕區 - 修改為左右排列 */}
      <div className="hidden md:flex items-center gap-2 pt-2">
        <Button
          onClick={onJoinGroup}
          disabled={
            isAlreadyMember ||
            (group.maxPeople && group.currentPeople >= group.maxPeople)
          }
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base text-center transition active:scale-95 active:shadow-sm rounded-md disabled:opacity-50"
        >
          {isAlreadyMember
            ? hasPaid
              ? '已付款'
              : '已參加 (待付款)'
            : group.maxPeople && group.currentPeople >= group.maxPeople
              ? '人數已滿'
              : '我要參加'}
        </Button>
        <Button
          variant="outline"
          onClick={onJoinChat}
          disabled={!isOrganizer &&(!isAlreadyMember || !hasPaid)}
          className="flex-1 py-3 border-blue-600 text-blue-600 font-semibold text-base hover:bg-blue-600/10 transition active:scale-95 active:shadow-sm rounded-md disabled:opacity-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/20"
        >
          加入聊天室
        </Button>
      </div>
    </div>
  );
}

// GroupMainInfoCard 主組件 - 新增編輯和刪除按鈕
export default function GroupMainInfoCard({
  group,
  API_BASE,
  isClient,
  countdown,
  progressWidth,
  onJoinGroup,
  onJoinChat,
  isOrganizer, // 這個 prop 用來判斷是否顯示編輯/刪除按鈕
  onEditGroup, // 編輯按鈕的處理函數
  onDeleteGroup, // 刪除按鈕的處理函數
  isAlreadyMember,
  hasPaid,

  // 新增的 props for add-to-calendar-button
  calendarButtonLoaded,
  eventName,
  eventStartDate,
  eventEndDate,
  eventDescription,
  eventLocation,
}) {
  const mainImageUrl =
    group.images && group.images.length > 0 && group.images[0].imageUrl
      ? group.images[0].imageUrl.startsWith('http')
        ? group.images[0].imageUrl
        : `${API_BASE}${group.images[0].imageUrl}`
      : group.cover_image
        ? group.cover_image.startsWith('http')
          ? group.cover_image
          : `${API_BASE}${group.cover_image}`
        : '/deadicon.png';

  return (
    <Card className="w-full max-w-screen-2xl mx-auto shadow-lg p-4 sm:p-6 rounded-lg bg-white dark:bg-slate-800 relative">
      {isOrganizer && (
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onEditGroup}
            className="text-blue-600 border-blue-600 hover:bg-blue-600/10 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400/20 h-8 w-8 md:h-9 md:w-9"
            title="編輯揪團"
          >
            <Edit3 className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={onDeleteGroup}
            className="h-8 w-8 md:h-9 md:w-9"
            title="刪除揪團"
          >
            <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageAndMembersSection
          groupUser={group.creator}
          mainImageUrl={mainImageUrl}
          memberPreviews={group.members?.map((m) => m.user) || []}
          totalMembers={group.currentPeople || 0}
          API_BASE={API_BASE}
        />
        <InfoAndActionsSection
          group={group}
          isClient={isClient}
          countdown={countdown}
          progressWidth={progressWidth}
          onJoinGroup={onJoinGroup}
          onJoinChat={onJoinChat}
          isAlreadyMember={isAlreadyMember}
          hasPaid={hasPaid}
          calendarButtonLoaded={calendarButtonLoaded}
          isOrganizer={isOrganizer}
          eventName={eventName}
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
          eventDescription={eventDescription}
          eventLocation={eventLocation}
        />
      </div>
    </Card>
  );
}
