import mongoose from 'mongoose';

const ticketTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0, min: 0 },
  capacity: { type: Number, default: 0 },
  description: { type: String }
});

const eventSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'EventHost', required: true },
  eventName: { type: String, required: true, maxlength: 100 },
  description: String,
  picture: String,
  location: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Pricing Configuration
  isPaidEvent: { type: Boolean, default: false },
  ticketTypes: [ticketTypeSchema],
  
  // Metadata
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  reviewedByAdmin: { type: Boolean, default: false }
}, { timestamps: true });

// Index for filtering events
eventSchema.index({ status: 1, startDate: 1 });

export default mongoose.model('Event', eventSchema);