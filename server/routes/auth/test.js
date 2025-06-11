import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../config/mysql.js';
import { verifyToken } from '../../middlewares/verify-token.js';
const SECRET_KEY = 'testGreat';
/* GET home page. */
router.post('/', async function (req, res) {
  const { account, password } = req.body;
  const query = `select id,account,password from user where account=?`;
  const response = await db.execute(query, [account]).then(function (userData) {
    return userData[0][0];
  });
  console.log(response);
  console.log('password', password);
  console.log('response.password', response.password);
  const isAuth = bcrypt.compareSync(password, response.password);
  if (!isAuth) {
    return res.json({
      status: 'success',
      message: '密碼錯誤',
    });
  }
  const token = jwt.sign(
    {
      id: response.id,
      account: response.account,
    },
    SECRET_KEY,
    { expiresIn: '1d' }
  );
  console.log(token);
  res.status(200).json({
    status: 'success',
    token,
    data: response,
    message: 'Express(path: /api/demo1)',
  });
});

router.get('/', verifyToken, async function (req, res) {
  const id = req.id;
  const query = `select * from user where id=?`;
  const response = await db.execute(query, [id]).then(function (userData) {
    return userData[0][0];
  });
  res.status(200).json({
    status: 'success',
    data: response,
    message: '成功',
  });
});
export default router;
