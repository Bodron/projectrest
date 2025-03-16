import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  notes: String,
})

const orderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'delivered', 'paid', 'cancelled'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    specialRequests: String,
    preparationTime: Number, // timpul estimat în minute
    completedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Generare număr comandă
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    this.orderNumber = `${year}${month}${day}-${this.table}-${random}`
  }
  next()
})

// Metode pentru statistici
orderSchema.statics.getRestaurantStats = async function (
  restaurantId,
  startDate,
  endDate
) {
  return this.aggregate([
    {
      $match: {
        restaurant: mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'paid',
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' },
      },
    },
  ])
}

// Metode pentru produse populare
orderSchema.statics.getPopularProducts = async function (
  restaurantId,
  limit = 10
) {
  return this.aggregate([
    {
      $match: {
        restaurant: mongoose.Types.ObjectId(restaurantId),
        status: 'paid',
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: {
          $sum: { $multiply: ['$items.quantity', '$items.price'] },
        },
      },
    },
    {
      $sort: { totalQuantity: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
  ])
}

export default mongoose.models.Order || mongoose.model('Order', orderSchema)
