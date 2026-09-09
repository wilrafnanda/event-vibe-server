import mongoose from 'mongoose';

const eventHostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  organizationName: {
    type: String,
    maxlength: 100
  },
  accountStatus: {
    type: String,
    enum: ['active', 'confirmed', 'blocked', 'not verify'],
    default: 'not verify'
  }
}, {
  timestamps: true
});

export default mongoose.model('EventHost', eventHostSchema);