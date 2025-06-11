import express from 'express';
import { PrismaClient, ActivityType } from '@prisma/client'; // 調整成你的路徑

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,

        title: true,
        description: true,
        startDate: true, // 活動開始時間
        endDate: true, // 活動結束時間（如果你有這欄）
        images: {
          select: { imageUrl: true },
          orderBy: { sortOrder: 'asc' },
          take: 1, // 只取第一張
        },
        location: {
          select: { name: true },
        },
        customLocation: true,
      },
      orderBy: { startDate: 'asc' }, // 依時間排序（可依需求調整）
    });

    const result = groups.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      time: g.endDate
        ? `${g.startDate.toISOString()} — ${g.endDate.toISOString()}`
        : g.startDate.toISOString(),
      imageUrl: g.images[0]?.imageUrl || '/deadicon.png',
      location: g.location?.name || 'null',
      customLocation: g.customLocation,
    }));

    res.json({ groups: result });
  } catch (err) {
    next(err);
  }
});
export default router;
