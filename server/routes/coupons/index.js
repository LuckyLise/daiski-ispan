import express from 'express';
import prisma from '../../lib/prisma.js';
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

/* GET home page. */
// router.get('/', function (req, res) {
//   res
//     .status(200)
//     .json({ status: 'success', message: 'Express(path: /api/demo1)' });
// });

// 查詢
router.get('/', authenticate, async function (req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const commonWhere = {
      // 只撈 已開始 尚未過期
      endAt: { gte: now },
      id: {
        not: 5,
      },

      // 還沒領取
      UserCoupon: {
        none: {
          userId: userId,
        },
      },
    };

    const [coupon, total] = await Promise.all([
      prisma.coupon.findMany({
        where: commonWhere,
        select: {
          // 想顯示的 scalar 欄位
          id: true,
          name: true,
          startAt: true,
          endAt: true,
          usageLimit: true,
          minPurchase: true,
          // 關聯欄位也放進 select
          couponType: {
            select: {
              type: true,
              amount: true,
            },
          },
          couponTarget: {
            select: {
              target: true,
            },
          },
        },
      }),
    ]);

    const coupons = coupon.map(({ couponType, couponTarget, ...rest }) => ({
      ...rest,
      type: couponType.type,
      amount: couponType.amount,
      target: couponTarget.target,
    }));

    res.status(200).json({
      status: 'success',
      coupons,
    });
  } catch (error) {
    res.status(200).json({ error });
  }
});

// 會員領取優惠券
router.post('/claimcoupon', authenticate, async function (req, res) {
  const { couponId } = req.body;
  const userId = req.user.id;

  // 先查一次
  const existing = await prisma.userCoupon.findUnique({
    where: {
      // Prisma 會自動幫你根據 @@unique([userId, couponId]) 建立複合索引
      uniq_user_coupon: {
        userId,
        couponId,
      },
    },
  });

  if (existing) {
    return res
      .status(400)
      .json({ status: 'fail', message: '您已經領取過此優惠券' });
  }

  try {
    const claim = await prisma.userCoupon.create({
      data: { userId, couponId },
    });
    res.status(200).json({ status: 'success', claim });
  } catch (error) {
    res.status(200).json({ status: 'fail', data: '此優惠券已領取過' });
  }
});

// 查詢某會員所有領取過的優惠券
router.get('/usercoupon', authenticate, async function (req, res) {
  try {
    console.log('ok');
    const userId = req.user.id;

    const usercoupons = await prisma.userCoupon.findMany({
      where: {
        userId: userId,
      },
      include: {
        coupon: {
          select: {
            // 想顯示的 scalar 欄位
            id: true,
            name: true,
            startAt: true,
            endAt: true,
            usageLimit: true,
            minPurchase: true,
            couponType: {
              select: {
                type: true,
                amount: true,
              },
            },
            couponTarget: {
              select: {
                target: true,
              },
            },
          },
        },
      },
    });
    // usercoupons.map((usecoupon) => usecoupon.coupon);
    const usercoupon = usercoupons.map(({ coupon, usedAt }) => ({
      id: coupon.id,
      name: coupon.name,
      startAt: coupon.startAt,
      endAt: coupon.endAt,
      usageLimit: coupon.usageLimit,
      minPurchase: coupon.minPurchase,
      type: coupon.couponType.type,
      amount: coupon.couponType.amount,
      target: coupon.couponTarget.target,
      usedAt,
    }));
    res.status(200).json({ status: 'success', usercoupon });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// 購物車優惠券
router.get('/cartcoupon', authenticate, async function (req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();

    const cartcoupons = await prisma.userCoupon.findMany({
      where: {
        userId: userId,
        usedAt: null,
        coupon: {
          // 開始時間要小於等於現在
          startAt: { lte: now },
          // 結束時間要大於等於現在
          endAt: { gte: now },
        },
      },
      include: {
        coupon: {
          select: {
            // 想顯示的 scalar 欄位
            id: true,
            name: true,
            endAt: true,
            minPurchase: true,
            couponType: {
              select: {
                type: true,
                amount: true,
              },
            },
            couponTarget: {
              select: {
                target: true,
              },
            },
          },
        },
      },
    });
    // usercoupons.map((usecoupon) => usecoupon.coupon);
    const cartcoupon = cartcoupons.map(({ coupon }) => ({
      id: coupon.id,
      name: coupon.name,
      startAt: coupon.startAt,
      endAt: coupon.endAt,
      usageLimit: coupon.usageLimit,
      minPurchase: coupon.minPurchase,
      type: coupon.couponType.type,
      amount: coupon.couponType.amount,
      target: coupon.couponTarget.target,
    }));
    res.status(200).json({ status: 'success', cartcoupon });
  } catch (error) {
    res.status(400).json({ error });
  }
});

const app = express();

// 這行要在所有路由之前
app.use(express.json());

// 這行要確保 router 的路徑跟你呼叫一致
app.use('/api', router);
export default router;
