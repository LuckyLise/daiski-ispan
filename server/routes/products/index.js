import express from 'express';
const router = express.Router();
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import authenticate from '../../middlewares/authenticate.js';

const prisma = new PrismaClient();
const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';

// ---- Multer 設定（memory 儲存，後面自行存檔） ----
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 10, // 最多 10 張
    fileSize: 5 * 1024 * 1024, // 單檔最大 5MB
  },
});

// ---- POST /api/products：建立商品 + SKU + 多圖 ----
router.post('/', upload.array('images'), async (req, res, next) => {
  const {
    name,
    category_id,
    brand_id,
    introduction,
    spec,
    skus: skusJson = '[]',
  } = req.body;

  // 1. 解析前端傳來的 SKU 陣列（JSON 字串）
  let skus;
  try {
    skus = JSON.parse(skusJson);
    if (!Array.isArray(skus) || skus.length === 0) {
      throw new Error('skus 必須是一個非空陣列');
    }
  } catch (err) {
    return res.status(400).json({ message: 'skus 格式錯誤：請傳入 JSON 陣列' });
  }

  // 2. 計算 min_price
  const prices = skus
    .map((s) => Number(s.price))
    .filter((p) => !Number.isNaN(p));
  if (prices.length === 0) {
    return res.status(400).json({ message: '請提供至少一個有效 price' });
  }
  const min_price = Math.min(...prices);

  // 3. 透過 transaction 建立 product 與所有 sku
  try {
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      // 3-1. 建立 Product
      const product = await tx.product.create({
        data: {
          name,
          category_id: category_id ? Number(category_id) : null,
          brand_id: brand_id ? Number(brand_id) : null,
          introduction,
          spec,
          min_price,
          publish_at: now,
        },
      });

      // 3-2. 建立所有 SKU
      const createdSkus = await Promise.all(
        skus.map((s) =>
          tx.productSku.create({
            data: {
              product_id: product.id,
              size_id: s.size_id ? Number(s.size_id) : null,
              sku_code: s.sku_code,
              price: Number(s.price),
              stock: Number(s.stock || 0),
            },
          })
        )
      );

      return { product, createdSkus };
    });

    const { product } = result;

    // 4. 處理上傳的圖片：存檔 & 建立 product_image
    const images = req.files; // multer 處理後的 Buffer 陣列
    const savedImages = [];

    if (images && images.length > 0) {
      // 確保資料夾存在
      const uploadDir = path.join(
        process.cwd(),
        'public',
        'productImages',
        `${product.id}`
      );
      await fs.promises.mkdir(uploadDir, { recursive: true });

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        // 自訂檔名：timestamp-index-原始名稱
        const filename = `${Date.now()}-${i}-${file.originalname}`;
        const filepath = path.join(uploadDir, filename);

        // 將 Buffer 寫入檔案
        await fs.promises.writeFile(filepath, file.buffer);

        // 建立資料庫紀錄
        const url = `/productImages/${product.id}/${filename}`;
        const imgRecord = await prisma.productImage.create({
          data: {
            product_id: product.id,
            url,
            sort_order: i, // 依上傳順序排序
          },
        });
        savedImages.push(imgRecord);
      }
    }

    // 5. 回傳結果
    return res.status(201).json({
      product: {
        ...product,
        images: savedImages,
      },
      skus: result.createdSkus,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET /api/products — 支援 include=card、page、limit、category_id、size_id、min_price、max_price 參數
router.get('/', async (req, res, next) => {
  const {
    include,
    page = '1',
    limit = '12',
    category_id,
    size_id,
    min_price,
    max_price,
    search,
    sort,
  } = req.query;
  const pageNum = Math.max(parseInt(page, 10), 1);
  const pageSize = Math.max(parseInt(limit, 10), 1);

  try {
    // 1. 組基礎 where
    const where = { deleted_at: null };

    // 2. 如果有 search，就加上 name 模糊搜尋
    if (typeof search === 'string' && search.trim().length >= 2) {
      where.name = {
        contains: search.trim(),
      };
    }

    // 3. 如果有 category_id，就先從 closure table 取所有後裔 id
    let category_ids;
    if (category_id) {
      const rows = await prisma.productCategoryPath.findMany({
        where: { ancestor: Number(category_id) },
        select: { descendant: true },
      });
      category_ids = rows.map((r) => r.descendant);
      where.category_id = { in: category_ids };
    }

    // 4. 如果有 brand_id，就加上品牌過濾
    if (req.query.brand_id) {
      const ids = String(req.query.brand_id)
        .split(/[,\s]+/)
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v));
      if (ids.length) {
        where.brand_id = { in: ids };
      }
    }

    // 5. 處理 size_id 篩選（相同邏輯）
    if (size_id) {
      const ids = String(size_id)
        .split(/[,\s]+/)
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v));
      where.product_sku = {
        some: {
          deleted_at: null,
          size_id: { in: ids },
        },
      };
    }

    // 6. 組 SKU 篩選：size + price（相同邏輯）
    const skuFilter = { deleted_at: null };
    if (size_id) {
      const ids = String(size_id)
        .split(/[,\s]+/)
        .map(Number)
        .filter((v) => !Number.isNaN(v));
      skuFilter.size_id = { in: ids };
    }
    const minP = Number(min_price);
    const maxP = Number(max_price);
    if (!Number.isNaN(minP) || !Number.isNaN(maxP)) {
      skuFilter.price = {};
      if (!Number.isNaN(minP)) skuFilter.price.gte = minP;
      if (!Number.isNaN(maxP)) skuFilter.price.lte = maxP;
    }
    if (Object.keys(skuFilter).length > 1) {
      where.product_sku = { some: skuFilter };
    }

    // 7. 拿總數
    const total = await prisma.product.count({ where });

    const pagination = {
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    };

    // 8. 排序條件
    let orderByArg;
    switch (sort) {
      case 'price_asc':
        orderByArg = { min_price: 'asc' };
        break;
      case 'price_desc':
        orderByArg = { min_price: 'desc' };
        break;
      case 'publish_at_asc':
        orderByArg = { publish_at: 'asc' };
        break;
      case 'publish_at_desc':
        orderByArg = { publish_at: 'desc' };
        break;
    }

    // 9. 如果 include=card，就連同圖片、SKU、分類、品牌一起查，再把 rating 也補上
    if (include === 'card') {
      // 9.1 先把主要商品資料 (含第一張圖、售價、分類、品牌) 撈出來
      const raw = await prisma.product.findMany({
        where,
        ...pagination,
        ...(orderByArg ? { orderBy: [orderByArg] } : {}),
        include: {
          product_image: {
            where: { sort_order: 0, deleted_at: null },
            take: 1,
            select: { url: true },
          },
          product_sku: {
            where: skuFilter,
            orderBy: { price: 'asc' },
            take: 1,
            select: { price: true },
          },
          product_category: { select: { name: true, id: true } },
          product_brand: { select: { name: true, id: true } },
        },
      });

      // 9.2 對剛剛撈出的每個商品，做 rating aggregate
      const productsWithRating = await Promise.all(
        raw.map(async (p) => {
          // 針對當前商品 p.id，計算平均評分和評分總數
          const ratingStats = await prisma.productRating.aggregate({
            where: {
              product_id: p.id,
              deleted_at: null,
            },
            _avg: { rating: true },
            _count: { id: true },
          });

          // 處理可能為 null 的狀況
          const averageRating =
            ratingStats._avg.rating !== null
              ? parseFloat(Number(ratingStats._avg.rating).toFixed(1))
              : 0;
          const totalRatings = ratingStats._count.id;

          return {
            id: p.id,
            name: p.name,
            image: p.product_image[0]
              ? `${base}${p.product_image[0].url}`
              : `${base}/deadicon.png`,
            price: p.min_price ?? 0,
            category: p.product_category?.name ?? '無分類',
            category_id: p.product_category?.id ?? null,
            brand: p.product_brand?.name ?? '無品牌',
            brand_id: p.product_brand?.id ?? null,
            // 新增：評分欄位
            averageRating,
            totalRatings,
          };
        })
      );

      return res.json({
        page: pageNum,
        limit: pageSize,
        total,
        data: productsWithRating,
      });
    }

    // 10. 否則走基本查詢 (不含卡片資訊)
    const basic = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        category_id: true,
        brand_id: true,
        introduction: true,
        spec: true,
        created_at: true,
        publish_at: true,
        unpublish_at: true,
        deleted_at: true,
      },
      ...pagination,
      ...(orderByArg ? { orderBy: [orderByArg] } : {}),
    });

    res.json({
      page: pageNum,
      limit: pageSize,
      total,
      data: basic,
    });
  } catch (error) {
    next(error);
  }
});

// 在 import 之後、其他 router.get 之前加入：
/**
 * GET /api/products/search-suggestions
 * Query:
 *   - q: 關鍵字（必填，長度需 ≥ 2）
 *   - limit: 最多回傳幾筆（選填，預設 5）
 */
router.get('/search-suggestions', async (req, res, next) => {
  try {
    const { search, limit } = req.query;
    const keyword = typeof search === 'string' ? search.trim() : '';
    const max = Math.max(parseInt(limit, 10), 1);

    // 關鍵字長度限制
    if (keyword.length < 2) {
      return res.status(400).json({ message: 'search 長度需 ≥ 2 字元' });
    }

    const suggestions = await prisma.product.findMany({
      where: {
        deleted_at: null,
        name: {
          contains: keyword,
        },
      },
      orderBy: { name: 'asc' },
      take: 3,
      select: {
        id: true,
        name: true,
      },
    });

    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// GET /api/products/categories — 取得分類的完整路徑列表
// --------------------------------------------------
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { deleted_at: null }, // 若有做「軟刪除」
      select: {
        id: true,
        name: true,
        product_category_path_product_category_path_descendantToproduct_category:
          {
            // 取出這個 category 作為「descendant」的所有 path 條目
            where: {
              depth: { gt: 0 }, // 只要祖先（depth>0），不要自己(depth=0)
            },
            select: {
              depth: true,
              product_category_product_category_path_ancestorToproduct_category:
                {
                  select: { name: true }, // 取出 ancestor 的 name
                },
            },
            orderBy: { depth: 'desc' }, // depth 大（離 root 越遠）排前面
          },
      },
    });

    if (categories.length === 0) {
      return res.status(404).json({ message: 'no categories found' });
    }

    const result = categories.map((cat) => {
      // 先把 ancestors 的 name 拿出來
      const ancestorNames =
        cat.product_category_path_product_category_path_descendantToproduct_category.map(
          (p) =>
            p.product_category_product_category_path_ancestorToproduct_category
              .name
        );

      // 把自己（cat.name）放到最後
      ancestorNames.push(cat.name);

      return {
        id: cat.id,
        fullPath: ancestorNames.join(' > '),
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// GET /api/products/categories/list — 取得所有分類的 id + name 平面列表
// --------------------------------------------------
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: {
        deleted_at: null, // 如果你有做軟刪除
      },
      select: {
        id: true,
        name: true,
      },
      // orderBy: {
      //   name: 'asc', // 可以依名稱排序（或 parentId、created_at）
      // },
    });

    if (!categories.length) {
      return res.status(404).json({ message: 'no categories found' });
    }

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// GET /api/products/sizes — 取得所有尺寸，或特定分類下可用的尺寸
// --------------------------------------------------
router.get('/sizes', async (req, res, next) => {
  const { category_id } = req.query;

  try {
    // 如果有帶 category_id，先抓該分類（含所有子孫分類）的 ID
    let sizeFilter = {};
    if (category_id) {
      const catId = Number(category_id);
      // 1. 抓所有 descendant id（含自己）
      const paths = await prisma.productCategoryPath.findMany({
        where: { ancestor: catId },
        select: { descendant: true },
      });
      const categoryIds = paths.map((p) => p.descendant);

      // 2. 從 product_sku 找出這些分類下所有未刪除且有指定 size_id 的 sku
      const skuRows = await prisma.productSku.findMany({
        where: {
          deleted_at: null,
          size_id: { not: null },
          product: {
            deleted_at: null,
            category_id: { in: categoryIds },
          },
        },
        distinct: ['size_id'],
        select: { size_id: true },
      });
      const sizeIds = skuRows.map((s) => s.size_id);

      sizeFilter = { id: { in: sizeIds } };
    }

    // 最後從 product_size 取出符合條件的尺寸清單
    const sizes = await prisma.productSize.findMany({
      where: sizeFilter,
      orderBy: { sort_order: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });

    res.json(sizes);
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// GET /api/products/brands — 取得所有品牌，或特定分類下可用的品牌
// --------------------------------------------------
router.get('/brands', async (req, res, next) => {
  const { category_id } = req.query;

  try {
    // 1. 如果有帶 category_id，先抓該分類（含所有子孫）的 ID
    let brandFilter = {};
    if (category_id) {
      const catId = Number(category_id);
      // a. 拿所有 descendant id（含自己）
      const paths = await prisma.productCategoryPath.findMany({
        where: { ancestor: catId },
        select: { descendant: true },
      });
      const categoryIds = paths.map((p) => p.descendant);

      // b. 從 product 找出這些分類下所有未刪除且有 brand_id 的商品
      const productRows = await prisma.product.findMany({
        where: {
          deleted_at: null,
          brand_id: { not: null },
          category_id: { in: categoryIds },
        },
        distinct: ['brand_id'],
        select: { brand_id: true },
      });
      const brandIds = productRows.map((p) => p.brand_id);

      // c. 在品牌過濾條件中加入這些 ID
      if (brandIds.length) {
        brandFilter.id = { in: brandIds };
      } else {
        // 若完全沒有符合的品牌，就直接回空陣列
        return res.json([]);
      }
    }

    // 2. 最後從 product_brand 取出符合條件的品牌清單
    const brands = await prisma.productBrand.findMany({
      where: {
        deleted_at: null,
        ...brandFilter,
      },
      orderBy: { sort_order: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });

    res.json(brands);
  } catch (error) {
    next(error);
  }
});

// --- 新增：商品評分摘要 API (目前2025/6/2 18:18沒用到) ---
/**
 * GET /api/products/:productId/rating-summary
 * 獲取指定商品的平均評分和總評分數量。
 */
router.get('/:productId/rating-summary', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const productIdNum = parseInt(productId, 10);

    if (isNaN(productIdNum)) {
      return res.status(400).json({ message: '無效的商品 ID。' });
    }

    // 檢查商品是否存在 (可選，但建議)
    const productExists = await prisma.product.findUnique({
      where: {
        id: productIdNum,
        deleted_at: null, // 只找未刪除的商品
      },
      select: { id: true }, // 只需要 id 來確認存在性
    });

    if (!productExists) {
      return res.status(404).json({ message: '找不到指定的商品。' });
    }

    const ratingStats = await prisma.productRating.aggregate({
      _avg: {
        rating: true, // 計算 rating 欄位的平均值
      },
      _count: {
        id: true, // 計算總評分筆數 (使用 id 或任何非 null 欄位)
      },
      where: {
        product_id: productIdNum,
        deleted_at: null, // 只計算未被軟刪除的評分
      },
    });

    // Prisma 回傳的 _avg.rating 可能是 Decimal 型別或 null
    // 將其轉換為數字並格式化到小數點後一位
    const averageRating =
      ratingStats._avg.rating !== null
        ? parseFloat(Number(ratingStats._avg.rating).toFixed(1))
        : 0; // 如果沒有評分，預設為 0 (或可回傳 null，視前端需求而定)

    const totalRatings = ratingStats._count.id;

    res.json({
      productId: productIdNum,
      averageRating: averageRating,
      totalRatings: totalRatings,
    });
  } catch (error) {
    console.error('獲取商品評分摘要時發生錯誤:', error);
    next(error); // 將錯誤傳遞給 Express 的錯誤處理中介軟體
  }
});

/**
 * POST /api/orders/:orderId/products/:productId/rate
 * 建立一筆商品評分 (ProductRating)
 * 需要先登入 (authenticate middleware)
 *
 * Path Params:
 *   - orderId: 該筆訂單的 ID
 *   - productId: 該筆訂單內要評價的商品 ID
 *
 * Request Body JSON:
 * {
 *   "rating": number,       // 0.0 ~ 5.0，最多到小數一位 (e.g. 3.5)
 *   "review_text": string   // 選填
 * }
 */
router.post(
  '/:productId/orders/:orderId/rate',
  authenticate, // 先透過 authenticate 拿到 req.user.id
  async (req, res, next) => {
    try {
      // 1. 解析路由參數
      const orderIdNum = parseInt(req.params.orderId, 10);
      const productIdNum = parseInt(req.params.productId, 10);
      if (isNaN(orderIdNum) || isNaN(productIdNum)) {
        return res
          .status(400)
          .json({ message: 'orderId 或 productId 格式錯誤' });
      }

      // 2. 解析 request body
      const { rating, review_text } = req.body;
      const numRating = parseFloat(rating);
      if (
        Number.isNaN(numRating) ||
        numRating < 0 ||
        numRating > 5 ||
        !/^\d+(\.[05])?$/.test(String(rating))
      ) {
        return res.status(400).json({
          message:
            'rating 格式錯誤，請輸入 0.0～5.0 之間的一位小數 (例：3.5、4.0)',
        });
      }

      // 3. 檢查訂單是否存在且屬於當前使用者
      const order = await prisma.order.findUnique({
        where: { id: orderIdNum },
        select: { userId: true },
      });
      if (!order) {
        return res.status(404).json({ message: '找不到該訂單' });
      }
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: '無權為此訂單的商品評分' });
      }

      // 4. 檢查「訂單裡是否包含這個 productId」
      //  → 先去 ProductSku 撈所有屬於此 productId 的 sku.id
      const skus = await prisma.productSku.findMany({
        where: { product_id: productIdNum, deleted_at: null },
        select: { id: true },
      });
      const skuIds = skus.map((s) => s.id);
      if (skuIds.length === 0) {
        // 代表根本找不到任何 SKU 屬於此 product，也不用往下查
        return res.status(400).json({ message: '無此商品或商品不可評分' });
      }

      //  → 再去 OrderProduct 裡面查：orderId = X 且 productSkuId 要在 [skuIds] 裡
      const orderProduct = await prisma.orderProduct.findFirst({
        where: {
          orderId: orderIdNum,
          productSkuId: { in: skuIds },
        },
      });
      if (!orderProduct) {
        return res.status(400).json({
          message: '此訂單未包含該商品，無法提交評分',
        });
      }

      // 5. 檢查是否已經評分過 (order_id + product_id 的複合唯一)
      const existing = await prisma.productRating.findUnique({
        where: {
          order_id_product_id: {
            order_id: orderIdNum,
            product_id: productIdNum,
          },
        },
      });
      if (existing) {
        return res.status(400).json({ message: '您已經對此商品評分過' });
      }

      // 6. 建立新的 ProductRating
      const created = await prisma.productRating.create({
        data: {
          user_id: req.user.id,
          order_id: orderIdNum,
          product_id: productIdNum,
          rating: numRating,
          review_text: review_text?.trim() || null,
        },
      });

      return res.status(201).json({ message: '評分已成功提交', data: created });
    } catch (error) {
      console.error('建立商品評價時錯誤：', error);
      next(error);
    }
  }
);

// GET /api/products/:productId/orders/:orderId/rating
router.get(
  '/:productId/orders/:orderId/rating',
  authenticate,
  async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.orderId, 10);
      const productId = parseInt(req.params.productId, 10);
      if (isNaN(orderId) || isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid IDs' });
      }
      // 確認該 user 有此 order，且該訂單裡面確實有買過這個 product
      // （視你的授權邏輯，這裡可加 authenticate middleware 驗證 user）

      // 查詢 product_rating 表，看看是否已留下評分
      const existing = await prisma.productRating.findUnique({
        where: {
          // 你之前 schema 用 uniq(order_id, product_id)
          order_id_product_id: {
            order_id: orderId,
            product_id: productId,
          },
        },
        select: {
          rating: true,
          review_text: true,
          created_at: true,
        },
      });
      if (!existing) {
        return res.status(404).json({ message: 'Not rated yet' });
      }
      return res.json({
        orderId,
        productId,
        rating: parseFloat(existing.rating.toString()), // Decimal 轉數字
        reviewText: existing.review_text || '',
      });
    } catch (err) {
      next(err);
    }
  }
);

// --------------------------------------------------
// GET /api/products/:id — 取得單一商品詳細資料 + 相關商品
// --------------------------------------------------
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // 1. 先拿主商品 + 該分類的 parent_id
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        product_image: {
          where: { deleted_at: null },
          orderBy: { sort_order: 'asc' },
          select: { url: true },
        },
        product_sku: {
          where: { deleted_at: null },
          orderBy: [{ product_size: { sort_order: 'asc' } }, { price: 'asc' }],
          select: {
            id: true,
            size_id: true,
            price: true,
            stock: true,
            product_size: { select: { name: true } },
          },
        },
        product_brand: { select: { id: true, name: true } },
        // 多取 parent_id
        product_category: { select: { id: true, name: true, parent_id: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const catId = product.product_category?.id;
    const parentId = product.product_category?.parent_id;

    // 2. 撈同子分類（最多 4 筆，排除自己）
    let related = await prisma.product.findMany({
      where: {
        deleted_at: null,
        category_id: catId,
        id: { not: product.id },
      },
      take: 4,
      include: {
        product_image: {
          where: { deleted_at: null, sort_order: 0 },
          take: 1,
          select: { url: true },
        },
        product_sku: {
          where: { deleted_at: null },
          orderBy: { price: 'asc' },
          take: 1,
          select: { price: true },
        },
      },
    });

    // 3. 不足 4 筆且有父分類，就補同父分類
    if (related.length < 4 && parentId) {
      const excludeIds = [product.id, ...related.map((p) => p.id)];
      const siblings = await prisma.product.findMany({
        where: {
          deleted_at: null,
          product_category: { parent_id: parentId },
          id: { notIn: excludeIds },
        },
        take: 4 - related.length,
        include: {
          product_image: {
            where: { deleted_at: null, sort_order: 0 },
            take: 1,
            select: { url: true },
          },
          product_sku: {
            where: { deleted_at: null },
            orderBy: { price: 'asc' },
            take: 1,
            select: { price: true },
          },
        },
      });

      related = related.concat(siblings);
    }

    // 4. 組 response
    const normalize = (p) => ({
      id: p.id,
      name: p.name,
      image: p.product_image[0]
        ? `${base}${p.product_image[0].url}`
        : `/deadicon.png`,
      price: p.product_sku[0]?.price ?? 0,
    });

    const response = {
      id: product.id,
      name: product.name,
      introduction: product.introduction,
      spec: product.spec,
      publishAt: product.publish_at,
      createdAt: product.created_at,
      brand: product.product_brand,
      category: {
        id: product.product_category.id,
        name: product.product_category.name,
      },
      images: product.product_image.map((img) => `${base}${img.url}`),
      skus: product.product_sku.map((sku) => ({
        skuId: sku.id,
        sizeId: sku.size_id,
        sizeName: sku.product_size?.name || null,
        price: sku.price,
        stock: sku.stock,
      })),
      related: related.map(normalize),
    };

    // ================= 新增：取得這個商品的平均評分與評分總數 =================
    const ratingStats = await prisma.productRating.aggregate({
      where: {
        product_id: product.id,
        deleted_at: null,
      },
      _avg: { rating: true },
      _count: { id: true },
    });

    const averageRating =
      ratingStats._avg.rating !== null
        ? parseFloat(Number(ratingStats._avg.rating).toFixed(1))
        : 0;
    const totalRatings = ratingStats._count.id;

    // 把 rating 放到 response 裡
    response.averageRating = averageRating;
    response.totalRatings = totalRatings;
    // =============================================================

    return res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
