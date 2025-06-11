import 'dotenv/config';
import jwt from "jsonwebtoken"
export function verifyToken(req, res, next) {
  const SECRET_KEY = 'testGreat';
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    console.log('token驗證成功');
    req.id = user.id; // 把解碼的 payload 存起來
    next(); // 通過驗證，繼續下一步
  });
}
