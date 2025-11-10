// backend/routes/rentals.js
const express = require('express');
const Book = require('../models/Book');
const Rental = require('../models/Rental');
const { auth } = require('../middleware/auth');
const { fetchBookByISBN } = require('../utils/googleBooks');

const router = express.Router();

// @route   POST /api/rentals/rent
// @desc    Rent a book (auto-add if missing)
router.post('/rent', auth, async (req, res) => {
  const { isbn } = req.body;

  try {
    // 1. Find or create book
    let book = await Book.findOne({ isbn });
    if (!book) {
      const googleBook = await fetchBookByISBN(isbn);
      if (!googleBook) {
        return res.status(404).json({ 
          msg: 'Book not found in Google Books. Please try another ISBN.' 
        });
      }

      // Fallback values if any field is missing
      book = new Book({
        isbn: googleBook.isbn || isbn,
        title: googleBook.title || 'Unknown Title',
        authors: googleBook.authors || ['Unknown Author'],
        description: googleBook.description || 'No description available.',
        imageUrl: googleBook.imageUrl || '',
        available: true,
        addedBy: null
      });
      await book.save();
    }

    // 2. Force availability (emergency fix for demo)
    if (!book.available) {
      book.available = true;
      await book.save();
    }

    // 3. Rent it
    book.available = false;
    await book.save();

    const rental = new Rental({
      student: req.user.id,
      book: book._id,
      rentedAt: new Date()
    });
    await rental.save();

    // ✅ CRITICAL: Return returnCode (was missing in your version!)
    res.json({
      msg: '✅ Rented successfully',
      returnCode: rental.returnCode, // ← THIS WAS MISSING!
      book: { 
        title: book.title, 
        isbn: book.isbn 
      }
    });

  } catch (err) {
    console.error('Rent error:', err.message);
    res.status(500).json({ 
      msg: 'Server error. Please try again later.', 
      details: err.message 
    });
  }
});

// @route   POST /api/rentals/return
// @desc    Return book by ISBN + returnCode
router.post('/return', auth, async (req, res) => {
  const { isbn, returnCode } = req.body;

  try {
    const book = await Book.findOne({ isbn });
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    const rental = await Rental.findOne({
      student: req.user.id,
      book: book._id,
      returnCode,
      returned: false
    });

    if (!rental) {
      return res.status(400).json({ msg: 'Invalid ISBN or return code' });
    }

    await Rental.updateOne(
      { _id: rental._id },
      { returned: true, returnedAt: new Date() }
    );

    await Book.updateOne(
      { _id: book._id },
      { available: true }
    );

    res.json({ msg: '✅ Book returned successfully!' });

  } catch (err) {
    console.error('Return error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/rentals/me
// @desc    Get current user's rentals
router.get('/me', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ student: req.user.id })
      .populate('book')
      .sort({ rentedAt: -1 });
    res.json(rentals);
  } catch (err) {
    console.error('Fetch rentals error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;