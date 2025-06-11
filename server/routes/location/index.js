// server/routes/location/index.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
  try {
    // 只取所有 location table 裡的 id + name
    const locs = await prisma.location.findMany({
      select: { id: true, name: true }
    });
    res.json(locs);
  } catch (err) {
    next(err);
  }
});

export default router;
