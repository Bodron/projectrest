import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connectDB from '../../../lib/db'
import Product from '../../../models/Product'

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

    const { name, description, price, category, image } = req.body

    const product = await Product.create({
      restaurant: session.user.id,
      name,
      description,
      price: parseFloat(price),
      category,
      image,
    })

    return res
      .status(201)
      .json({ message: 'Product created successfully', product })
  } catch (error) {
    console.error('Create product error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
