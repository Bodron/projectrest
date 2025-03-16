import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import connectDB from '../../../../lib/db'
import Product from '../../../../models/Product'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session || session.user.role !== 'restaurant') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await connectDB()

    const { id } = req.query
    const { name, description, price, category, image } = req.body

    const product = await Product.findOne({
      _id: id,
      restaurant: session.user.id,
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    product.name = name
    product.description = description
    product.price = parseFloat(price)
    product.category = category
    product.image = image

    await product.save()

    return res
      .status(200)
      .json({ message: 'Product updated successfully', product })
  } catch (error) {
    console.error('Update product error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
