import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();
const prisma = new PrismaClient();

// 取得目前使用者的收藏清單
// 透過 authenticate middleware 從 HTTP-only Cookie 解出 req.user.id
// http://localhost:3005/api/profile/favorites
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favs = await prisma.userFavorite.findMany({
      where: { userId },
      select: { productId: true },
    });
    // 回傳純 productId 陣列
    res.json(favs.map((f) => f.productId));
  } catch (e) {
    next(e);
  }
});

// 新增收藏
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.body.productId);
    await prisma.userFavorite.create({ data: { userId, productId } });
    res.status(201).end();
  } catch (e) {
    next(e);
  }
});

// 取消收藏
router.delete('/:productId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);
    await prisma.userFavorite.deleteMany({ where: { userId, productId } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
