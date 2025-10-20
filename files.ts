import express from 'express'
import { auth } from '../middleware/auth'

const router = express.Router()

// File upload/download routes would go here
// For now, we'll keep it simple since we're using localStorage primarily

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Files service is running' })
})

export default router
