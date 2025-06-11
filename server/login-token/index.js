import express from 'express';
import multer from 'multer';
import moment from 'moment';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import users from './users.js';
console.log(users);

const upload = multer();
const whiteList = ['http://localhost:5500', 'http://localhost:3000'];
const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允許連線'));
    }
  },
};

const secretkey = process.env.JWT_SECRET_KEY;

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ status: 'success', data: null, message: '首頁' });
});

app.post('/api/users/login', upload.none(), (req, res) => {
  const { account, password } = req.body;
  const user = users.find((u) => u.account == account);
  if (!user) return res.json({ status: 'error', message: '帳號或密碼錯誤' });
  if (user.password != password)
    return res.json({ status: 'error', message: '帳號號或密碼錯誤' });
  const token = jwt.sign(
    {
      account: user.account,
      mail: user.mail,
      head: user.head,
    },
    secretkey,
    { expiresIn: '1d' }
  );
  res.json({
    status: 'success',
    data: { token },
    message: '登入成功',
  });
});
app.post('/api/users/logout', checkToken, (req, res) => {
  const token = jwt.sign(
    {
      account: '',
      mail: '',
      head: '',
    },
    secretkey,
    { expiresIn: '-10s' }
  );

  res.json({
    status: 'success',
    data: { token },
    message: '登出成功',
  });
});

app.post('/api/users/status', checkToken, (req, res) => {
  res.json({
    status: 'success',
    data: { token: 'user1' },
    message: '狀態:登入中',
  });
});

app.listen(3005, () => {
  console.log('伺服器啟動中 http://localhost:3005');
});

function checkToken(req, res, next) {
  let token = req.get('Authorization');
  if (!token)
    return res.json({
      status: 'error',
      message: '狀態:無驗證資料',
    });
  if (token.startsWith('bearer'))
    return res.json({
      status: 'error',
      message: '驗證資料錯誤',
    });
  token = token.slice(7);
  console.log(token);
  jwt.verify(token, secretkey, (err, decoded) => {
    if (err)
      return res.json({
        status: 'error',
        message: '驗證資料失效，請重新登入',
      });
    next();
  });
}
