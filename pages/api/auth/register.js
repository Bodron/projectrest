import connectDB from '../../../lib/db'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { name, email, password } = req.body

    // Validare de bază
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Toate câmpurile sunt obligatorii' })
    }

    // Verifică dacă utilizatorul există deja
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Există deja un cont cu acest email' })
    }

    // Hash parola
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Creează noul utilizator
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'restaurant',
    })

    // Elimină parola din răspuns
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return res.status(201).json({
      message: 'Restaurant înregistrat cu succes',
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}
