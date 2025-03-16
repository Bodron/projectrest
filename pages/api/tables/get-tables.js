import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connectDB from '../../../lib/db'
import Table from '../../../models/Table'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await connectDB()

    const tables = await Table.find({ restaurant: session.user.id }).sort({
      number: 1,
    })

    return res.status(200).json(tables)
  } catch (error) {
    console.error('Get tables error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
