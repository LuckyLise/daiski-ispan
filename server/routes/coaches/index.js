import express from 'express';
import prisma from '../../lib/prisma.js';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

const storageCover = multer.diskStorage({
  destination: (req, file, cb) => {
    //     // 取出courseId
    const courseId = req.params.courseId;
    // 封面圖放到 public/courseImages/{courseId}/
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'courseImages',
      String(courseId)
    );
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, name);
  },
});
const uploadCover = multer({ storage: storageCover });

// multer上傳設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/courseImages';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  // 檔名加時間戳避免重複
  filename(req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });
const upload = multer({ storage: multer.memoryStorage() });

// 會員中心 已報名/已建立
router.get('/me/courses', authenticate, async (req, res) => {
  const userId = req.user.id;
  const isCoach = req.user.is_coach === 1;

  try {
    // ----------- 報名課程 -----------
    const studentRecords = await prisma.courseVariantUser.findMany({
      where: {
        user_id: userId,
        course_variant: {
          course: { deleted_at: null },
        },
      },
      select: {
        course_variant: {
          select: {
            start_at: true,
            // coach: { select: { name: true } },
            coach_id: true,

            course: {
              select: {
                id: true,
                name: true,
                start_at: true,
                end_at: true,
                CourseImg: {
                  take: 1,
                  select: { img: true },
                },
              },
            },
          },
        },
      },
    });

    const asStudent = studentRecords
      .filter((r) => r.course_variant && r.course_variant.course)
      .map((r) => {
        const variant = r.course_variant;
        const course = variant.course;
        const start = new Date(course.start_at).toLocaleDateString('zh-TW');
        const end = new Date(
          course.end_at || variant.start_at
        ).toLocaleDateString('zh-TW');
        return {
          id: course.id,
          name: course.name,
          date: `${start} ~ ${end}`,
          photo: course.CourseImg?.[0]?.img || '/default.jpg',
          // coachName: variant.coach.name,
        };
      });

    // ----------- 教練開課 -----------
    let asCoach = [];
    if (isCoach) {
      // const isCoach = await prisma.coach.findUnique({

      // })

      const coachCourses = await prisma.courseVariant.findMany({
        where: {
          coach_id: userId,
          course: { deleted_at: null },
        },
        orderBy: { start_at: 'asc' },
        select: {
          start_at: true,
          coach_id: true,
          course: {
            select: {
              id: true,

              name: true,
              start_at: true,
              end_at: true,
              CourseImg: {
                take: 1,
                select: { img: true },
              },
            },
          },
        },
      });

      asCoach = coachCourses
        .filter((r) => r.course)
        .map((r) => {
          const c = r.course;
          const start = new Date(c.start_at).toLocaleDateString('zh-TW');
          const end = new Date(c.end_at || r.start_at).toLocaleDateString(
            'zh-TW'
          );
          return {
            id: c.id,
            name: c.name,
            date: `${start} ~ ${end}`,
            photo: c.CourseImg?.[0]?.img || '/default.jpg',
            coach_id: r.coach_id,
          };
        });
    }

    return res.json({ asStudent, asCoach });
    // return res.json({ coachCourses });
  } catch (err) {
    console.error('取得會員課程錯誤:', err);
    return res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 購物車取消報名
router.delete('/cancel/:variantId', authenticate, async (req, res) => {
  const userId = req.user.id;
  const variantId = Number(req.params.variantId);

  try {
    const record = await prisma.courseVariantUser.findFirst({
      where: {
        user_id: userId,
        course_variant_id: variantId,
      },
    });

    if (!record) {
      return res.status(404).json({ message: '沒有報名這門課' });
    }

    // 找到了就刪除
    await prisma.courseVariantUser.delete({
      where: {
        id: record.id,
      },
    });

    return res.json({ message: '已成功取消報名' });
  } catch (err) {
    console.error('取消報名失敗:', err);
    return res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 抓教練列表
router.get('/', async function (req, res) {
  try {
    const coaches = await prisma.coach.findMany({
      select: {
        id: true,
        name: true,
        profilephoto: true,
        LanguageCoach: {
          select: {
            language: {
              select: { name: true },
            },
          },
        },
        BoardtypeCoach: {
          select: {
            boardtype: {
              select: { name: true },
            },
          },
        },
      },
    });
    const result = coaches.map((coach) => ({
      id: coach.id,
      name: coach.name,
      profilephoto: coach.profilephoto,
      languages: coach.LanguageCoach.map((cl) => cl.language.name),
      boardtypes: coach.BoardtypeCoach.map((cl) => cl.boardtype.name),
    }));
    res.status(200).json(result);
  } catch (error) {
    console.error('取得教練列表失敗：', error);
    res.status(500).json({ message: '伺服器錯誤，無法讀取教練資料' });
  }
});
// 教練詳細頁
router.get('/:id', async (req, res) => {
  const coachId = parseInt(req.params.id, 10);
  if (isNaN(coachId)) {
    // 如果參數不是數字回傳400
    return res.status(400).json({ message: '無效的教練id' });
  }
  try {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: {
        id: true,
        name: true,
        profilephoto: true,
        bio: true,
        experience: true,
        LanguageCoach: {
          select: {
            language: { select: { name: true } },
          },
        },
        BoardtypeCoach: {
          select: {
            boardtype: { select: { name: true } },
          },
        },
        LicenseCoach: {
          select: {
            license: { select: { name: true } },
          },
        },
        CourseVariant: {
          orderBy: { start_at: 'asc' },
          select: {
            start_at: true,
            course: {
              select: {
                id: true,
                name: true,
                CourseImg: {
                  take: 1,
                  select: { img: true },
                },
              },
            },
          },
        },
      },
    });
    if (!coach) {
      return res.status(404).json({ message: '找不到教練' });
    }
    const result = {
      id: coach.id,
      name: coach.name,
      profilephoto: coach.profilephoto,
      bio: coach.bio,
      experience: coach.experience,
      languages: coach.LanguageCoach.map((cl) => cl.language.name),
      boardtypes: coach.BoardtypeCoach.map((cb) => cb.boardtype.name),
      license: coach.LicenseCoach.map((cl) => cl.license.name),
      courses: coach.CourseVariant.map((cv) => ({
        name: cv.course.name,
        id: cv.course.id,
        date: new Date(cv.start_at).toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        photo: cv.course.CourseImg[0]?.img || null,
      })),
    };
    res.status(200).json(result);
  } catch (error) {
    console.error('取得教練資訊失敗:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 教練建立課程
router.post(
  '/:id/create',
  upload.array('images', 5), //  先跑圖片上傳

  [
    /* ---------- ② express-validator 基本欄位檢查 ---------- */
    body('name').notEmpty().withMessage('課程名稱必填'),
    body('description').notEmpty(),
    body('content').notEmpty(),
    body('difficulty').isIn(['初級', '中級', '高級']),
    body('price').isFloat({ min: 0 }),
    body('duration').isInt({ min: 1 }),
    body('max_people').isInt({ min: 1 }),
    body('location_id').custom((v, { req }) => {
      if (v === 'other') {
        if (!req.body.new_name?.trim()) throw new Error('雪場名稱必填');
        if (!req.body.new_country?.trim()) throw new Error('國家必填');
        if (!req.body.new_city?.trim()) throw new Error('城市必填');
      } else if (!/^\d+$/.test(v)) {
        throw new Error('location_id 格式錯誤');
      }
      return true;
    }),
    body('coach_id').isInt(),
    body('boardtype_id').isInt(),
    body('start_at').isISO8601(),
    body('end_at').isISO8601(),
  ],
  async (req, res) => {
    console.log('進來 create 路由了');
    /* ---------- ③ 驗證失敗回 400 ---------- */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }
    // ---------- 解析地點 ----------
    let locId = Number(req.body.location_id);
    if (req.body.location_id === 'other') {
      const { new_name, new_country, new_city, new_address, new_lat, new_lng } =
        req.body;

      // ① 先查重：同名同國城市 → 直接用舊 id
      const existed = await prisma.location.findFirst({
        where: { name: new_name, country: new_country, city: new_city },
      });

      if (existed) locId = existed.id;
      else {
        // ② 新增 location
        const newLoc = await prisma.location.create({
          data: {
            name: new_name,
            country: new_country,
            city: new_city,
            address: new_address || null,
            latitude: new_lat ? Number(new_lat) : null,
            longitude: new_lng ? Number(new_lng) : null,
          },
        });
        locId = newLoc.id;
      }
    }
    /* ---------- ④ 解析表單欄位 ---------- */
    const {
      name,
      description,
      content,
      start_at,
      end_at,
      difficulty,
      price,
      duration,
      max_people,
      location_id,
      coach_id,
      boardtype_id,
      tags,
    } = req.body;
    console.log(req.body);
    /* ---------- ⑤ 處理圖片 ---------- */
    const files = req.files || [];

    if (!files.length) {
      return res
        .status(400)
        .json({ status: 'fail', message: '請至少上傳一張圖片' + files.length });
    }
    // 每張圖存到 courseImages
    const imgBulkData = files.map((f, idx) => ({
      img: `public/courseImages/${req.params.id}/${f.filename}`,
    }));

    /* ---------- ⑥ 處理 TAG：轉成陣列 ---------- */
    let tagList = [];
    if (tags) {
      try {
        // 前端若送 JSON 字串 ["粉雪","北海道"]
        tagList = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        // 退而求其次：逗號字串 "粉雪,北海道"
        tagList = String(tags)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    /* ---------- ⑦ Prisma Transaction ---------- */
    try {
      const created = await prisma.$transaction(async (tx) => {
        /* ① course 主表 */
        const course = await tx.course.create({
          data: {
            name,
            description,
            content,
            start_at: new Date(start_at),
            end_at: new Date(end_at),
          },
        });

        //
        const courseId = course.id;

        // —— ② 建資料夾 & 寫檔 ——
        // 圖片要放在 public/courseImages/{courseId}/
        const dir = path.join('public', 'courseImages', String(courseId));
        fs.mkdirSync(dir, { recursive: true });

        // 準備要批次寫到 CourseImg table 的資料
        const imgBulkData = [];
        for (const file of files) {
          //   // 自訂一個唯一檔名：用 timestamp + 原始副檔名
          //   const filename = `${Date.now()}-${Math.round(
          //     Math.random() * 1e6
          //   )}${path.extname(file.originalname)}`;
          //   const fullPath = path.join(destDir, filename);
          const filename = `${Date.now()}${path.extname(file.originalname)}`;
          const filepath = path.join(dir, filename);

          // 把 buffer 寫到硬碟
          fs.writeFileSync(filepath, file.buffer);

          // 將這個檔案要存到 DB 的路徑 push 進去
          imgBulkData.push({
            course_id: courseId,
            // 這裡存到 DB 時，只要存「/courseImages/{courseId}/{filename}」
            img: `/courseImages/${courseId}/${filename}`,
          });
        }

        // —— ③ 批次插入 course_img table ——
        await tx.courseImg.createMany({ data: imgBulkData });

        // 找第一張當作封面 (order=0 理論上是第一筆)
        const coverImg = await tx.courseImg.findFirst({
          where: { course_id: courseId },
          select: { id: true },
        });

        /* ④ 建 course_variant */
        await tx.courseVariant.create({
          data: {
            course_id: course.id,
            difficulty,
            price: Number(price), // 你若 Prisma schema 改 Decimal 就存 Number(price)
            duration: Number(duration),
            max_people: Number(max_people),
            location_id: locId,
            coach_id: Number(coach_id),
            boardtype_id: Number(boardtype_id),
            course_img_id: coverImg.id,
            start_at: new Date(start_at),
          },
        });

        /* ⑤ tag upsert + 關聯 */
        // for (const t of tagList) {
        //   const existing = await prisma.tag.findFirst({
        //     where: { name: t },
        //   });

        //   if (existing) {
        //     await tx.courseTag.create({
        //       data: { course_id: course.id, tag_id: existing.id },
        //     });
        //   } else {
        //     await tx.tag.create({
        //       data: { name: t },
        //     });
        //   }
        // }
        // if (Array.isArray(tagList) && tagList.length) {
        //   for (const t of tagList) {
        //     let tag = await tx.tag.findFirst({ where: { name: t } });
        //     if (!tag) {
        //       tag = await tx.tag.create({ data: { name: t } });
        //     }
        //     await tx.courseTag.create({
        //       data: { course_id: course.id, tag_id: tag.id },
        //     });
        //   }
        // }
        const existingCourseTags = await tx.courseTag.findMany({
          where: { course_id: +courseId },
          select: {
            id: true, // courseTag 的主鍵
            tag_id: true,
            tag: { select: { name: true } }, // 預設你在 CourseTag model 有 relation 到 Tag
          },
        });
        // existingCourseTags 範例：
        // [
        //   { id: 101, tag_id: 5, tag: { name: "粉雪" } },
        //   { id: 102, tag_id: 8, tag: { name: "北海道" } },
        //   …
        // ]

        // 建立兩個映射：舊有 tagName[]、舊有 courseTagIdByTagName
        // const oldTagNames = existingCourseTags.map((ct) => ct.tag.name);
        // const courseTagIdByTagName = {};
        // existingCourseTags.forEach((ct) => {
        //   courseTagIdByTagName[ct.tag.name] = ct.id;
        // });

        // // 2.2 算出要刪除的標籤名稱：oldTagNames 中有但 new tagIds 裡沒有的
        // const toDeleteNames = oldTagNames.filter(
        //   (name) => !tagList.includes(name)
        // );
        // // 2.3 算出要新增的標籤名稱：new tagIds 中有但 oldTagNames 裡沒有的
        // const toAddNames = tagList.filter(
        //   (name) => !oldTagNames.includes(name)
        // );

        // // 2.4 處理刪除：把 toDeleteNames 對應的 courseTag 紀錄刪除
        // if (toDeleteNames.length) {
        //   // 先拿到要刪除的 courseTag id 清單
        //   const idsToDel = toDeleteNames.map(
        //     (name) => courseTagIdByTagName[name]
        //   );
        //   await tx.courseTag.deleteMany({
        //     where: { id: { in: idsToDel } },
        //   });
        // }

        // // 2.5 處理新增：對於每個 toAddNames
        // for (const t of toAddNames) {
        //   // 先用 findFirst 查有沒有同名的 Tag
        //   let tag = await tx.tag.findFirst({ where: { name: t } });
        //   if (!tag) {
        //     // 如果不存在，就 create 一筆新的 Tag
        //     tag = await tx.tag.create({ data: { name: t } });
        //   }
        //   // 然後再在 CourseTag 建立關聯
        //   await tx.courseTag.create({
        //     data: { course_id: +courseId, tag_id: tag.id },
        //   });
        // }
        return course;
        // transaction 回傳
      });
      console.log(created);
      return res.json({ status: 'success', data: created });
    } catch (err) {
      console.error('Create course error:', err);
      return res
        .status(500)
        .json({ status: 'fail', message: '伺服器錯誤，無法建立課程' });
    }
  }
);

// 取單一課程給編輯頁用的
router.get('/:coachId/courses/:courseId/edit', async (req, res) => {
  const { coachId, courseId } = req.params;
  console.log(req.params);
  const course = await prisma.course.findFirst({
    where: { id: +courseId, deleted_at: null }, // ← 條件同 PUT
    include: {
      CourseVariant: {
        where: { coach_id: +coachId },
      },
      CourseImg: true,
      CourseTag: { include: { tag: true } },
      // Boardtype:{

      // }
    },
  });
  if (!course || !course.CourseVariant.length) {
    // console.log('DB 查不到：', { id: +courseId, coachId: +coachId });
    return res.status(404).json({ message: 'not found' });
  }

  /* ↓ 把資料整理成前端需要的形狀（最少做到 tags & images） */
  const initData = {
    ...course,
    boardtype_id: course.CourseVariant[0].boardtype_id,
    difficulty: course.CourseVariant[0].difficulty,
    content: course.content,
    price: course.CourseVariant[0].price,
    duration: course.CourseVariant[0].duration,
    max_people: course.CourseVariant[0].max_people,
    location_id: course.CourseVariant[0].location_id,
    start_at: course.CourseVariant[0].start_at.toISOString().slice(0, 16),
    // end_at: course.CourseVariant[0].end_at.toISOString().slice(0, 16),
    tags: course.CourseTag.map((ct) => ct.tag.name).join(','),
    // 封面只傳第一張路徑，省得 FormData 再處理
    cover: course.CourseImg[0]?.img || '',
  };

  return res.json(initData);
  // return res.json(course); // ← 找到時一定要把資料丟回去
});

// update修改課程
// 更新（PUT）
router.put(
  '/:coachId/courses/:courseId',
  authenticate,
  upload.single('images'),
  async (req, res) => {
    console.log('okyo');
    console.log('>>> 後端 req.file =', req.file);
    const { coachId, courseId } = req.params;
    console.log({ coachId, courseId });

    // 權限檢查 – 可根據 session / jwt 驗證
    if (+req.user || +req.user.id !== +coachId)
      console.log('>>> 後端 req.body.tagIds =', req.body.tagIds);

    // return res.status(403).json({ message: '無權限' });

    const {
      name,
      description,
      content,
      start_at,
      end_at,
      difficulty,
      price = 0,
      duration = 0,
      max_people = 0,
      boardtype_id,
      location_id,
      tagIds = [],
      delete_ids = [],
    } = req.body;

    // 如果前端有傳 cover，multer 會把它放到 req.file
    // 如果沒傳就跳過封面更新

    try {
      const file = req.file;
      // console.log(newCoverFile);
      // 準備要批次寫到 CourseImg table 的資料
      const imgBulkData = [];
      //   // 自訂一個唯一檔名：用 timestamp + 原始副檔名
      //   const filename = `${Date.now()}-${Math.round(
      //     Math.random() * 1e6
      //   )}${path.extname(file.originalname)}`;
      //   const fullPath = path.join(destDir, filename);
      const dir = path.join('public', 'courseImages', String(courseId));
      const filename = `${Date.now()}${path.extname(file.originalname)}`;
      const filepath = path.join(dir, filename);

      // 把 buffer 寫到硬碟
      fs.writeFileSync(filepath, file.buffer);

      // 將這個檔案要存到 DB 的路徑 push 進去
      imgBulkData.push({
        course_id: +courseId,
        // 這裡存到 DB 時，只要存「/courseImages/{courseId}/{filename}」
        img: `/courseImages/${courseId}/${filename}`,
      });

      // —— ③ 批次插入 course_img table ——
      await prisma.courseImg.createMany({ data: imgBulkData });

      await prisma.$transaction(async (tx) => {
        // 1) 更新主表
        await tx.course.update({
          where: { id: +courseId },
          data: {
            name,
            description,
            content,
            start_at: new Date(start_at), // ← 新增
            end_at: new Date(end_at), // ← 新增
          },
        });
        await tx.courseVariant.updateMany({
          where: { course_id: +courseId, coach_id: +coachId },
          data: {
            start_at: new Date(start_at),
            difficulty,
            price: +price,
            duration: +duration,
            max_people: +max_people,
            boardtype_id: +boardtype_id,
            location_id: +location_id,
          },
        });

        /* 2) 先刪除使用者勾掉的舊圖（若有） */
        // const idsToDel = Array.isArray(delete_ids)
        //   ? delete_ids.map(Number).filter(Boolean)
        //   : [];
        // if (idsToDel.length) {
        //   await tx.courseImg.deleteMany({
        //     where: { id: { in: idsToDel }, course_id: +courseId },
        //   });
        // }

        /* 3) 再新增這次上傳的檔案（若有） */
        if (req.files?.length) {
          await Promise.all(
            req.files.map((f) =>
              tx.courseImg.create({
                data: { course_id: +courseId, img: f.buffer }, // 建議改存 URL
              })
            )
          );
        }

        // 2) 處理新上傳圖片（可先刪再增，或比對差異）
        // if (req.files.length) {
        //   await tx.courseImg.deleteMany({ where: { course_id: +courseId } });
        //   await Promise.all(
        //     req.files.map((f) =>
        //       tx.courseImg.create({
        //         data: { course_id: +courseId, img: f.buffer },
        //       })
        //     )
        //   );
        // }
        /* ------------------------ 2) 處理標籤：只刪掉使用者取消的，新增新的 ------------------------ */

        // 2.1 先拿出舊有的 CourseTag 關聯，以及對應的 Tag.name
        const existingCourseTags = await tx.courseTag.findMany({
          where: { course_id: +courseId },
          select: {
            id: true, // courseTag 的主鍵
            tag_id: true,
            tag: { select: { name: true } }, // 預設你在 CourseTag model 有 relation 到 Tag
          },
        });
        // existingCourseTags 範例：
        // [
        //   { id: 101, tag_id: 5, tag: { name: "粉雪" } },
        //   { id: 102, tag_id: 8, tag: { name: "北海道" } },
        //   …
        // ]

        // 建立兩個映射：舊有 tagName[]、舊有 courseTagIdByTagName
        const oldTagNames = existingCourseTags.map((ct) => ct.tag.name);
        const courseTagIdByTagName = {};
        existingCourseTags.forEach((ct) => {
          courseTagIdByTagName[ct.tag.name] = ct.id;
        });

        // 2.2 算出要刪除的標籤名稱：oldTagNames 中有但 new tagIds 裡沒有的
        const toDeleteNames = oldTagNames.filter(
          (name) => !tagIds.includes(name)
        );
        // 2.3 算出要新增的標籤名稱：new tagIds 中有但 oldTagNames 裡沒有的
        const toAddNames = tagIds.filter((name) => !oldTagNames.includes(name));

        // 2.4 處理刪除：把 toDeleteNames 對應的 courseTag 紀錄刪除
        if (toDeleteNames.length) {
          // 先拿到要刪除的 courseTag id 清單
          const idsToDel = toDeleteNames.map(
            (name) => courseTagIdByTagName[name]
          );
          await tx.courseTag.deleteMany({
            where: { id: { in: idsToDel } },
          });
        }

        // 2.5 處理新增：對於每個 toAddNames
        for (const t of toAddNames) {
          // 先用 findFirst 查有沒有同名的 Tag
          let tag = await tx.tag.findFirst({ where: { name: t } });
          if (!tag) {
            // 如果不存在，就 create 一筆新的 Tag
            tag = await tx.tag.create({ data: { name: t } });
          }
          // 然後再在 CourseTag 建立關聯
          await tx.courseTag.create({
            data: { course_id: +courseId, tag_id: tag.id },
          });
        }
      });

      res.json({ message: '更新成功' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '更新失敗' });
    }
  }
);

//delete 刪除課程（軟刪除）
router.delete('/:coachId/courses/:courseId', authenticate, async (req, res) => {
  const coachId = req.user.id;
  const { courseId } = req.params;

  const variant = await prisma.courseVariant.findFirst({
    where: { course_id: +courseId, coach_id: +coachId },
  });

  if (!variant) {
    return res.status(403).json({ message: '無權限或課程不存在' });
  }

  await prisma.course.update({
    where: { id: +courseId },
    data: { deleted_at: new Date() },
  });

  return res.json({ message: '課程已刪除' });
});

export default router;
