// routes/product-skus.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../../middlewares/authenticate.js'; // 如有需要驗證
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/product-skus/:skuId — 回傳 productSku 資訊
router.get('/:skuId', async (req, res, next) => {
  try {
    const skuId = parseInt(req.params.skuId, 10);
    if (isNaN(skuId)) {
      return res.status(400).json({ message: 'Invalid SKU ID' });
    }
    const sku = await prisma.productSku.findUnique({
      where: { id: skuId },
      select: {
        id: true,
        product_id: true, // 我們只需要 product_id 這欄
        // 如果你還想 front-end 順便拿到價格、尺寸等，可以多寫在 select 裡
        // price: true,
        // size_id: true,
      },
    });
    if (!sku) {
      return res.status(404).json({ message: ' SKU not found' });
    }
    res.json(sku);
  } catch (error) {
    next(error);
  }
});

export default router;
