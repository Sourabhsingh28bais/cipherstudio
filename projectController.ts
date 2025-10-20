import { Request, Response, NextFunction } from 'express'
import Project, { IProject } from '../models/Project'
import { AuthRequest } from '../middleware/auth'

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, files, settings, isPublic, tags } = req.body

    const project = new Project({
      name,
      description,
      files: files || [],
      settings: settings || { theme: 'light', autosave: true },
      owner: req.user!._id,
      isPublic: isPublic || false,
      tags: tags || []
    })

    await project.save()

    res.status(201).json({
      success: true,
      data: project
    })
  } catch (error) {
    next(error)
  }
}

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search, tags, isPublic } = req.query

    const query: any = {}

    if (req.user) {
      query.$or = [
        { owner: req.user._id },
        { isPublic: true }
      ]
    } else {
      query.isPublic = true
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (tags && Array.isArray(tags)) {
      query.tags = { $in: tags }
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true'
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))

    const total = await Project.countDocuments(query)

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const project = await Project.findById(id).populate('owner', 'name email')

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    // Check if user has access to the project
    if (!project.isPublic && (!req.user || project.owner._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    next(error)
  }
}

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, description, files, settings, isPublic, tags } = req.body

    const project = await Project.findById(id)

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    // Check if user owns the project
    if (!req.user || project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    // Update fields
    if (name !== undefined) project.name = name
    if (description !== undefined) project.description = description
    if (files !== undefined) project.files = files
    if (settings !== undefined) project.settings = { ...project.settings, ...settings }
    if (isPublic !== undefined) project.isPublic = isPublic
    if (tags !== undefined) project.tags = tags

    await project.save()

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    next(error)
  }
}

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const project = await Project.findById(id)

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    // Check if user owns the project
    if (!req.user || project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    await Project.findByIdAndDelete(id)

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const duplicateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const originalProject = await Project.findById(id)

    if (!originalProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    // Check if user has access to the project
    if (!originalProject.isPublic && (!req.user || originalProject.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    const duplicatedProject = new Project({
      name: `${originalProject.name} (Copy)`,
      description: originalProject.description,
      files: originalProject.files,
      settings: originalProject.settings,
      owner: req.user?._id || originalProject.owner,
      isPublic: false,
      tags: originalProject.tags
    })

    await duplicatedProject.save()

    res.status(201).json({
      success: true,
      data: duplicatedProject
    })
  } catch (error) {
    next(error)
  }
}
