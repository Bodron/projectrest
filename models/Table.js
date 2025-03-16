import mongoose from 'mongoose'

const tableSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: [true, 'Numărul mesei este obligatoriu'],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    qrCode: {
      type: String,
      unique: true,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    currentSession: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved'],
      default: 'available',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacitatea mesei este obligatorie'],
    },
    location: {
      type: String,
      enum: ['interior', 'terrace'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Middleware pentru generarea codului QR înainte de salvare
tableSchema.pre('save', async function (next) {
  if (!this.qrCode) {
    // Generăm un ID unic pentru masă care va fi folosit în URL-ul QR
    this.qrCode = `${this.restaurant}-${this.number}-${Date.now()}`
  }
  next()
})

export default mongoose.models.Table || mongoose.model('Table', tableSchema)
