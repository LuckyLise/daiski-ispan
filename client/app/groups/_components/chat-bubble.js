// chat-bubble.js
'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { io } from 'socket.io-client';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const MESSAGES_PER_PAGE = 20; // 每次載入的歷史訊息數量

export function ChatBubble({ apiBase, currentUser, open, onOpenChange }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [unread, setUnread] = useState(0);
  // --- 連線與授權相關狀態 ---
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingGroupAuth, setIsCheckingGroupAuth] = useState(false);
  const [isChatAllowedForActiveGroup, setIsChatAllowedForActiveGroup] =
    useState(false);
  // --- 群組列表與選擇相關狀態 ---
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  // const [activeChatGroupId, setActiveChatGroupId] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showGroupList, setShowGroupList] = useState(true);
  // --- 歷史訊息相關狀態 ---
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); // 是否正在載入歷史訊息
  const [hasMoreHistory, setHasMoreHistory] = useState(true); // 是否還有更多歷史訊息可以載入
  const [historyCursor, setHistoryCursor] = useState(null); // 用於歷史訊息分頁的 cursor (上一批最舊訊息的 ID)
  // --- Refs ---
  const pathname = usePathname();
  const fileRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const socketRef = useRef(null);
  const isFetchingHistoryRef = useRef(false); // 防止重複獲取歷史記錄的 flag
  const initialMessagesLoadedRef = useRef(false); // 標記初始歷史訊息是否已載入

  useEffect(() => {
    if (apiBase && !socketRef.current) {
      socketRef.current = io(apiBase, {
        autoConnect: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
      });
    }
    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
      }
      socketRef.current = null;
    };
  }, [apiBase]);
  // --- 輔助函數：從 URL 解析 groupId ---
  const getGroupIdFromUrl = useCallback(() => {
    const pathSegments = pathname.split('/');
    // 假設群組詳細頁的 URL 格式是 /groups/:groupId/...
    if (
      pathSegments.length > 2 &&
      pathSegments[1] === 'groups' &&
      pathSegments[2]
    ) {
      const potentialGroupId = pathSegments[2];
      // 簡單驗證 groupId 是否為數字或非空字串 (根據您的 groupId 格式調整)
      if (
        /^\d+$/.test(potentialGroupId) ||
        (typeof potentialGroupId === 'string' && potentialGroupId.trim() !== '')
      ) {
        return potentialGroupId;
      }
    }
    return null;
  }, [pathname]);

  // --- API 呼叫：獲取使用者已加入的群組列表 ---
  const fetchJoinedGroups = useCallback(async () => {
    if (!currentUser?.id || !apiBase) return;
    setIsLoadingGroups(true);
    try {
      // 後端 API 路徑，請根據您的實際設定調整
      const response = await fetch(
        `${apiBase}/api/group/groupchat/my-joined-list`,
        {
          credentials: 'include', // 確保攜帶 cookie
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('從 API 獲取的群組列表:', data.groups);
          setJoinedGroups(data.groups || []);
        } else {
          console.error('後端 API (my-joined-list) 返回失敗:', data.message);
          setJoinedGroups([]);
        }
      } else {
        console.error('獲取已加入群組列表 HTTP 錯誤:', response.status);
        setJoinedGroups([]);
      }
    } catch (error) {
      console.error('獲取已加入群組列表 API 呼叫失敗:', error);
      setJoinedGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [currentUser?.id, apiBase]);

  // --- API 呼叫：獲取歷史訊息 ---
  const fetchHistoryMessages = useCallback(
    async (groupIdToFetch, cursor = null) => {
      if (
        !groupIdToFetch ||
        !apiBase ||
        !currentUser?.id ||
        isFetchingHistoryRef.current
      )
        return;

      setIsLoadingHistory(true);
      isFetchingHistoryRef.current = true;
      try {
        let url = `${apiBase}/api/group/groupchat/${groupIdToFetch}/messages?limit=${MESSAGES_PER_PAGE}`;
        if (cursor) {
          url += `&cursor=${cursor}`;
        }
        const response = await fetch(url, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.messages) {
            if (data.messages.length > 0) {
              setMsgs((prevMsgs) =>
                cursor ? [...data.messages, ...prevMsgs] : data.messages
              );
              setHistoryCursor(data.nextCursor); // 更新 cursor 以便下次使用
              setHasMoreHistory(!!data.nextCursor); // 如果 nextCursor 為 null，表示沒有更多了
            } else {
              setHasMoreHistory(false); // API 返回空陣列，表示沒有更多了
            }
            if (!cursor) initialMessagesLoadedRef.current = true; // 標記初始訊息已載入
          } else {
            console.error('獲取歷史訊息 API 回應失敗:', data.message);
            setHasMoreHistory(false);
          }
        } else {
          console.error('獲取歷史訊息 HTTP 錯誤:', response.status);
          setHasMoreHistory(false);
        }
      } catch (error) {
        console.error('呼叫獲取歷史訊息 API 失敗:', error);
        setHasMoreHistory(false);
      } finally {
        setIsLoadingHistory(false);
        isFetchingHistoryRef.current = false;
      }
    },
    [apiBase, currentUser?.id]
  );

  const selectGroupAndEnterChat = useCallback(
    async (groupId) => {
      if (!groupId || !currentUser || !socketRef.current || !apiBase) return;

      const selectedGroup = joinedGroups.find(
        (g) => g.id.toString() === groupId.toString()
      );
      // 如果找不到對應的群組，就中斷執行
      if (!selectedGroup) {
        // console.error(`在 joinedGroups 中找不到 ID 為 ${groupId} 的群組。`);
        return;
      }
      // 🔄 2. 如果是同一個群組，判斷條件要改成比較 ID
      if (
        activeGroup?.id === selectedGroup.id &&
        isChatAllowedForActiveGroup &&
        !isCheckingGroupAuth
      ) {
        setShowGroupList(false);
        return;
      }

      // 重設狀態，準備進入新的聊天室
      if (socketRef.current.connected) socketRef.current.disconnect(); // 先斷開舊的 socket 連接
      setMsgs([]); // 清空舊訊息
      setActiveGroup(selectedGroup);
      setShowGroupList(false); // 隱藏群組列表，準備顯示訊息界面
      setIsCheckingGroupAuth(true); // 開始檢查授權
      setIsChatAllowedForActiveGroup(false); // 重設授權狀態
      setHasMoreHistory(true); // 重設是否有更多歷史訊息的狀態
      setHistoryCursor(null); // 重設歷史訊息的 cursor
      initialMessagesLoadedRef.current = false; // 重設初始訊息載入標記

      try {
        const response = await fetch(
          `${apiBase}/api/group/groupchat/${groupId}/authorize`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.authorized) {
            setIsChatAllowedForActiveGroup(true); // 授權成功
            await fetchHistoryMessages(groupId); // 載入該群組的初始歷史訊息
            if (!socketRef.current.connected) {
              // 如果 socket 未連接
              socketRef.current.connect(); // 則進行連接 (連接成功後會在 'connect' 事件中加入房間)
            } else {
              // 如果 socket 已經因為某些原因連接上了 (理論上不應該，因為上面有 disconnect)
              socketRef.current.emit('joinGroupChat', groupId, currentUser.id); // 直接嘗試加入房間
            }
          } else {
            // 後端 API 返回未授權
            console.warn(
              `使用者未被授權加入群組 ${groupId} 的聊天室: ${data.message}`
            );
            setIsChatAllowedForActiveGroup(false);
            // 可以選擇是否跳回列表或保持顯示 "無法進入"
            // setShowGroupList(true);
            // setActiveChatGroupId(null);
          }
        } else {
          // HTTP 請求失敗 (例如 401, 403, 500)
          const errText = await response.text();
          console.error(
            `授權檢查 API HTTP 錯誤 (群組 ${groupId}): ${response.status}`,
            errText
          );
          setIsChatAllowedForActiveGroup(false);
          // setShowGroupList(true); setActiveChatGroupId(null);
        }
      } catch (error) {
        // fetch 本身拋出錯誤 (例如網路問題)
        console.error(`呼叫授權 API 失敗 (群組 ${groupId}):`, error);
        setIsChatAllowedForActiveGroup(false);
        // setShowGroupList(true); setActiveChatGroupId(null);
      } finally {
        setIsCheckingGroupAuth(false); // 結束授權檢查
      }
    },
    // eslint-disable-next-line
    [
      currentUser,
      apiBase,
      socketRef,
      fetchHistoryMessages,
      joinedGroups, // ✅ 新增 joinedGroups
      activeGroup, // 🔄 將 activeChatGroupId 改為 activeGroup
      isChatAllowedForActiveGroup,
    ]
  );

  useEffect(() => {
    if (open && currentUser?.id) {
      fetchJoinedGroups();
      const groupIdFromUrl = getGroupIdFromUrl();
      if (groupIdFromUrl) {
        if (activeGroup?.id !== groupIdFromUrl) {
          selectGroupAndEnterChat(groupIdFromUrl);
        }
      } else {
        setShowGroupList(true);
        setActiveGroup(null);
        setIsChatAllowedForActiveGroup(false);
        if (socketRef.current?.connected) socketRef.current.disconnect();
      }
    } else if (!open) {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
      }
      setActiveGroup(null);
      setIsChatAllowedForActiveGroup(false);
      setShowGroupList(true);
      setMsgs([]);
      setUnread(0);
    }
  }, [open, currentUser?.id, apiBase]);

  useEffect(() => {
    const groupIdFromUrl = getGroupIdFromUrl();
    if (open && currentUser?.id) {
      if (groupIdFromUrl) {
        if (groupIdFromUrl !== activeGroup?.id) {
          selectGroupAndEnterChat(groupIdFromUrl);
        }
      } else {
        if (activeGroup?.id && !showGroupList) {
          setShowGroupList(true);
          if (socketRef.current?.connected) socketRef.current.disconnect();
          setActiveGroup(null);
          setIsChatAllowedForActiveGroup(false);
          setMsgs([]);
        } else if (!activeGroup?.id) {
          setShowGroupList(true);
        }
      }
    }
  }, [pathname, open, currentUser?.id]);

  useEffect(() => {
    const currentSocket = socketRef.current;
    if (
      !currentSocket ||
      !activeGroup?.id ||
      !isChatAllowedForActiveGroup ||
      !currentUser?.id
    ) {
      if (currentSocket?.connected) {
        currentSocket.disconnect();
      }
      setIsConnected(false);
      return;
    }

    if (!currentSocket.connected) {
      currentSocket.connect();
    }

    const handleConnect = () => {
      setIsConnected(true);
      currentSocket.emit('joinGroupChat', activeGroup?.id, currentUser.id);
    };
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    const handleChatMessage = (m) => {
      if (
        m.groupId === activeGroup?.id ||
        (m.room && m.room.toString() === activeGroup?.id)
      ) {
        setMsgs((prev) => [...prev, m]);
        if (!open) setUnread((u) => u + 1);
      }
    };
    const handleJoinedRoomSuccess = (data) => {
      if (data.groupId === activeGroup?.id)
        console.log(`[Socket] Joined room ${data.groupId} successfully.`);
    }; // 保留一個成功日誌
    const handleJoinRoomError = (data) => {
      if (data.groupId === activeGroup?.id) {
        console.error(
          `[Socket] Join room ${data.groupId} error:`,
          data.message
        );
        setIsChatAllowedForActiveGroup(false);
        setShowGroupList(true);
        setActiveGroup(null);
        if (currentSocket.connected) currentSocket.disconnect();
      }
    };

    currentSocket.on('connect', handleConnect);
    currentSocket.on('disconnect', handleDisconnect);
    currentSocket.on('chatMessage', handleChatMessage);
    currentSocket.on('joinedRoomSuccess', handleJoinedRoomSuccess);
    currentSocket.on('joinRoomError', handleJoinRoomError);

    return () => {
      currentSocket.off('connect', handleConnect);
      currentSocket.off('disconnect', handleDisconnect);
      currentSocket.off('chatMessage', handleChatMessage);
      currentSocket.off('joinedRoomSuccess', handleJoinedRoomSuccess);
      currentSocket.off('joinRoomError', handleJoinRoomError);
    };
  }, [
    socketRef,
    activeGroup?.id,
    currentUser?.id,
    isChatAllowedForActiveGroup,
  ]);

  useEffect(() => {
    if (open && scrollAreaRef.current) {
      const sv = scrollAreaRef.current.querySelector(
        'div[style*="overflow: scroll"]'
      );
      if (sv) setTimeout(() => (sv.scrollTop = sv.scrollHeight), 100);
    }
  }, [msgs, open]);
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const sendMessage = (messageData) => {
    if (
      !socketRef.current ||
      !isConnected ||
      !activeGroup?.id ||
      !isChatAllowedForActiveGroup
    ) {
      console.error('[sendMessage] Aborted: Conditions not met.'); // 保留錯誤日誌
      alert('訊息無法發送：未連接到聊天室或未授權。');
      return;
    }
    socketRef.current.emit(
      'sendMessage',
      messageData,
      activeGroup?.id.toString()
    );
  };

  const sendText = () => {
    const content = text.trim();
    if (!content || !currentUser) return;
    const msg = {
      id: `temp-${Date.now()}`,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      type: 'text',
      content: content,
      time: Date.now(),
      groupId: activeGroup?.id,
    };
    setMsgs((prev) => [...prev, msg]);
    sendMessage(msg);
    setText('');
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (
      !file ||
      !currentUser ||
      !activeGroup?.id ||
      !isChatAllowedForActiveGroup
    )
      return;
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${apiBase}/api/group/groupchat/upload`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ message: '上傳失敗，無法解析錯誤回應' }));
        throw new Error(errData.message || `圖片上傳失敗: ${res.status}`);
      }
      const data = await res.json();
      if (!data.url) throw new Error('圖片上傳成功，但未獲取到圖片 URL');
      const msg = {
        user: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        type: 'image',
        imageUrl: data.url,
        time: Date.now(),
        groupId: activeGroup.id,
      };
      setMsgs((prev) => [...prev, msg]);
      sendMessage(msg);
    } catch (err) {
      console.error('[uploadImage] Failed:', err); // 保留錯誤日誌
      alert(`圖片上傳失敗: ${err.message}`);
    } finally {
      if (fileRef.current) fileRef.current.value = null;
    }
  };

  const canInteractWithChat =
    isConnected &&
    activeGroup?.id &&
    isChatAllowedForActiveGroup &&
    !isCheckingGroupAuth;
  const displayTitle =
    activeGroup?.id && isChatAllowedForActiveGroup && !showGroupList
      ? `${activeGroup?.title}`
      : showGroupList
        ? '選擇聊天群組'
        : isCheckingGroupAuth
          ? '檢查權限中...'
          : activeGroup?.id
            ? `群組 ${activeGroup?.id} (無法進入)`
            : '聊天室';
  const handleChatHeadClick = () => {
    if (!currentUser) {
      alert('請先登入以使用聊天功能。');
      return;
    }
    if (open) {
      onOpenChange(false);
    } else {
      onOpenChange(true);
      const groupIdFromUrl = getGroupIdFromUrl();
      if (!groupIdFromUrl) {
        setShowGroupList(true);
      }
      // fetchJoinedGroups 和 selectGroupAndEnterChat 的邏輯主要由 useEffect 依賴 open 狀態觸發
    }
  };

  const shouldShowGroupList = !isLoadingGroups && showGroupList;
  const shouldShowCheckingAuth = activeGroup?.id && isCheckingGroupAuth;
  const shouldShowNotAllowed =
    activeGroup?.id &&
    !isCheckingGroupAuth &&
    !isChatAllowedForActiveGroup &&
    !showGroupList;
  const shouldShowChatContent =
    activeGroup?.id &&
    isChatAllowedForActiveGroup &&
    !isCheckingGroupAuth &&
    !showGroupList;

  return (
    <>
      {currentUser && (
        <Button
          variant="secondary"
          className="fixed bottom-6 right-6 rounded-full p-4 shadow-lg z-50"
          onClick={handleChatHeadClick}
          aria-label="聊天室"
        >
          💬
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full"
            >
              {unread > 9 ? '9+' : unread}
            </Badge>
          )}
        </Button>
      )}
      {open && currentUser && (
        <div className="fixed bottom-20 right-6 w-80 h-[500px] max-h-[70vh] bg-white border border-gray-300 shadow-xl rounded-lg flex flex-col z-40 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b bg-slate-100 rounded-t-lg flex-shrink-0">
            <h4
              className="font-semibold text-slate-800 text-sm truncate pr-2"
              title={displayTitle}
            >
              {displayTitle}
            </h4>
            <div>
              {activeGroup?.id &&
                isChatAllowedForActiveGroup &&
                !showGroupList && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowGroupList(true);
                      if (socketRef.current?.connected)
                        socketRef.current.disconnect();
                      setActiveGroup(null);
                      setIsChatAllowedForActiveGroup(false);
                      setMsgs([]);
                    }}
                    className="text-slate-500 hover:text-slate-700 mr-1 text-xs p-1"
                  >
                    返回列表
                  </Button>
                )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                aria-label="關閉聊天室"
                className="text-slate-500 hover:text-slate-700 p-1"
              >
                ✕
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingGroups && showGroupList && (
              <div className="p-3 text-sm text-center text-gray-500">
                載入您的群組列表中...
              </div>
            )}
            {shouldShowGroupList && (
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {joinedGroups.length > 0
                    ? joinedGroups.map((group) => (
                        <Button
                          key={group.id}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto py-2 px-3"
                          onClick={() =>
                            selectGroupAndEnterChat(group.id.toString())
                          }
                        >
                          <span className="truncate">
                            {group.title || `群組 ${group.id}`}
                          </span>
                        </Button>
                      ))
                    : !isLoadingGroups && (
                        <p className="p-3 text-sm text-center text-gray-500">
                          您尚未加入任何可聊天的群組，或沒有群組的聊天權限。
                        </p>
                      )}
                </div>
              </ScrollArea>
            )}
            {shouldShowCheckingAuth && (
              <div className="p-3 text-sm text-center text-gray-500">
                正在檢查群組 {activeGroup?.id} 的權限...
              </div>
            )}
            {shouldShowNotAllowed && (
              <div className="flex-1 p-3 flex items-center justify-center text-sm text-red-600">
                您目前無法進入群組 {activeGroup?.id} 的聊天室。
              </div>
            )}
            {shouldShowChatContent && (
              <>
                <ScrollArea
                  ref={scrollAreaRef}
                  className="h-full p-3 space-y-3 bg-slate-50"
                >
                  {msgs.map((m, i) => (
                    <div
                      key={m.id || `msg-${i}-${m.time}`}
                      className={`flex flex-col max-w-[85%] ${m.user.id === currentUser.id ? 'self-end items-end ml-auto' : 'self-start items-start mr-auto'}`}
                    >
                      <div className="flex items-end gap-1.5">
                        {m.user.id !== currentUser.id && (
                          <Image
                            src={
                              m.user.avatar
                                ? `https://daiski-ispan.onrender.com${m.user.avatar}`
                                : '/deadicon.png'
                            }
                            alt={m.user.name || '用戶'}
                            width={24}
                            height={24}
                            className="rounded-full self-end mb-1"
                          />
                        )}
                        <div
                          className={`px-3 py-2 rounded-xl shadow-sm ${m.user.id === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                        >
                          {m.user.id !== currentUser.id && (
                            <p className="text-xs font-semibold mb-0.5 text-gray-700">
                              {m.user.name || '匿名用戶'}
                            </p>
                          )}
                          {m.type === 'text' ? (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {m.content}
                            </p>
                          ) : (
                            <Image
                              src={
                                m.imageUrl.startsWith('http') ||
                                m.imageUrl.startsWith('blob:')
                                  ? m.imageUrl
                                  : `${apiBase}${m.imageUrl}`
                              }
                              alt="聊天圖片"
                              width={200}
                              height={150}
                              className="max-w-full h-auto rounded-md object-cover cursor-none"
                              onClick={() =>
                                window.open(
                                  m.imageUrl.startsWith('http') ||
                                    m.imageUrl.startsWith('blob:')
                                    ? m.imageUrl
                                    : `${apiBase}${m.imageUrl}`,
                                  '_blank'
                                )
                              }
                              unoptimized={m.imageUrl.startsWith('blob:')}
                            />
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs text-gray-400 mt-0.5 px-1 ${m.user.id === currentUser.id ? 'self-end' : 'self-start'}`}
                      >
                        {new Date(m.time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                  {!isConnected && (
                    <p className="text-xs text-center text-red-500 py-2">
                      連線中斷，嘗試重新連接...
                    </p>
                  )}
                  {msgs.length === 0 && !isCheckingGroupAuth && (
                    <p className="text-xs text-center text-gray-400 py-2">
                      還沒有訊息，開始聊天吧！
                    </p>
                  )}
                </ScrollArea>
              </>
            )}
          </div>
          {shouldShowChatContent && (
            <div className="flex items-center gap-2 p-3 border-t bg-white rounded-b-lg flex-shrink-0">
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                className="hidden"
                onChange={uploadImage}
                aria-label="選擇圖片"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => fileRef.current?.click()}
                aria-label="上傳圖片"
                className="text-slate-500 hover:text-slate-700"
                disabled={!canInteractWithChat}
              >
                📎
              </Button>
              <Input
                placeholder={
                  canInteractWithChat ? '輸入訊息...' : '無法連接...'
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  canInteractWithChat &&
                  (sendText(), e.preventDefault())
                }
                className="flex-1 text-sm"
                disabled={!canInteractWithChat}
              />
              <Button
                onClick={sendText}
                disabled={!text.trim() || !canInteractWithChat}
                className="text-sm"
              >
                送出
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
