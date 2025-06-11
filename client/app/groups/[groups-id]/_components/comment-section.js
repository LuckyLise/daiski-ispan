// app/groups/[groups-id]/_components/CommentSection.js
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import CommentForm from './comment-form';
import CommentItem from './comment-item';

// 輔助函數：將扁平的留言列表轉換為樹狀結構
const buildCommentTree = (commentsList) => {
  if (!commentsList || commentsList.length === 0) return [];
  const commentsMap = {};
  const tree = [];

  // 確保每個留言物件都有 replies 陣列
  commentsList.forEach((comment) => {
    commentsMap[comment.id] = { ...comment, replies: [] };
  });

  commentsList.forEach((comment) => {
    // 使用 replyId (來自 Prisma schema，後端返回的欄位)
    if (comment.replyId && commentsMap[comment.replyId]) {
      // 確保父留言存在於 map 中
      commentsMap[comment.replyId].replies.push(commentsMap[comment.id]);
    } else {
      // 頂層留言
      tree.push(commentsMap[comment.id]);
    }
  });
  return tree;
};

export default function CommentSection({
  groupId,
  initialComments = [], // 從 page.js 傳入的扁平留言列表
  API_BASE,
  onCommentPosted, // 新留言/回覆成功後的回調，通知 page.js
}) {
  const { user, isAuth, isLoading: isAuthLoading } = useAuth();
  const currentUserInfo = user
    ? { id: user.id, name: user.name, avatar: user.avatar }
    : null;

  const [comments, setComments] = useState(initialComments || []); // 儲存扁平的留言列表
  const [isSubmitting, setIsSubmitting] = useState(false); // 全局的提交狀態
  const [error, setError] = useState(''); // 用於顯示頂層錯誤
  const [activeReplyToId, setActiveReplyToId] = useState(null); // 追蹤哪個留言正在被回覆
  const [isClientSide, setIsClientSide] = useState(false); // 處理客戶端渲染

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  useEffect(() => {
    // 當 initialComments 從父元件更新時，同步到內部的 comments 狀態
    setComments(initialComments || []);
  }, [initialComments]);

  const commentTree = useMemo(() => {
    // 排序對於 buildCommentTree 正確構建父子關係和顯示順序很重要
    // 按 createdAt 升序排序，舊的在前，新的在後
    const sortedComments = [...comments].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    return buildCommentTree(sortedComments);
  }, [comments]); // 當扁平的 comments 列表改變時，重新計算 commentTree

  // 通用的留言/回覆提交處理函數
  const handlePost = async (content, parentId = null) => {
    if (!isAuth || !currentUserInfo) {
      setError('請先登入才能發表。');
      return;
    }
    if (!content.trim() || !groupId) return;

    setIsSubmitting(true);
    setError(''); // 清除之前的頂層錯誤

    const tempCommentId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticComment = {
      id: tempCommentId,
      content: content,
      createdAt: new Date().toISOString(),
      user: currentUserInfo,
      replyId: parentId,
      isTemporary: true,
    };

    setComments((prevComments) => [optimisticComment, ...prevComments]);
    if (parentId) {
      setActiveReplyToId(null);
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/group/${groupId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content, parentId: parentId }),
          credentials: 'include',
        }
      );
      const responseText = await response.text();

      let parsedResult;
      try {
        parsedResult = JSON.parse(responseText);
        console.log(parsedResult);
      } catch (parseError) {
        console.error(parseError);
        throw new Error();
      }

      // 步驟 1: 檢查 HTTP 狀態碼是否成功 (2xx)
      if (!response.ok) {
        const errMsg =
          (parsedResult && (parsedResult.message || parsedResult.error)) ||
          `伺服器回報錯誤，狀態碼: ${response.status}`;
        console.error('[CommentSection] HTTP Error:', {
          ok: response.ok,
          errMsg,
          responseStatus: response.status,
          parsedResult,
        });
        throw new Error(errMsg);
      }

      // 步驟 2: 後端直接返回 comment 物件，所以 parsedResult 就是 savedComment
      // 檢查 parsedResult (即留言物件本身) 是否有效，特別是是否有 id
      if (!parsedResult || typeof parsedResult.id === 'undefined') {
        parsedResult;
        throw new Error('後端回應成功，但缺少有效的留言資料。');
      }

      const savedComment = parsedResult; // 直接使用解析後的結果作為留言物件

      setComments((prevComments) => {
        const filtered = prevComments.filter((c) => c.id !== tempCommentId);
        return savedComment && savedComment.id
          ? [savedComment, ...filtered]
          : filtered;
      });

      if (onCommentPosted) {
        onCommentPosted(savedComment);
      }
    } catch (err) {
      console.error('[CommentSection] 發表留言/回覆錯誤 (catch block):', err);
      setError(`發表失敗: ${err.message}`);
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== tempCommentId)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyButtonClick = (commentId) => {
    setActiveReplyToId((prevId) => (prevId === commentId ? null : commentId));
  };

  if (isAuthLoading) {
    return (
      <p className="p-4 text-center text-muted-foreground">
        正在載入使用者資訊...
      </p>
    );
  }

  if (!isClientSide) {
    return (
      <p className="p-4 text-center text-muted-foreground">正在準備留言區...</p>
    );
  }

  return (
    <Card className="w-full max-w-screen-2xl mx-auto shadow-lg p-6 rounded-lg border-t border-border bg-card text-foreground mt-8 dark:bg-primary-800">
      <h3 className="text-lg font-semibold mb-4 text-primary-800 dark:text-white">
        留言區 ({comments?.length || 0})
      </h3>

      <CommentForm
        isSubmitting={isSubmitting}
        onSubmit={handlePost}
        isAuth={isAuth}
        placeholderText="輸入你的留言…"
        // onCancel 在頂層表單中不需要
      />
      {error && <p className="text-sm text-destructive mt-1 mb-4">{error}</p>}

      <div className="space-y-4 mt-6">
        {commentTree && commentTree.length > 0 ? (
          commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              API_BASE={API_BASE}
              isClientSide={isClientSide}
              level={0}
              onReplyButtonClick={handleReplyButtonClick}
              activeReplyToId={activeReplyToId}
              groupId={groupId}
              isSubmittingReply={isSubmitting}
              onPostReply={handlePost}
              currentUserInfo={currentUserInfo}
              isAuth={isAuth}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            還沒有留言喔！快來搶頭香！
          </p>
        )}
      </div>
    </Card>
  );
}
