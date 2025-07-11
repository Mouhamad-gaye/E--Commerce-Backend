import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },

  totalAmount: { type: Number, required: true },
  transactionId: { type: String, unique: true }, // External payment gateway reference

  paymentMethod: {
    type: String,
    enum: ["card", "paypal", "bank", "crypto"],
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },

  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },

  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },

  itemsPurchased: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      priceAtPurchase: Number // Snapshot of price at time of transaction
    }
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
