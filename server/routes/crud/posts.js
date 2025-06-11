import express from 'express'
const router = express.Router()
// 使用mysql
import db from '../../config/mysql.js'

// 得到多筆文章
// 網址: GET /api/posts
router.get('/', async function (req, res) {
  // 執行sql
  const [posts] = await db.query(`SELECT * FROM blog`)

  console.log(posts)
  // 回應到前端
  return res.json({ status: 'success', data: { posts } })
})

// 得到單筆文章
// 網址: GET /api/posts/:id
router.get('/:id', async function (req, res) {
  // 從動態網址得到id(需要轉換為數字，因為在資料表的id是自動遞增的數字)
  const id = Number(req.params.id)
  // 執行sql
  const [posts] = await db.query(`SELECT * FROM blog WHERE id = ${id}`)
  // 只需要一筆資料
  const post = posts[0]

  console.log(post)
  // 回應到前端
  return res.json({ status: 'success', data: { post } })
})

// 新增一筆文章
// 網址: POST /api/posts
router.post('/', async function (req, res) {
  // 從前端得到title, content
  const { title, content } = req.body

  // 執行sql
  const [result] = await db.query(
    `INSERT INTO blog (title, content) VALUES ('${title}','${content}');`
  )

  console.log(result)
  // 回應到前端
  return res.json({ status: 'success', data: null })
})

// 修改文章
// 網址: PUT /api/posts/:id
router.put('/:id', async function (req, res) {
  // 從動態網址得到id(需要轉換為數字，因為在資料表的id是自動遞增的數字)
  const id = Number(req.params.id)
  // 從前端得到title, content
  const { title, content } = req.body
  // 執行sql
  const [result] = await db.query(
    `UPDATE blog SET title='${title}',content='${content}' WHERE id = ${id}`
  )
  console.log(result)
  // 回應到前端
  if (result.changedRows) {
    return res.json({ status: 'success', data: null })
  } else {
    return res.json({ status: 'error', message: '沒有資料被更改' })
  }
})

// 刪除文章
// 網址: DELETE /api/posts/:id
router.delete('/:id', async function (req, res) {
  // 從動態網址得到id(需要轉換為數字，因為在資料表的id是自動遞增的數字)
  const id = Number(req.params.id)
  // 執行sql
  const [result] = await db.query(`DELETE FROM blog WHERE id = ${id}`)
  console.log(result)
  // 回應到前端
  if (result.affectedRows) {
    return res.json({ status: 'success', data: null })
  } else {
    return res.json({ status: 'error', message: '沒有資料被刪除' })
  }
})

export default router
