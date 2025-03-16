import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Numele produsului este obligatoriu'],
    },
    description: {
      type: String,
      required: [true, 'Descrierea produsului este obligatorie'],
    },
    price: {
      type: Number,
      required: [true, 'Prețul produsului este obligatoriu'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Categoria produsului este obligatorie'],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    allergens: [
      {
        type: String,
      },
    ],
    ingredients: [
      {
        type: String,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number, // timpul în minute
      default: 15,
    },
    nutritionalInfo: {
      calories: Number,
      proteins: Number,
      carbs: Number,
      fats: Number,
    },
    tags: [
      {
        type: String,
      },
    ],
    popularity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Index pentru căutare
productSchema.index({ name: 'text', description: 'text', category: 'text' })

export default mongoose.models.Product ||
  mongoose.model('Product', productSchema)
