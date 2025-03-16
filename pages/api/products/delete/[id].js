import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import connectDB from '../../../../lib/db'
import Product from '../../../../models/Product'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session || session.user.role !== 'restaurant') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await connectDB()

    const { id } = req.query

    const product = await Product.findOneAndDelete({
      _id: id,
      restaurant: session.user.id,
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    return res.status(200).json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
