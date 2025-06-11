// routes/profile/courses.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

/* 取得「某會員」已報名課程 */
router.get('/:userId/courses', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) return res.status(400).json({ msg: '無效 userId' });

    // 1. 找出這個會員在 CourseVariantUser 表的紀錄
    const rows = await prisma.courseVariantUser.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        course_variant_id: true,
        course_variant: {
          select: {
            course: {
              select: {
                name: true,
                start_at: true,
                end_at: true,
                CourseImg: {
                  select: { img: true },
                  orderBy: { id: 'asc' },
                  take: 1,
                },
              },
            },
            location: { select: { name: true } },
          },
        },
      },
      orderBy: { joined_at: 'desc' },
    });

    // 2. 整形給前端
    const courses = rows.map((row) => {
      const cv = row.course_variant;
      const c = cv.course;
      return {
        id: row.id,
        course_variant_id: row.course_variant_id,
        name: c.name,
        startAt: c.start_at,
        endAt: c.end_at,
        location: cv.location?.name ?? '',
        image: c.CourseImg[0]?.img ?? '/deadicon.png',
      };
    });

    res.json({ courses });
  } catch (err) {
    next(err);
  }
});

export default router;
