import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connectDB from '../../../lib/db'
import Table from '../../../models/Table'
import QRCode from 'qrcode'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await connectDB()

    const { number, capacity, location } = req.body

    // Verifică dacă masa există deja pentru acest restaurant
    const existingTable = await Table.findOne({
      restaurant: session.user.id,
      number,
    })

    if (existingTable) {
      return res
        .status(400)
        .json({ message: 'O masă cu acest număr există deja' })
    }

    // Creează URL-ul pentru QR code
    const menuUrl = `${process.env.NEXTAUTH_URL}/menu/${session.user.id}/${number}`

    // Generează QR code
    const qrCode = await QRCode.toDataURL(menuUrl)

    // Creează masa nouă
    const table = await Table.create({
      restaurant: session.user.id,
      number,
      capacity,
      location,
      qrCode,
      menuUrl,
    })

    return res.status(201).json({
      message: 'Table created successfully',
      table,
    })
  } catch (error) {
    console.error('Create table error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
