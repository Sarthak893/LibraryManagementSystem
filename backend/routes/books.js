// backend/routes/books.js
const express = require('express');
const Book = require('../models/Book');
const { fetchBookByISBN } = require('../utils/googleBooks');
const { auth, librarianOnly } = require('../middleware/auth');

const router = express.Router();

// backend/routes/books.js
const axios = require('axios');

// ... existing code ...

// @route   GET /api/books/popular
// @desc    Get 12 popular books from Google Books (multi-query + fallback)
router.get('/popular', async (req, res) => {
  try {
    const queries = [
      'subject:fiction',
      'subject:computers',
      'subject:biography',
      'subject:history',
      'newest',
      'inauthor:"Stephen King"',
      'intitle:"The"'
    ];

    let allBooks = [];

    for (const q of queries) {
      try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
          params: {
            q: q,
            maxResults: 5,
            orderBy: 'relevance'
          }
        });

        if (response.data.items) {
          allBooks = allBooks.concat(
            response.data.items.map(item => {
              const info = item.volumeInfo;
              return {
                id: item.id,
                isbn: info.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                      info.industryIdentifiers?.[0]?.identifier || item.id,
                title: info.title || 'Unknown Title',
                authors: info.authors || ['Unknown Author'],
                description: info.description 
                  ? info.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                  : 'No description available.',
                imageUrl: info.imageLinks?.thumbnail?.replace('http://', 'https://') || '',
                publishedDate: info.publishedDate || ''
              };
            })
          );
        }
      } catch (err) {
        console.warn(`Failed to fetch for query: ${q}`, err.message);
      }
    }

    // Deduplicate by ISBN or ID
    const seen = new Set();
    const uniqueBooks = allBooks.filter(book => {
      const key = book.isbn || book.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Return top 12
    res.json(uniqueBooks.slice(0, 12));

  } catch (err) {
    console.error('Error fetching popular books:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/books/search/:isbn
// @desc    Search book by ISBN (from Google Books)
router.get('/search/:isbn', async (req, res) => {
  try {
    const bookData = await fetchBookByISBN(req.params.isbn);
    if (!bookData) return res.status(404).json({ msg: 'Book not found' });
    res.json(bookData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/books
// @desc    Librarian adds a book to local library
// @access  Librarian only
router.post('/', [auth, librarianOnly], async (req, res) => {
  const { isbn, title, authors, description, imageUrl } = req.body;

  try {
    let book = await Book.findOne({ isbn });
    if (book) return res.status(400).json({ msg: 'Book already in library' });

    book = new Book({
      isbn,
      title,
      authors,
      description,
      imageUrl,
      addedBy: req.user.id,
      available: true
    });

    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/books/:id
// @desc    Edit book (librarian)
router.put('/:id', [auth, librarianOnly], async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete book (librarian)
router.delete('/:id', [auth, librarianOnly], async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    res.json({ msg: 'Book removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/books
// @desc    Get all books in local library
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
// @route   GET /api/books/popular
// @desc    Get popular books from Google Books (cached or fresh)
router.get('/popular', async (req, res) => {
  try {
    // Optional: Cache in DB for 1 hour to avoid API limits
    const cacheKey = 'popular_books_cache';
    const cache = await Book.findOne({ isbn: cacheKey });
    
    const now = new Date();
    if (cache && cache.updatedAt > new Date(now - 60 * 60 * 1000)) {
      // Return cached
      return res.json(JSON.parse(cache.description));
    }

    // Fetch fresh
    const books = await fetchPopularBooks();

    // Cache in DB (abusing Book model — or create Cache model)
    if (cache) {
      cache.description = JSON.stringify(books);
      await cache.save();
    } else {
      await Book.create({
        isbn: cacheKey,
        title: 'Popular Books Cache',
        description: JSON.stringify(books),
        available: false
      });
    }

    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;