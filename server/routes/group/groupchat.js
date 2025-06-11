// routes/groupchat.js (或者您實際的 routes/group/index.js 或 routes/group/chat.js)

import express from 'express';
import multer from 'multer';
// 假設 authenticate.js 在 server/middlewares/authenticate.js
import authenticate from '../../middlewares/authenticate.js'; // << --- 再次確認此路徑是否正確
// 確保 MessageType 也被匯入，如果您的 Prisma schema 中 ChatMessage.messageType 是 enum
import { PrismaClient, MessageType } from '@prisma/client';

const prisma = new PrismaClient(); // 建議：將此實例化移至共享的 db.js 檔案中
const router = express.Router();

// --- 圖片上傳設定 (保持不變) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('不支援的檔案類型，僅限上傳圖片!'), false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

// --- HTTP API 路由定義 ---
const setNoCacheHeaders = (res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};
router.get('/my-joined-list', authenticate, async (req, res) => {
  setNoCacheHeaders(res);
  const userId = req.user?.id;
  if (!userId)
    return res
      .status(401)
      .json({ success: false, message: '未授權，無法識別使用者' });
  try {
    // console.log(`獲取使用者 ${userId} 的已加入群組列表`); // 可以移除或保留
    const groupMemberships = await prisma.groupMember.findMany({
      where: {
        userId: userId,
        paidAt: { not: null },
        group: { deletedAt: null },
      },
      select: { groupId: true, group: { select: { title: true } } },
      orderBy: { joinedAt: 'desc' },
    });
    const authorizedGroups = groupMemberships.map((gm) => ({
      id: gm.groupId,
      title: gm.group.title,
    }));
    // console.log(`使用者 ${userId} 的已加入群組列表結果:`, authorizedGroups); // 可以移除或保留
    res.status(200).json({ success: true, groups: authorizedGroups });
  } catch (error) {
    console.error(
      `獲取使用者 ${userId} 已加入的聊天群組列表時發生錯誤:`,
      error
    ); // 保留錯誤日誌
    setNoCacheHeaders(res);
    res.status(500).json({ success: false, message: '獲取聊天群組列表失敗' });
  }
});
router.post('/upload', authenticate, upload.single('file'), (req, res) => {
  setNoCacheHeaders(res);
  if (!req.file) {
    return res
      .status(400)
      .json({ message: '沒有上傳檔案，或者檔案類型不被接受' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ message: '圖片上傳成功', url: imageUrl });
});

router.get('/:groupId/authorize', authenticate, async (req, res) => {
  setNoCacheHeaders(res);
  const { groupId: groupIdString } = req.params;
  const userId = req.user?.id;
  console.log('API /:groupId/authorize - req.user:', req.user); // 保留日誌
  console.log('API /:groupId/authorize - req.user.id:', req.user?.id); // 保留日誌

  if (!userId)
    return res
      .status(401)
      .json({ authorized: false, message: '未授權，無法識別使用者' });
  if (!groupIdString)
    return res.status(400).json({ authorized: false, message: '缺少群組 ID' });
  const groupId = parseInt(groupIdString, 10);
  if (isNaN(groupId))
    return res
      .status(400)
      .json({ authorized: false, message: '群組 ID 格式不正確' });
  try {
    console.log(`檢查授權: 使用者 ID ${userId}, 群組 ID ${groupId}`); // 保留日誌
    const memberRecord = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: groupId, userId: userId } }, // 確認複合鍵名稱
      select: { paidAt: true },
    });
    if (memberRecord) {
      if (memberRecord.paidAt) {
        console.log(`使用者 ${userId} 在群組 ${groupId} 中已付款。`); // 保留日誌
        res
          .status(200)
          .json({ authorized: true, message: '已授權，允許加入聊天室' });
      } else {
        console.log(`使用者 ${userId} 在群組 ${groupId} 中已加入但未付款。`); // 保留日誌
        res.status(403).json({
          authorized: false,
          message: '您已加入此揪團但尚未完成付款，暫時無法進入聊天室',
        });
      }
    } else {
      console.log(`使用者 ${userId} 不是群組 ${groupId} 的成員。`); // 保留日誌
      res.status(403).json({
        authorized: false,
        message: '您尚未加入此揪團，無法進入聊天室',
      });
    }
  } catch (error) {
    console.error(`檢查群組 ${groupId} 聊天室授權時發生錯誤:`, error); // 保留錯誤日誌
    if (error.code)
      console.error('Prisma 錯誤代碼:', error.code, '錯誤訊息:', error.message);
    setNoCacheHeaders(res);
    res
      .status(500)
      .json({ authorized: false, message: '檢查授權時發生伺服器內部錯誤' });
  }
});

/**
 * @route   GET /:groupId/messages
 * @desc    獲取指定群組聊天室的歷史訊息 (支持分頁)
 * @access  Private (需要使用者是該群組的成員且已付款 - 或您的授權邏輯)
 */
router.get('/:groupId/messages', authenticate, async (req, res) => {
  setNoCacheHeaders(res);
  const { groupId: groupIdString } = req.params;
  const userId = req.user?.id;

  const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : undefined;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20; // 預設每次載入20條

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: '未授權，無法識別使用者' });
  }
  if (!groupIdString) {
    return res.status(400).json({ success: false, message: '缺少群組 ID' });
  }
  const groupId = parseInt(groupIdString, 10);
  if (isNaN(groupId)) {
    return res
      .status(400)
      .json({ success: false, message: '群組 ID 格式不正確' });
  }

  try {
    // 1. 再次驗證使用者是否有權限查看此聊天室的訊息
    const memberRecord = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: groupId, userId: userId } },
      select: { paidAt: true }, // 只需要確認是成員且（根據您的邏輯）已付款
    });

    // 根據您的業務邏輯調整此處的授權判斷
    if (!memberRecord || !memberRecord.paidAt) {
      console.warn(
        `使用者 ${userId} 無權限查看群組 ${groupId} 的歷史訊息 (未加入或未付款)。`
      );
      return res.status(403).json({
        success: false,
        message: '您沒有權限查看此聊天室的歷史訊息。',
      });
    }

    // 2. 查詢歷史訊息
    const messages = await prisma.chatMessage.findMany({
      where: {
        groupId: groupId,
        // 如果提供了 cursor，則只獲取 id 小於 cursor 的訊息 (假設 id 隨時間遞增)
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: {
        sentAt: 'desc', // 從最新的開始獲取，這樣 cursor 就是上一批中最舊的 ID
      },
      include: {
        user: {
          // 包含發送者資訊
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // 整理並轉換訊息格式以符合前端期望
    const formattedMessages = messages
      .map((msg) => ({
        id: msg.id,
        user: msg.user,
        type: msg.messageType === MessageType.IMAGE ? 'image' : 'text', // 使用 Prisma schema 中的 MessageType enum
        content: msg.messageType === MessageType.TEXT ? msg.content : undefined,
        imageUrl:
          msg.messageType === MessageType.IMAGE ? msg.content : undefined,
        time: msg.sentAt.getTime(), // 轉換為 timestamp
        groupId: msg.groupId.toString(),
      }))
      .reverse(); // 因為是按 sentAt 'desc' 獲取的，所以反轉使最舊的在前面，方便前端 unshift 或 concat

    const nextCursor =
      messages.length === limit && messages.length > 0
        ? messages[messages.length - 1].id
        : null;

    res
      .status(200)
      .json({ success: true, messages: formattedMessages, nextCursor });
  } catch (error) {
    console.error(`獲取群組 ${groupId} 歷史訊息時發生錯誤:`, error);
    setNoCacheHeaders(res);
    res.status(500).json({ success: false, message: '獲取歷史訊息失敗' });
  }
});

export default router;
