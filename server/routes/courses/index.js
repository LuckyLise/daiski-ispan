import express from 'express';
import prisma from '../../lib/prisma.js';
// import { orderBy } from 'lodash';
import { Prisma } from '@prisma/client';

const router = express.Router();

// 抓課程列表
router.get('/', async function (req, res) {
  const { boardtype, location, difficulty, keyword } = req.query;
  // → 會得到：雪板

  // 先組 CourseVariant 裡的細項條件
  const variantWhere = {
    ...(location && { location: { name: location } }),
    ...(difficulty && { difficulty }),
    ...(boardtype && { boardtype: { name: boardtype } }),
  };

  const where = {
    deleted_at: null,
    start_at: { gte: new Date() }, // ⭐ 只抓尚未結束

    // 關鍵字搜尋
    ...(keyword && {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
    // 只有真的有選擇時才加進條件
    ...(Object.keys(variantWhere).length && {
      CourseVariant: { some: variantWhere },
    }),
  };
  try {
    const courses = await prisma.course.findMany({
      where,
      orderBy: { start_at: 'asc' },
      select: {
        id: true,
        name: true,
        start_at: true,
        end_at: true,
        CourseImg: {
          take: 1,
          orderBy: { id: 'desc' },
          select: { img: true },
        },

        CourseVariant: {
          select: {
            id: true,
            price: true,
            difficulty: true,
            boardtype_id: true,
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    const result = courses.map((c) => {
      const fmt = (date) =>
        new Date(date).toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      return {
        id: c.id,
        name: c.name,
        // 例如 "2025/01/01~2025/01/05"
        period: `${fmt(c.start_at)}~${fmt(c.end_at)}`,
        photo: c.CourseImg[0]?.img || null,
        price: c.CourseVariant[0]?.price || null,
        location: c.CourseVariant[0]?.location.name || null,
        boardtype: c.CourseVariant[0]?.boardtype_id || null,
        difficulty: c.CourseVariant[0]?.difficulty,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('取得課程列表失敗：', error);
    res.status(500).json({ message: '伺服器錯誤，無法讀取課程列表' });
  }
});

// 篩選項目
// GET /api/courses/filters
router.get('/filters', async (_, res) => {
  try {
    const [boardTypes, locations, difficulties] = await Promise.all([
      prisma.boardtype.findMany({ select: { name: true } }),
      prisma.location.findMany({ select: { name: true } }),
      prisma.courseVariant.findMany({
        distinct: ['difficulty'],
        select: { difficulty: true },
      }),
    ]);
    res.json({
      boardTypes: boardTypes.map((b) => b.name),
      locations: locations.map((l) => l.name),
      difficulties: difficulties.map((d) => d.difficulty),
    });
  } catch (e) {
    res.status(500).send('篩選清單錯誤');
  }
});

// 課程報名頁
router.get('/:id/sign-up', async (req, res) => {
  const courseId = parseInt(req.params.id, 10);
  if (isNaN(courseId)) {
    return res.status(400).json({ error: '無效的課程id' });
  }
  try {
    // 撈出課程關聯資料
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
        start_at: true,
        end_at: true,
        CourseImg: { select: { id: true, img: true } },
        CourseVariant: {
          select: {
            id: true,
            difficulty: true,
            price: true,
            duration: true,
            coach_id: true,
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    // 若找不到資料則回傳 404
    if (!course) {
      return res.status(404).json({ error: '找不到該課程' });
    }

    // 格式化日期為 YYYY/MM/DD
    const fmt = (dt) =>
      new Date(dt).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    // 組成前端易讀的 courseinfo
    const courseinfo = {
      id: course.id,
      name: course.name,
      description: course.description,
      content: course.content,
      period: `${fmt(course.start_at)} ~ ${fmt(course.end_at)}`,
      images: course.CourseImg.map((i) => i.img),
      variants: course.CourseVariant.map((v) => ({
        id: v.id,
        difficulty: v.difficulty,
        price: v.price,
        duration: v.duration,
        max_people: v.max_people,
        start_at: fmt(v.start_at),
        image: v.courseImg?.img || null,
        coach_id: v.coach_id,
        location_id: v.location
          ? {
              id: v.location.id,
              name: v.location.name,
            }
          : null,
      })),
    };

    // 回傳 JSON
    res.json(courseinfo);
  } catch (error) {
    console.error('取得課程資訊失敗:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 課程詳細頁
router.get('/:id', async (req, res) => {
  const courseId = parseInt(req.params.id, 10);
  if (isNaN(courseId)) {
    // 如果參數不是數字回傳400
    return res.status(400).json({ message: '無效的課程id' });
  }
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
        start_at: true,
        end_at: true,

        CourseImg: {
          select: { img: true },
        },
        CourseVariant: {
          select: {
            id: true,
            difficulty: true,
            price: true,
            duration: true,
            // boardtype_id: true,
            // location_id: true,
            coach: {
              select: { id: true, name: true, profilephoto: true },
            },
            boardtype: {
              select: { id: true, name: true },
            },
            courseImg: {
              select: { img: true },
            },
            location: {
              select: {
                id: true,
                name: true,
                country: true,
                city: true,
                address: true,
                latitude: true,
                longitude: true,
              },
            },
          },
          orderBy: { start_at: 'asc' },
        },
        CourseTag: {
          select: {
            tag: { select: { name: true } },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: '找不到該課程' });
    }

    //  平整資料結構，回傳給前端
    const fmtDate = (d) =>
      new Date(d).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    const result = {
      id: course.id,
      name: course.name,
      description: course.description,
      content: course.content,
      period: `${fmtDate(course.start_at)}~${fmtDate(course.end_at)}`,
      // 多張圖片
      images: course.CourseImg.map((i) => i.img),
      difficulty: course.CourseVariant[0].difficulty,
      // boardtype: course.CourseVariant[0].boardtype_id,
      price: course.CourseVariant[0].price,
      duration: course.CourseVariant[0].duration,
      variants: course.CourseVariant.map((v) => ({
        // id: v.id,
        // difficulty: v.difficulty,
        // price: v.price,
        // duration: v.duration,
        // locationId: v.location_id,
        coach: {
          id: v.coach.id,
          name: v.coach.name,
          photo: v.coach.profilephoto,
        },
        boardtype: {
          id: v.boardtype.id,
          name: v.boardtype.name,
        },
        photo: v.courseImg?.img ?? null,
        location: {
          id: v.location.id,
          name: v.location.name,
          country: v.location.country,
          city: v.location.city,
          address: v.location.address,
          latitude: v.location.latitude,
          longitude: v.location.longitude,
        },
      })),
      // 標籤
      tags: course.CourseTag.map((ct) => ct.tag.name),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('取得課程資訊失敗:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

router.post('/:id/sign-up', async (req, res) => {
  // 1. 取出 URL 上的 course_variant_id
  const courseVariantId = Number(req.params.id);
  if (Number.isNaN(courseVariantId)) {
    return res
      .status(400)
      .json({ status: 'fail', message: '無效的 course_variant_id' });
  }

  // 2. 從 body 讀資料
  const { name, phone, email, birthday, user_id } = req.body;
  const userId = Number(user_id);

  // 3. 基本欄位驗證
  if (!name || !phone || !email || Number.isNaN(userId)) {
    return res
      .status(400)
      .json({ status: 'fail', message: '缺少必要欄位或 user_id 不正確' });
  }

  try {
    // 4. 建立關聯：只用 connect，不要同時填 id 欄位
    const record = await prisma.courseVariantUser.create({
      data: {
        name,
        phone,
        email,
        birthday: birthday ? new Date(birthday) : null,
        // course_variant: { connect: { id: courseVariantId } },
        // user: { connect: { id: userId } },
        course_variant_id: courseVariantId, // ← 直接指定 FK
        user_id: userId, // ← 直接指定 FK
      },
    });

    return res.json({ status: 'success', data: record });
  } catch (error) {
    console.error('建立報名失敗：', error);
    return res
      .status(500)
      .json({ status: 'error', message: '伺服器錯誤，報名失敗' });
  }
});
export default router;
