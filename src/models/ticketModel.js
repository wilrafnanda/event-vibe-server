import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  ticketType: {
    type: mongoose.Schema.Types.ObjectId,
  },
  
  // Store price details directly for audit trail
  ticketTypeName: { type: String, required: true },
  ticketTypeDescription: String,
  pricePaid: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'FCFA' },
  
  ticketCode: { type: String, required: true, unique: true },
  status: { type: String, enum: ['valid', 'used', 'cancelled'], default: 'valid' },
  
  // Payment Info
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: String,
  transactionId: String,
  paidAt: Date
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);