const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  TinNumber: {
    type: String,
    required: true,
  },
  images: [
    {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
  ],
  idCardImages: [
    {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // Optional: Use enums for consistent status values
    default: 'pending',
  },
  PostedByuserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
},
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);
