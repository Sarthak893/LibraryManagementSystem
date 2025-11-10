// backend/models/Rental.js
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  book: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  rentedAt: { 
    type: Date, 
    default: Date.now 
  },
  returnCode: { 
    type: String, 
    required: true,
    unique: true 
  },
  returned: { 
    type: Boolean, 
    default: false 
  },
  returnedAt: Date,
}, { 
  timestamps: true,
  // ✅ AUTO-GENERATE returnCode BEFORE validation
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// ✅ METHOD 1: Use `pre('validate')` — runs BEFORE required check
rentalSchema.pre('validate', function (next) {
  if (this.isNew && !this.returnCode) {
    // Generate 6-digit code
    this.returnCode = Math.floor(100000 + Math.random() * 900000).toString();
  }
  next();
});

// ✅ METHOD 2: Fallback — override save if needed
rentalSchema.pre('save', function (next) {
  if (this.isNew && !this.returnCode) {
    this.returnCode = Math.floor(100000 + Math.random() * 900000).toString();
  }
  next();
});

module.exports = mongoose.model('Rental', rentalSchema);