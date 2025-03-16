import connectDB from '../../../lib/db'
import Product from '../../../models/Product'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { restaurantId } = req.query

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' })
    }

    const products = await Product.find({ restaurant: restaurantId }).sort({
      category: 1,
      name: 1,
    })

    return res.status(200).json(products)
  } catch (error) {
    console.error('Get products error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
