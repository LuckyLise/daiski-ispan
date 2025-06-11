import express from 'express';
import prisma from '../../lib/prisma.js';
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

/* POST home page. */
router.post('/', authenticate, async function (req, res) {
  try {
    const userId = req.user.id;
    const { gameId, score } = req.body;

    // 1. 先存分數
    await prisma.gameScore.create({ data: { userId, gameId, score } });

    // 2. 撈遊戲門檻 & 優惠券 ID
    let game = await prisma.game.findMany({
      where: { id: gameId },
      select: { scoreRequirement: true, rewardCouponId: true },
    });
    game = game[0];
    console.log(game);
    if (!game.rewardCouponId || score < game.scoreRequirement) {
      return res
        .status(400)
        .json({ status: 'error', message: '分數未達 500，無法領取' });
    }

    // 3. 防止重複領取
    const existed = await prisma.userCoupon.findMany({
      where: {
        userId,
        couponId: game.rewardCouponId,
      },
    });
    console.log(existed);
    if (existed.length) {
      return res
        .status(400)
        .json({ status: 'error', message: '已領過專屬券，無法重複領取' });
    }

    // 4. 寫入領券
    await prisma.userCoupon.create({
      data: { userId, couponId: game.rewardCouponId },
    });

    // 成功回應
    res.status(200).json({ status: 'success', message: '專屬券領取成功！' });
  } catch (error) {
    console.error('領取遊戲專屬券錯誤：', error);
    res
      .status(500)
      .json({ status: 'error', message: '伺服器發生錯誤，請稍後再試' });
  }
});

export default router;
