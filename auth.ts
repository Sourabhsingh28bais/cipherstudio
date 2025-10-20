import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

export interface AuthRequest extends Request {
  user?: IUser
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token, authorization denied'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token is not valid'
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token is not valid'
    })
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      const user = await User.findById(decoded.id).select('-password')
      req.user = user || undefined
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}
