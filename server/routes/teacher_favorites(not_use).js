import express from 'express'
const router = express.Router()

import authenticate from '../middlewares/authenticate.js'
import {
  addUserFavorite,
  deleteUserFavorite,
} from '../services/user.js'
import { successResponse, errorResponse, isDev } from '../lib/utils.js'


router.put('/:productId', authenticate, async (req, res) => {
  // 取得商品id，從req.params.productId取得
  const productId = Number(req.params.productId)
  // 取得會員id，從req.user.id取得(透過JWT解碼)
  const userId = req.user.id
  // 如果是開發環境，顯示訊息
  if (isDev) console.log('productId', productId, 'userId', userId)

  try {
    await addUserFavorite(userId, productId)
    successResponse(res)
  } catch (error) {
    errorResponse(res, error)
  }
})

router.delete('/:productId', authenticate, async (req, res) => {
  // 取得商品id，從req.params.productId取得
  const productId = Number(req.params.productId)
  // 取得會員id，從req.user.id取得(透過JWT解碼)
  const userId = req.user.id
  // 如果是開發環境，顯示訊息
  if (isDev) console.log('productId', productId, 'userId', userId)

  try {
    await deleteUserFavorite(userId, productId)
    successResponse(res)
  } catch (error) {
    errorResponse(res, error)
  }
})

export default router
