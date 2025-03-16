import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Numele restaurantului este obligatoriu'],
    },
    email: {
      type: String,
      required: [true, 'Email-ul este obligatoriu'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Parola este obligatorie'],
    },
    // Câmpuri opționale
    phone: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    cuisine: {
      type: String,
      required: false,
    },
    address: {
      street: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        default: 'România',
      },
      postalCode: {
        type: String,
        required: false,
      },
    },
    role: {
      type: String,
      enum: ['restaurant', 'admin'],
      default: 'restaurant',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.User || mongoose.model('User', userSchema)
