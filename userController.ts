import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'
import { AuthRequest } from '../middleware/auth'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id).populate('projects')
    
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, avatar } = req.body

    const user = await User.findById(req.user!._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    if (name !== undefined) user.name = name
    if (avatar !== undefined) user.avatar = avatar

    await user.save()

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user!._id).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body

    const user = await User.findById(req.user!._id).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Password is incorrect'
      })
    }

    // Delete user and all their projects
    await User.findByIdAndDelete(req.user!._id)
    // TODO: Also delete all projects owned by this user

    res.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
