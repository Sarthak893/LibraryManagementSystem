// backend/models/Book.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  isbn: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  authors: [String],
  description: String,
  imageUrl: String,
  // Local library metadata
  available: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // librarian who added
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);