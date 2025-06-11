import express from 'express'
const router = express.Router()

/* GET home page. */
router.get('/:id', function (req, res) {
  res
    .status(200)
    .json({ status: 'success', message: 'Express(path: /api/demo1)' })
})

export default router
