import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import { AuthResponse, JwtPayload } from '../types/type.js'

// Helper
const generateToken = (id: string, username: string): string => {
  return jwt.sign(
    { id, username } as JwtPayload,
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )
}

// POST /api/auth/setup
export const setupAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Admin.findOne({})
    if (existing) {
      res.status(400).json({ message: 'Admin already exists' })
      return
    }
    const admin = await Admin.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    })
    res.status(201).json({ message: 'Admin created!', username: admin.username })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/auth/login
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    const admin = await Admin.findOne({ username })
    if (!admin || !(await admin.matchPassword(password))) {
      res.status(401).json({ message: 'Invalid username or password' })
      return
    }

    const response: AuthResponse = {
      token: generateToken(admin._id.toString(), admin.username),
      username: admin.username,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}



// POST /api/auth/change-password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' })
      return
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' })
      return
    }
    const admin = await Admin.findById(req.admin?.id)
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' })
      return
    }
    const isMatch = await admin.matchPassword(currentPassword)
    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect' })
      return
    }
    admin.password = newPassword
    await admin.save()
    res.json({ message: 'Password updated!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/auth/change-username
export const changeUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { newUsername, password } = req.body
    if (!newUsername || !password) {
      res.status(400).json({ message: 'Username and password are required' })
      return
    }
    const admin = await Admin.findById(req.admin?.id)
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' })
      return
    }
    // Verify password before allowing username change
    const isMatch = await admin.matchPassword(password)
    if (!isMatch) {
      res.status(401).json({ message: 'Password is incorrect' })
      return
    }
    admin.username = newUsername
    await admin.save()
    // Return a new token with the updated username
    const token = generateToken(admin._id.toString(), admin.username)
    res.json({ message: 'Username updated!', token, username: admin.username })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}