import express from 'express'
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  duplicateProject
} from '../controllers/projectController'
import { auth, optionalAuth } from '../middleware/auth'

const router = express.Router()

// Public routes
router.get('/', optionalAuth, getProjects)
router.get('/:id', optionalAuth, getProject)

// Protected routes
router.post('/', auth, createProject)
router.put('/:id', auth, updateProject)
router.delete('/:id', auth, deleteProject)
router.post('/:id/duplicate', optionalAuth, duplicateProject)

export default router
