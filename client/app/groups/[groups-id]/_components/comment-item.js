// app/groups/[groups-id]/_components/CommentItem.js
'use client';

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import CommentForm from './comment-form.js'; // 引入 CommentForm 來顯示回覆框

export default function CommentItem({
  comment, // 當前留言物件 (包含其 replies)
  API_BASE, // 用於拼接頭像 URL
  isClientSide, // 是否為客戶端環境 (用於日期格式化)
  level = 0, // 巢狀層級，用於縮排
  onReplyButtonClick, // 處理「回覆」按鈕點擊事件 (commentId) => void
  activeReplyToId, // 當前正在回覆的留言 ID
  // Props for reply form (CommentForm) within CommentItem
  groupId, // 當前揪團 ID
  isSubmittingReply, // 回覆是否正在提交 (通常是全局的 isSubmitting)
  onPostReply, // 提交回覆的處理函數 (content, parentId) => Promise<void>
  currentUserInfo, // 當前登入用戶資訊
  isAuth, // 用戶是否已登入
}) {
  const isReplying = activeReplyToId === comment.id;

  const authorName = comment.user?.name || '匿名用戶';
  const authorAvatar = comment.user?.avatar;

  return (
    <div
      className={`border-b border-border pb-4 last:border-b-0 ${comment.isTemporary ? 'opacity-60' : ''} ${level > 0 ? 'ml-6 pl-4 border-l border-gray-200 mt-4' : 'mt-0'}`}
    >
      <div className="flex items-start space-x-3 mb-1">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage
            src={
              authorAvatar
                ? authorAvatar.startsWith('http') ||
                  authorAvatar.startsWith('/uploads/')
                  ? authorAvatar
                  : `${API_BASE}${authorAvatar}`
                : undefined
            }
            alt={authorName}
          />
          <AvatarFallback>
            {authorName ? authorName[0].toUpperCase() : '訪'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex items-center space-x-2 mb-0.5">
            <p className="font-semibold text-sm text-foreground">
              {authorName}
            </p>
            <p className="text-xs text-muted-foreground">
              {comment.isTemporary
                ? '傳送中...'
                : isClientSide && comment.createdAt
                  ? new Date(comment.createdAt).toLocaleString('zh-TW', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '剛剛'}
            </p>
          </div>
          <p className="text-sm text-secondary-800 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          {isAuth && ( // 登入後才能看到回覆按鈕
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs text-primary-500 hover:underline mt-1"
              onClick={() => onReplyButtonClick(comment.id)}
            >
              {isReplying ? '取消回覆' : '回覆'}
            </Button>
          )}
        </div>
      </div>

      {/* 回覆輸入框 */}
      {isReplying && (
        <div className="ml-0 mt-2">
          {' '}
          {/* 回覆框的縮排，可根據設計調整 */}
          <CommentForm
            API_BASE={API_BASE}
            groupId={groupId}
            parentId={comment.id} // 設定父留言 ID
            isSubmitting={isSubmittingReply}
            onSubmit={onPostReply}
            onCancel={() => onReplyButtonClick(null)} // 點擊取消時，關閉回覆框
            currentUserInfo={currentUserInfo}
            isAuth={isAuth}
            placeholderText={`回覆 ${authorName}...`}
          />
        </div>
      )}

      {/* 遞迴渲染子回覆 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              API_BASE={API_BASE}
              isClientSide={isClientSide}
              level={level + 1} // 增加巢狀層級
              onReplyButtonClick={onReplyButtonClick}
              activeReplyToId={activeReplyToId}
              groupId={groupId}
              isSubmittingReply={isSubmittingReply}
              onPostReply={onPostReply}
              currentUserInfo={currentUserInfo}
              isAuth={isAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
