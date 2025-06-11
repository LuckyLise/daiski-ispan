// routes/members/avatar.js
import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import prisma from '../../lib/prisma.js';
import authenticate from '../../middlewares/authenticate.js';
// 你的 PrismaClient 實例

// const router = express.Router();

// const avatar = multer({ dest: 'avatar/' }); // 暫存

// /**
//  * POST /api/profile/avatar/:userId
//  * 不驗證、不看 token
//  * multipart/form-data；檔案欄位 name="avatar"
//  */
// router.post(
//   '/avatar',
//   avatar.single('avatar'),

// );

// export default router;

const router = express.Router();
const avatar = multer({
  dest: 'avatar/', // 暫存目錄
});
/* GET home page. */
router.post('/:userId', avatar.single('avatar'), async (req, res, next) => {
  try {
    /* ---------- 1. 取 userId ---------- */
    const userId = Number(req.params.userId);
    if (!userId) return res.status(400).json({ msg: '缺少或錯誤的 userId' });

    /* ---------- 2. 確認有檔案 ---------- */
    if (!req.file) return res.status(400).json({ msg: '缺少檔案 (avatar)' });

    /* ---------- 3. 產生目的路徑 ---------- */
    const ext = path.extname(req.file.originalname) || '.jpg';
    const fileName = `${Date.now()}${ext}`; // 1700….jpg
    const userDir = path.resolve('public', 'avatar', String(userId));
    const destPath = path.join(userDir, fileName);

    await fs.mkdir(userDir, { recursive: true });
    await fs.rename(req.file.path, destPath);

    const avatarUrl = `/avatar/${userId}/${fileName}`;

    /* ---------- 4. 更新資料庫 ---------- */
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    /* ---------- 5. 回傳 ---------- */
    res.json({ url: avatarUrl });
    return res.status(200);
    //   .json({ status: 'success', message: 'Express(path: /api/profile/avatar)' });
  } catch (err) {
    next(err);
  }
});

export default router;
