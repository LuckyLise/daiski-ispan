import { Router } from 'express';
// import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/users  ── 註冊
 * req.body: { name, email, account, password, confirmPassword }
 */
router.post('/', async (req, res) => {
  try {
    // 1. 取參數
    const { name, email, account, password, phone, birthday, is_coach } =
      req.body;
    console.log({ name, email, account, password });
    // 2. 基本驗證
    if (!name || !email || !account || !password || !phone) {
      return res
        .status(400)
        .json({ status: 'fail', message: '所有欄位皆必填' });
    }

    // 3. 檢查是否已存在相同 email 或 account
    const duplicate = await prisma.user.findFirst({
      where: { OR: [{ email }, { account }] },
    });
    if (duplicate) {
      return res
        .status(409)
        .json({ status: 'fail', message: '帳號或 Email 已被註冊' });
    }

    // 4. 雜湊密碼
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. 建立使用者
    const user = await prisma.user.create({
      // data: { name, email, account, passwordHash },
      data: {
        name,
        email,
        account,
        password:passwordHash,
        phone,
        birthday: new Date(birthday),
        is_coach: +is_coach,
      },
      select: { id: true, name: true, email: true, account: true, phone: true }, // 不回傳 hash
    });
    await fetch(`http://localhost:3005/api/cart/createCart/${user.id}`,{method:'POST'});

    return res.status(201).json({ status: 'success', data: { user } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: '伺服器發生錯誤，請稍後再試',
    });
  }
});

export default router;
