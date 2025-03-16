import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connectDB from '../../../lib/db'
import Order from '../../../models/Order'
import Table from '../../../models/Table'
import { nanoid } from 'nanoid'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { tableId, items, specialRequests } = req.body

    // Verifică dacă masa există
    const table = await Table.findById(tableId)
    if (!table) {
      return res.status(404).json({ message: 'Masa nu a fost găsită' })
    }

    // Calculează suma totală
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Generează un ID de sesiune pentru masă dacă nu există
    if (!table.sessionId) {
      table.sessionId = nanoid()
      table.isOccupied = true
      await table.save()
    }

    // Creează comanda
    const order = await Order.create({
      table: tableId,
      restaurant: table.restaurant,
      sessionId: table.sessionId,
      items,
      total,
      specialRequests,
      status: 'pending',
    })

    // Populează detaliile pentru răspuns
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('table')

    return res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder,
      sessionId: table.sessionId,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
