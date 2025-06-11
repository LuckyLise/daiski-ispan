// server/routes/group/index.js
import express from 'express';
import { PrismaClient, ActivityType, SkiDifficulty } from '@prisma/client'; // 確保 ActivityType 被正確引入
import multer from 'multer';
import path from 'path';
import authenticate from '../../middlewares/authenticate.js'; // <--- 引入您的 authenticate 中介軟體，請確保路徑正確

const router = express.Router();
const prisma = new PrismaClient();

// Multer 設定 (保持不變)
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join(process.cwd(), 'public', 'uploads'));
    },
    filename(req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

// parseYMD 函式 (保持不變)
function parseYMD(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(str + 'T00:00:00Z'); // 使用 UTC 以避免時區問題
  return isNaN(d.getTime()) ? null : d;
}
// --- 新增的 API 端點：獲取最新揪團 ---
// GET /api/group/latest
router.get('/latest', async (req, res, next) => {
  try {
    // 你可以透過查詢參數來決定要獲取幾筆，預設為 4 筆
    const limit = parseInt(req.query.limit) || 4;

    const latestGroupsFromDb = await prisma.group.findMany({
      where: {
        deletedAt: null, // 排除已軟刪除的揪團
        // endDate: { // 可選：只顯示尚未結束的揪團
        //   gte: new Date(),
        // }
      },
      orderBy: {
        createdAt: 'desc', // 根據創建時間倒序排列
      },
      take: limit, // 取回指定的筆數
      include: {
        // 包含顯示卡片所需的基本資訊
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        images: {
          select: {
            imageUrl: true,
          },
          orderBy: { sortOrder: 'asc' },
          take: 1, // 通常列表卡片只需要第一張圖
        },
        location: {
          // 如果是滑雪團，需要地點名稱
          select: { name: true },
        },
        _count: {
          // 如果需要顯示目前人數
          select: { members: true },
        },
      },
    });

    // 轉換資料格式以符合前端卡片需求
    const latestGroupsForFrontend = latestGroupsFromDb.map((group) => {
      const {
        _count,
        location,
        customLocation,
        type: groupType,
        images,
        ...restOfGroup
      } = group;

      let displayLocation = '地點未定';
      if (groupType === ActivityType.SKI && location) {
        displayLocation = location.name;
      } else if (customLocation) {
        // 其他類型，或滑雪但無關聯地點時，優先用 customLocation
        displayLocation = customLocation;
      } else if (location) {
        // 若無 customLocation 但有關聯地點
        displayLocation = location.name;
      }

      let displayType = groupType; // 預設為 Enum Key
      if (groupType === ActivityType.MEAL)
        displayType = '美食團'; // 根據圖片範例
      else if (groupType === ActivityType.SKI) displayType = '滑雪團'; // 假設的滑雪團顯示文字
      // 你可以根據需要擴展其他 ActivityType 的顯示名稱

      return {
        ...restOfGroup,
        type: displayType, // 使用轉換後的類型顯示名稱
        originalType: groupType, // 保留原始類型，以便前端可能需要的邏輯判斷
        location: displayLocation,
        currentPeople: _count?.members || 0,
        // 確保圖片路徑，若無則使用預設圖
        imageUrl:
          images && images.length > 0 ? images[0].imageUrl : '/deadicon.png', // 使用你專案中的預設圖示
      };
    });

    res.json(latestGroupsForFrontend);
  } catch (err) {
    console.error('獲取最新揪團失敗:', err);
    next(err); // 將錯誤傳遞給 Express 的錯誤處理中介軟體
  }
});
// --- 最新揪團 API 端點結束 ---
// GET /api/group/summary (計算首頁上所有團/揪團中/已成團)
router.get('/summary', async (req, res, next) => {
  try {
    const currentDate = new Date(); // 獲取當前伺服器時間

    // 1. 總揪團數量 (totalGroups)
    // 計算所有未被軟刪除 (deletedAt 為 null) 的揪團總數
    const totalGroups = await prisma.group.count({
      where: {
        deletedAt: null,
      },
    });

    // 2. 揪團中數量 (ongoingGroups)
    // 計算未被軟刪除，且 startDate (開始日期) 在未來 (大於當前時間) 的揪團數量
    const ongoingGroups = await prisma.group.count({
      where: {
        deletedAt: null,
        startDate: {
          gt: currentDate, // gt (greater than) 表示大於
        },
      },
    });

    // 3. 已成團數量 (formedGroups)
    // 計算未被軟刪除，且 startDate (開始日期) 在過去或今天 (小於等於當前時間)，
    // 並且 endDate (結束日期) 在未來 (大於當前時間) 的揪團數量。
    const potentialFormedGroups = await prisma.group.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        minPeople: true, // 只需要 minPeople 欄位
        _count: {
          select: { members: true }, // 和成員數量
        },
      },
    });

    let actualFormedGroupsCount = 0;
    for (const group of potentialFormedGroups) {
      if (group._count.members >= group.minPeople) {
        actualFormedGroupsCount++;
      }
    }

    // 回傳 JSON 格式的統計數據
    res.status(200).json({
      totalGroups,
      ongoingGroups,
      formedGroups: actualFormedGroupsCount, // 使用新的計算結果
    });
  } catch (error) {
    // 如果發生錯誤，記錄錯誤並傳遞給下一個錯誤處理中介軟體
    console.error('獲取揪團統計數據時發生錯誤:', error);
    next(error); // 將錯誤傳遞給 Express 的錯誤處理機制
  }
});
// --- 統計數據 API 端點結束 ---
// POST /api/group (創建揪團的路由)
router.post(
  '/',
  authenticate,
  upload.single('cover'),
  async (req, res, next) => {
    try {
      const {
        type: rawType,
        title,
        start_date,
        end_date,
        location: locationInput, // 前端傳來的地點，可能是 location_id (滑雪) 或 地點名稱 (聚餐)
        customLocation: customLocationInput,
        difficulty: rawDifficulty, // 前端可能也會傳這個，或者合併到 locationInput 處理
        min_people,
        max_people,
        price,
        allow_newbie,
        description,
        // userId, // 正式環境應從 session 或 token 獲取
      } = req.body;

      // **直接從 req.user (由 authenticate 中介軟體設定) 獲取 organizerId **
      const organizerId = req.user?.id; // 假設 JWT payload 中的使用者 ID 欄位是 'id'
      if (!organizerId) {
        // 這個情況理論上不應該發生，因為 authenticate 中介軟體會先處理
        // 但作為防禦性程式設計，可以保留
        console.error(
          '[POST /group] authenticate 中介軟體通過，但 req.user.id 未定義'
        );
        return res.status(401).json({ error: '未授權操作，無法識別用戶。' });
      }

      const labelToKey = { 滑雪: ActivityType.SKI, 聚餐: ActivityType.MEAL };
      let typeKey;
      if (labelToKey[rawType]) {
        typeKey = labelToKey[rawType];
      } else if (Object.values(ActivityType).includes(rawType)) {
        typeKey = rawType;
      } else {
        return res.status(400).json({ error: `無效的活動類型：${rawType}` });
      }

      const sd = parseYMD(start_date);
      const ed = parseYMD(end_date);
      if (!sd || !ed) {
        return res.status(400).json({ error: '日期格式錯誤，請用 yyyy-MM-dd' });
      }
      if (ed < sd) {
        return res.status(400).json({ error: '結束日期不能早於開始日期' });
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const data = {
        organizerId: Number(organizerId), // 關聯到創建者
        type: typeKey,
        title,
        startDate: sd,
        endDate: ed,
        minPeople: Number(min_people),
        maxPeople: Number(max_people),
        price: Number(price),
        allowNewbie: allow_newbie === '1' || allow_newbie === true,
        description,
        // createdAt 會自動生成
      };

      if (typeKey === ActivityType.SKI) {
        if (!locationInput) {
          // 滑雪活動必須選擇 locationId
          return res.status(400).json({ error: '滑雪活動必須選擇滑雪場 ID' });
        }
        data.locationId = Number(locationInput);
        data.customLocation = null; // 滑雪活動不應有 customLocation

        // 處理滑雪難易度 (difficulty)
        if (rawDifficulty && rawDifficulty.trim() !== '') {
          const difficultyLabelToKey = {
            初級: SkiDifficulty.BEGINNER,
            中級: SkiDifficulty.INTER,
            進階: SkiDifficulty.ADVANCE,
          };
          const difficultyKeyUpperCase = rawDifficulty.toUpperCase();

          if (difficultyLabelToKey[rawDifficulty]) {
            // 前端傳中文
            data.difficulty = difficultyLabelToKey[rawDifficulty];
          } else if (
            Object.values(SkiDifficulty).includes(difficultyKeyUpperCase)
          ) {
            // 前端傳英文 Enum Key
            data.difficulty = difficultyKeyUpperCase;
          } else {
            console.warn(
              `收到無效的滑雪難易度值: ${rawDifficulty}，將不設定難易度 (或設為 null，取決於 schema)。`
            );
            // 如果 schema 中 difficulty 是可選的，不設定此欄位或設為 null 都可以
            // 如果是必需的，這裡應該報錯
            data.difficulty = null; // 假設 schema 允許 null
          }
        } else {
          // 如果前端沒有傳 difficulty，或者滑雪活動允許沒有難易度
          // 根據您的 Prisma schema，difficulty 是 SkiDifficulty? (可選的)
          data.difficulty = null;
        }
      } else {
        // 非滑雪活動
        if (!customLocationInput && !locationInput) {
          // 非滑雪活動至少要有地點描述
          return res
            .status(400)
            .json({ error: '活動必須提供地點或自訂地點名稱' });
        }
        data.customLocation = customLocationInput || locationInput;
        data.locationId = null; // 非滑雪活動不應有 locationId (除非您的設計允許)
        data.difficulty = null; // 非滑雪活動的 difficulty 應為 null
      }
      // 1. 建立 Group 記錄
      const newGroup = await prisma.group.create({ data }); // (Source 1)

      // 2. 建立 GroupImage 記錄 (因為 imageUrl 現在是必填)
      await prisma.groupImage.create({
        // (Source 1)
        data: {
          groupId: newGroup.id, // (Source 1)
          imageUrl, // (Source 1)
          sortOrder: 0, // (Source 1)
        },
      });

      // 3. 【新增】自動將開團者加入 GroupMember 表
      const organizerGroupMember = await prisma.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: organizerId,
          joinedAt: new Date(),
          paidAt: null, // 開團者也需支付，所以初始為 null
        },
        select: {
          id: true, // 只選擇新建立的 groupMember 記錄的 ID
        },
      });

      // 4. 【修改】重新查詢剛建立的揪團，並包含其關聯的圖片資訊
      const groupWithDetails = await prisma.group.findUnique({
        where: { id: newGroup.id },
        include: {
          images: {
            // 依據你的 Prisma Schema (Source 5 from three turns ago)
            select: {
              imageUrl: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
          // 如果前端還需要創建者或地點等其他關聯資料，也可以在這裡 include
          user: { select: { id: true, name: true, avatar: true } }, // 例如，包含開團者基本資訊
          location: { select: { name: true } }, // 例如，包含地點名稱
        },
      });

      if (!groupWithDetails) {
        console.error(
          `[POST /group] Critical: Could not re-fetch group ID: ${newGroup.id}`
        );
        return res
          .status(500)
          .json({ error: '建立揪團成功，但獲取詳細資訊時發生錯誤。' });
      }

      // 5. 【修改】建構回傳給前端的物件，包含 groupMemberId
      const responsePayload = {
        ...groupWithDetails, // 這裡面已經有揪團的詳細資訊，包括 images 陣列
        groupMemberId: organizerGroupMember.id, // 將開團者在 group_member 表中的 ID 一併回傳
      };

      res.status(201).json(responsePayload);
    } catch (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `圖片上傳錯誤: ${err.message}` });
      }
      if (err.message === '僅允許上傳圖片檔案！') {
        return res.status(400).json({ error: err.message });
      }
      if (
        err.code === 'P2003' &&
        err.meta?.field_name?.includes('organizerId')
      ) {
        return res
          .status(400)
          .json({ error: '提供的創建者 ID 無效或不存在。' });
      }
      if (
        err.code === 'P2003' &&
        err.meta?.field_name?.includes('locationId')
      ) {
        return res.status(400).json({ error: '提供的地點 ID 無效或不存在。' });
      }
      console.error('創建揪團失敗:', err);
      return res.status(500).json({ error: '伺服器內部錯誤，創建揪團失敗。' });
    }
  }
);
// GET /api/group?onlyTypes=true  或  GET /api/group
router.get('/', async (req, res, next) => {
  try {
    if (req.query.onlyTypes === 'true') {
      const [col] = await prisma.$queryRaw`
        SHOW COLUMNS FROM \`group\` LIKE 'type'
      `;
      const types =
        col?.Type?.match(/'[^']+'/g).map((s) => s.slice(1, -1)) || [];
      return res.json(types);
    }

    const {
      type,
      date,
      location: locationNameFilter,
      keyword,
      page = 1,
    } = req.query;
    const itemsPerPage = 12; // 您可以根據需求調整每頁顯示的項目數量

    const where = {};
    if (type && type !== '全部') {
      const labelToKey = { 滑雪: ActivityType.SKI, 聚餐: ActivityType.MEAL }; // 確保 ActivityType 中的值與您的 Enum 一致
      if (labelToKey[type]) {
        where.type = labelToKey[type];
      } else if (Object.values(ActivityType).includes(type)) {
        where.type = type;
      }
    }
    if (date) {
      const parsedDate = parseYMD(date);
      if (parsedDate) {
        where.startDate = { lte: parsedDate };
        where.endDate = { gte: parsedDate };
      }
    }
    if (locationNameFilter && locationNameFilter !== '全部') {
      where.OR = [
        {
          location: {
            name: { contains: locationNameFilter },
          },
        },
        {
          customLocation: { contains: locationNameFilter },
        },
      ];
    }
    if (keyword) {
      const keywordCondition = { contains: keyword };
      const keywordOrConditions = [
        { title: keywordCondition },
        { description: keywordCondition },
        { location: { name: keywordCondition } },
        { customLocation: keywordCondition },
        { user: { name: keywordCondition } },
      ];
      if (where.OR) {
        // 如果已經有 OR 條件 (來自地點篩選)
        where.AND = [
          // 將地點篩選和關鍵字篩選用 AND 連接起來
          { OR: where.OR },
          { OR: keywordOrConditions },
        ];
        delete where.OR; // 移除頂層的 OR
      } else {
        where.OR = keywordOrConditions;
      }
    }

    const totalItems = await prisma.group.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const groupsFromDb = await prisma.group.findMany({
      where: { deletedAt: null, ...where },
      skip: (Number(page) - 1) * itemsPerPage,
      take: itemsPerPage,
      include: {
        user: {
          // 開團者資訊
          select: {
            name: true,
            avatar: true,
          },
        },
        images: {
          // 圖片資訊
          select: {
            imageUrl: true,
          },
          orderBy: { sortOrder: 'asc' },
          take: 1, // 通常卡片列表只需要第一張圖片
        },
        location: true, // 地點物件 (包含 name 等欄位)
        _count: {
          select: { members: true }, // *** 修改處：使用 Group 模型中定義的 'members' 關聯 ***
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const groupsForFrontend = groupsFromDb.map((group) => {
      const {
        _count,
        location,
        customLocation,
        type: groupType,
        ...restOfGroup
      } = group;

      let displayLocation = '地點未定';
      if (groupType === ActivityType.SKI && location) {
        displayLocation = location.name;
      } else if (groupType === ActivityType.MEAL && customLocation) {
        // 假設 MEAL 類型使用 customLocation
        displayLocation = customLocation;
      } else if (location) {
        displayLocation = location.name;
      } else if (customLocation) {
        displayLocation = customLocation;
      }

      return {
        ...restOfGroup,
        type: groupType,
        location: displayLocation,
        currentPeople: _count ? _count.members : 0, // *** 修改處：使用 _count.members 來獲取數量 ***
        // maxPeople 應該直接來自 restOfGroup.maxPeople，請確保 Group 模型中有此欄位且有值
      };
    });

    res.json({ groups: groupsForFrontend, totalPages });
  } catch (err) {
    next(err);
  }
});

// GET /api/group/:id  → 回傳一筆 group 的完整資料
router.get('/:groupId', async (req, res, next) => {
  try {
    const id = Number(req.params.groupId);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: '無效的 ID' });
    }

    const group = await prisma.group.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        location: true,
        _count: { select: { members: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              // 每則留言的留言者資訊
              select: { id: true, name: true, avatar: true },
            },
          },
        }, // 如果有留言
      },
    });

    if (!group) {
      return res.status(404).json({ error: '找不到該揪團' });
    }

    // 轉換後端欄位名稱
    const {
      _count,
      images,
      customLocation,
      location,
      user,
      comments,
      ...rest
    } = group;
    const displayLocation =
      group.type === ActivityType.SKI
        ? location?.name // 滑雪活動使用關聯的 Location 名稱
        : customLocation || location?.name; // 其他活動優先使用 customLocation，若無則用關聯 Location 名稱

    res.json({
      ...rest,
      creator: user, // 將 user 重命名為 creator
      location: displayLocation,
      currentPeople: _count?.members || 0,
      images, // 返回所有圖片
      comments, // 返回包含使用者資訊的留言
    });
  } catch (err) {
    console.error(`Error fetching group with id ${req.params.id}:`, err);
    next(err);
  }
});
router.post('/:groupId/join', authenticate, async (req, res) => {
  const { groupId: groupIdString } = req.params;
  const userId = req.user?.id; // 從 authenticate 中介軟體獲取的使用者 ID

  // 1. 基本驗證
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: '未授權，請先登入後再操作。' });
  }
  if (!groupIdString) {
    return res
      .status(400)
      .json({ success: false, message: '缺少必要參數：揪團 ID。' });
  }

  const groupId = parseInt(groupIdString, 10);
  if (isNaN(groupId)) {
    return res
      .status(400)
      .json({ success: false, message: '揪團 ID 格式不正確。' });
  }

  try {
    // 2. 檢查目標揪團是否存在且未被軟刪除
    const groupToJoin = await prisma.group.findUnique({
      where: {
        id: groupId,
        deletedAt: null, // 確保揪團未被軟刪除
      },
      select: {
        // 只需要 maxPeople 來判斷人數
        maxPeople: true,
      },
    });

    if (!groupToJoin) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的揪團，或該揪團已不存在。',
      });
    }

    // 3. 檢查使用者是否已經是該揪團的成員
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        // 依賴您 Prisma schema 中 GroupMember 的 @@unique([groupId, userId])
        // 預設名稱通常是 'groupId_userId'
        groupId_userId: {
          groupId: groupId,
          userId: userId,
        },
      },
    });

    if (existingMembership) {
      return res
        .status(409)
        .json({ success: false, message: '您已經是這個揪團的成員了。' }); // 409 Conflict
    }

    // 4. 檢查揪團是否已滿
    const currentMemberCount = await prisma.groupMember.count({
      where: { groupId: groupId },
    });
    if (currentMemberCount >= groupToJoin.maxPeople) {
      // groupToJoin.maxPeople 從步驟2獲取
      return res
        .status(403)
        .json({ success: false, message: '抱歉，此揪團人數已滿。' });
    }

    // 5. 創建新的 group_member 記錄
    const newMemberEntry = await prisma.groupMember.create({
      data: {
        userId: userId,
        groupId: groupId,
        joinedAt: new Date(), // 設定加入時間為當前時間
        // paidAt 預設為 null (根據您的 schema)
      },
    });

    console.log(
      `使用者 ${userId} 成功加入揪團 ${groupId}。 GroupMember ID: ${newMemberEntry.id}`
    );
    res.status(201).json({
      // 201 Created
      success: true,
      message: '成功加入揪團！',
      groupMemberId: newMemberEntry.id, // 返回新創建的 group_member ID
      data: {
        // 可以選擇性返回新創建的記錄資訊
        groupId: newMemberEntry.groupId,
        userId: newMemberEntry.userId,
        joinedAt: newMemberEntry.joinedAt,
      },
    });
  } catch (error) {
    console.error(`使用者 ${userId} 加入揪團 ${groupId} 時發生錯誤:`, error);
    if (error.code === 'P2002') {
      // Prisma unique constraint violation (雖然前面已檢查，多一層保障)
      return res.status(409).json({
        success: false,
        message: '您似乎已經加入了此揪團 (資料庫記錄衝突)。',
      });
    }
    res.status(500).json({
      success: false,
      message: '加入揪團時伺服器發生錯誤，請稍後再試。',
    });
  }
});
// POST /api/group/:groupId/comments (新增留言)
router.post('/:groupId/comments', authenticate, async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const { content, parentId } = req.body;
    const userId = req.user?.id;

    if (isNaN(groupId)) return res.status(400).json({ error: '無效的群組 ID' });
    if (!userId)
      return res
        .status(401)
        .json({ error: '未授權操作，請先登入以發表留言。' });
    if (!content || typeof content !== 'string' || content.trim() === '')
      return res.status(400).json({ error: '留言內容不可為空' });

    const groupExists = await prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!groupExists)
      return res.status(404).json({ error: '找不到指定的揪團' });

    // 新增:遞迴回覆
    if (parentId) {
      const parentCommentExists = await prisma.groupComment.findUnique({
        where: { id: parseInt(parentId, 10) },
      });
      if (!parentCommentExists) {
        return res
          .status(404)
          .json({ success: false, message: '回覆的目標留言不存在' });
      }
      // 也可以檢查父留言是否屬於同一個 groupId
      if (parentCommentExists.groupId !== groupId) {
        return res
          .status(400)
          .json({ success: false, message: '回覆的目標留言不屬於此揪團' });
      }
    }

    const newCommentData = {
      content: content.trim(),
      groupId: groupId, // 已經是數字
      userId: userId, // 已經是數字
      replyId: parentId ? parseInt(parentId, 10) : null, // 如果有 parentId，則轉換為數字，否則為 null
    };

    const newComment = await prisma.groupComment.create({
      data: newCommentData,
      include: {
        // 返回留言時，帶上用戶資訊
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    res.status(201).json(newComment);
  } catch (err) {
    console.error('新增留言失敗:', err);
    if (err.code === 'P2003' && err.meta?.field_name?.includes('userId')) {
      return res.status(400).json({ error: '提供的留言者 ID 無效或不存在。' });
    }
    return res.status(500).json({ error: '伺服器內部錯誤，新增留言失敗。' });
  }
});
// PUT /api/group/:groupId (編輯揪團)
router.put(
  '/:groupId',
  authenticate,
  upload.single('cover'),
  async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId);
      if (isNaN(groupId))
        return res.status(400).json({ error: '無效的揪團 ID' });

      const userId = req.user?.id;
      // if (!userId)
      //   return res
      //     .status(401)
      //     .json({ error: '未授權操作，無法獲取用戶ID (測試模式問題)' });

      const groupToUpdate = await prisma.group.findUnique({
        where: { id: groupId },
      });
      if (!groupToUpdate)
        return res.status(404).json({ error: '找不到要編輯的揪團' });
      if (groupToUpdate.organizerId !== userId) {
        console.log(
          `權限檢查: 資料庫 organizerId (${groupToUpdate.organizerId}) !== 測試 userId (${userId})`
        );
        return res
          .status(403)
          .json({ error: '您沒有權限編輯此揪團 (測試模式下的權限檢查)' });
      }

      const {
        type: rawType,
        title,
        start_date,
        end_date,
        location: locationInput,
        customLocation: customLocationInput,
        difficulty,
        min_people,
        max_people,
        price,
        allow_newbie,
        description,
      } = req.body;

      const dataToUpdate = {};

      if (rawType) {
        const labelToKey = { 滑雪: ActivityType.SKI, 聚餐: ActivityType.MEAL };
        if (labelToKey[rawType]) dataToUpdate.type = labelToKey[rawType];
        else if (Object.values(ActivityType).includes(rawType))
          dataToUpdate.type = rawType;
        else
          return res.status(400).json({ error: `無效的活動類型：${rawType}` });
      }

      if (title !== undefined) dataToUpdate.title = title;
      if (start_date) {
        const sd = parseYMD(start_date);
        if (!sd) return res.status(400).json({ error: '開始日期格式錯誤' });
        dataToUpdate.startDate = sd;
      }
      if (end_date) {
        const ed = parseYMD(end_date);
        if (!ed) return res.status(400).json({ error: '結束日期格式錯誤' });
        dataToUpdate.endDate = ed;
      }

      const finalStartDate = dataToUpdate.startDate || groupToUpdate.startDate;
      const finalEndDate = dataToUpdate.endDate || groupToUpdate.endDate;
      if (finalEndDate < finalStartDate)
        return res.status(400).json({ error: '結束日期不能早於開始日期' });

      if (min_people !== undefined) dataToUpdate.minPeople = Number(min_people);
      if (max_people !== undefined) dataToUpdate.maxPeople = Number(max_people);
      if (price !== undefined) dataToUpdate.price = Number(price);
      if (allow_newbie !== undefined)
        dataToUpdate.allowNewbie =
          allow_newbie === '1' || allow_newbie === true;
      if (description !== undefined) dataToUpdate.description = description;

      const effectiveType = dataToUpdate.type || groupToUpdate.type;
      if (effectiveType === ActivityType.SKI) {
        if (locationInput !== undefined) {
          if (locationInput) {
            dataToUpdate.locationId = Number(locationInput);
            dataToUpdate.customLocation = null;
          } else {
            dataToUpdate.locationId = null;
          }
        }
        if (difficulty !== undefined) dataToUpdate.difficulty = difficulty;
        else if (locationInput !== undefined && !difficulty)
          dataToUpdate.difficulty = null;
      } else {
        if (customLocationInput !== undefined || locationInput !== undefined) {
          const newCustomLocation = customLocationInput || locationInput;
          if (newCustomLocation) {
            dataToUpdate.customLocation = newCustomLocation;
            dataToUpdate.locationId = null;
          } else {
            dataToUpdate.customLocation = null;
          }
        }
        dataToUpdate.difficulty = null;
      }

      if (req.file) {
        const newImageUrl = `/uploads/${req.file.filename}`;
        const existingImage = await prisma.groupImage.findFirst({
          where: { groupId },
        });
        if (existingImage) {
          await prisma.groupImage.update({
            where: { id: existingImage.id },
            data: { imageUrl: newImageUrl },
          });
        } else {
          await prisma.groupImage.create({
            data: { groupId, imageUrl: newImageUrl, sortOrder: 0 },
          });
        }
      }

      if (Object.keys(dataToUpdate).length === 0 && !req.file) {
        return res.status(400).json({ error: '沒有提供任何需要更新的資料' });
      }

      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: dataToUpdate,
      });
      res.status(200).json(updatedGroup);
    } catch (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `圖片上傳錯誤: ${err.message}` });
      }
      if (err.message === '僅允許上傳圖片檔案！') {
        return res.status(400).json({ error: err.message });
      }
      console.error(`編輯揪團 ${req.params.groupId} 失敗:`, err);
      if (err.code === 'P2025')
        return res
          .status(404)
          .json({ error: '找不到要更新的揪團或相關資源。' });
      if (err.code === 'P2003' && err.meta?.field_name?.includes('locationId'))
        return res.status(400).json({ error: '提供的地點 ID 無效或不存在。' });
      return res.status(500).json({ error: '伺服器內部錯誤，更新揪團失敗。' });
    }
  }
);
// GET /group/user/:userId
router.get('/user/:userId', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      select: {
        id: true, // group_member PK
        joinedAt: true, // 加入時間
        group: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            price: true,
            location: { select: { name: true } },
            customLocation: true,
            images: {
              select: { imageUrl: true },
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const result = memberships.map((m) => {
      const loc = m.group.location?.name;
      return {
        userId: userId,
        groupMemberId: m.id,
        joinedAt: m.joinedAt,
        group: {
          groupId: m.group.id,
          title: m.group.title,
          time: m.group.endDate
            ? `${m.group.startDate.toISOString()} — ${m.group.endDate.toISOString()}`
            : m.group.startDate.toISOString(),
          price: m.group.price,
          imageUrl: m.group.images[0]?.imageUrl || '/deadicon.png',
          location: loc || m.group.customLocation || '地點未定',
        },
      };
    });

    res.json({ memberships: result });
  } catch (err) {
    next(err);
  }
});
// DELETE /api/group/:groupId (刪除揪團)
router.delete('/:groupId', authenticate, async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: '無效的揪團 ID' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ error: '未授權操作，請先登入以刪除揪團。' });
    }

    const groupToSoftDelete = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!groupToSoftDelete) {
      return res.status(404).json({ error: '找不到要刪除的揪團' });
    }

    // 檢查是否已經被軟刪除 (可選，但建議加上)
    if (groupToSoftDelete.deletedAt) {
      return res.status(404).json({ error: '此揪團先前已被刪除。' });
    }

    if (groupToSoftDelete.organizerId !== Number(userId)) {
      console.log(
        `權限檢查: 資料庫 organizerId (${groupToSoftDelete.organizerId}) !== req.user.id (${userId})`
      );
      return res.status(403).json({ error: '您沒有權限刪除此揪團' });
    }

    // --- 修改為軟刪除 ---
    const softDeletedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        deletedAt: new Date(), // 設定 deletedAt 為當前時間
      },
    });
    // --- 軟刪除修改結束 ---

    res
      .status(200)
      .json({ message: '揪團已成功標記為刪除。', data: softDeletedGroup }); // 可以選擇回傳更新後的記錄
  } catch (err) {
    console.error(`標記刪除揪團 ${req.params.groupId} 失敗:`, err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: '找不到要標記為刪除的揪團。' });
    }
    return res
      .status(500)
      .json({ error: '伺服器內部錯誤，標記刪除揪團失敗。' });
  }
});
// 新增：DELETE /api/group/members/:groupMemberId
router.delete(
  '/members/:groupMemberId',
  authenticate,
  async (req, res, next) => {
    try {
      const groupMemberId = parseInt(req.params.groupMemberId, 10);
      const currentUserId = req.user?.id; // 從 authenticate 中介軟體獲取

      if (isNaN(groupMemberId)) {
        return res
          .status(400)
          .json({ error: '無效的參與記錄 ID (groupMemberId)。' });
      }

      if (!currentUserId) {
        // 理論上 authenticate 會處理，但多一層防護
        return res.status(401).json({ error: '未授權操作，無法識別用戶。' });
      }

      // 1. 查找 GroupMember 記錄
      const groupMemberEntry = await prisma.groupMember.findUnique({
        where: { id: groupMemberId },
        include: {
          // 同時獲取關聯的 group 資訊，以便檢查開團者
          group: {
            select: { organizerId: true },
          },
        },
      });

      if (!groupMemberEntry) {
        return res.status(404).json({ error: '找不到指定的參與記錄。' });
      }

      // 2. 權限驗證：
      // 允許的情況：
      // a) 是該 GroupMember 記錄的擁有者 (userId)
      // b) 是該揪團的開團者 (organizerId)
      const isOwner = groupMemberEntry.userId === currentUserId;
      const isOrganizer = groupMemberEntry.group?.organizerId === currentUserId;

      if (!isOwner && !isOrganizer) {
        return res.status(403).json({ error: '您沒有權限移除此參與記錄。' });
      }

      // 3. 檢查 paid_at 狀態 (根據你的業務邏輯決定如何處理已付款的項目)
      // 如果是開團者移除成員，可能也需要考慮退款。
      // 如果是成員自己退出已付款的團，也需要考慮退款政策。
      if (groupMemberEntry.paid_at !== null) {
        // 範例：如果是已付款的，且不是開團者操作，則不允許直接刪除 (讓使用者走特定退款流程)
        if (isOwner && !isOrganizer) {
          // 成員自己想退出已付款的團
          // 這裡可以根據你的業務邏輯決定是否允許，或提示需要聯繫客服等
          console.warn(
            `使用者 ${currentUserId} 嘗試刪除已付款的參與記錄 ${groupMemberId}。需要進一步處理退款事宜。`
          );
          // return res.status(400).json({
          //   error: '此項目已付款，若要退出請聯繫客服或發起退款申請。',
          //   needsRefund: true // 可以給前端一個標記
          // });
          // 目前暫時允許刪除，但實際應用中應有更完整的退款/取消策略
        }
        // 如果是開團者移除已付款成員，也應該有相應的退款/通知機制
        console.log(
          `操作者 (ID: ${currentUserId}, ${
            isOrganizer ? '開團者' : '成員本人'
          }) 正在移除已付款的參與記錄 (ID: ${groupMemberId})。`
        );
      }

      // 4. 執行刪除
      await prisma.groupMember.delete({
        where: { id: groupMemberId },
      });

      res.status(200).json({ message: '參與記錄已成功移除。' });
    } catch (error) {
      console.error(
        `刪除 GroupMember ID ${req.params.groupMemberId} 時發生錯誤:`,
        error
      );
      if (error.code === 'P2025') {
        // Prisma "Record to delete not found."
        return res
          .status(404)
          .json({ error: '找不到要刪除的參與記錄 (可能已被刪除)。' });
      }
      next(error);
    }
  }
);

router.put(
  '/members/:groupMemberId/payment',
  authenticate, // (Source 3) 請確保此認證機制適合呼叫此API的系統
  async (req, res, next) => {
    const { groupMemberId: groupMemberIdString } = req.params;
    const groupMemberId = parseInt(groupMemberIdString, 10);

    if (isNaN(groupMemberId)) {
      return res.status(400).json({ error: '無效的 groupMemberId 格式。' });
    }
    try {
      // 1. 查找 group_member 記錄
      const memberEntry = await prisma.groupMember.findUnique({
        where: { id: groupMemberId },
      });

      if (!memberEntry) {
        return res
          .status(404)
          .json({ error: `找不到 ID 為 ${groupMemberId} 的參與記錄。` });
      }

      // 2. 更新 paid_at 欄位為當前時間
      const updatedMemberEntry = await prisma.groupMember.update({
        where: { id: groupMemberId },
        data: {
          paidAt: new Date(), // 設定為當前伺服器時間
        },
      });

      res.status(200).json({
        message: `ID 為 ${groupMemberId} 的參與記錄已成功更新付款時間。`,
        data: updatedMemberEntry,
      });
    } catch (error) {
      console.error(
        `更新 groupMemberId ${groupMemberId} 的 paid_at 狀態時發生錯誤:`,
        error
      );
      if (error.code === 'P2025') {
        // Prisma "Record to update not found"
        // 這個錯誤理論上會被上面的 findUnique 捕獲，但多一層保障
        return res
          .status(404)
          .json({ error: `找不到 ID 為 ${groupMemberId} 的參與記錄來更新。` });
      }
      next(error); // 將其他錯誤交給 Express 錯誤處理中介軟體
    }
  }
);
export default router;
