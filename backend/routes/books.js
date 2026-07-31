// backend/routes/books.js

const express = require("express");
const axios = require("axios");
const Book = require("../models/Book");
const { fetchBookByISBN } = require("../utils/googleBooks");
const { auth, librarianOnly } = require("../middleware/auth");

const router = express.Router();

// ===============================
// Cache popular books (1 hour)
// ===============================
let popularBooksCache = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// ==========================================
// GET /api/books/popular
// Popular books from Google Books
// ==========================================
router.get("/popular", async (req, res) => {
  try {
    // Serve cached books if available
    if (
      popularBooksCache.length > 0 &&
      Date.now() - lastFetchTime < CACHE_DURATION
    ) {
      console.log("Serving books from cache");
      return res.json(popularBooksCache);
    }

    console.log("Fetching books from Google Books...");

    const response = await axios.get(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: "subject:fiction",
          maxResults: 20,
          orderBy: "relevance",
          key:process.env.GOOGLE_BOOKS_API_KEY

          // If you later create a Google API key:
          // key: process.env.GOOGLE_BOOKS_API_KEY
        },
      }
    );

    const books =
      response.data.items?.map((item) => {
        const info = item.volumeInfo;

        return {
          id: item.id,

          isbn:
            info.industryIdentifiers?.find(
              (x) => x.type === "ISBN_13"
            )?.identifier ||
            info.industryIdentifiers?.[0]?.identifier ||
            item.id,

          title: info.title || "Unknown Title",

          authors: info.authors || ["Unknown Author"],

          description: info.description
            ? info.description.replace(/<[^>]*>/g, "").substring(0, 200) + "..."
            : "No description available.",

          imageUrl:
            info.imageLinks?.thumbnail?.replace("http://", "https://") || "",

          publishedDate: info.publishedDate || "",
        };
      }) || [];

    popularBooksCache = books;
    lastFetchTime = Date.now();

    console.log(`Fetched ${books.length} books`);

    res.json(books);
  } catch (err) {
  console.error("STATUS:", err.response?.status);
  console.error("DATA:", err.response?.data);
  console.error("MESSAGE:", err.message);

  res.status(500).json({
    status: err.response?.status,
    data: err.response?.data,
    message: err.message
  });
}

    // If Google fails, return cached books
    if (popularBooksCache.length > 0) {
      console.log("Returning cached books");
      return res.json(popularBooksCache);
    }

    res.status(500).json({
      msg: "Unable to fetch books from Google Books",
    });
  }
);

// ==========================================
// GET /api/books/search/:isbn
// Search by ISBN
// ==========================================
router.get("/search/:isbn", async (req, res) => {
  try {
    const bookData = await fetchBookByISBN(req.params.isbn);

    if (!bookData) {
      return res.status(404).json({
        msg: "Book not found",
      });
    }

    res.json(bookData);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error",
    });
  }
});

// ==========================================
// POST /api/books
// Add book
// Librarian only
// ==========================================
router.post("/", [auth, librarianOnly], async (req, res) => {
  const {
    isbn,
    title,
    authors,
    description,
    imageUrl,
  } = req.body;

  try {
    let book = await Book.findOne({ isbn });

    if (book) {
      return res.status(400).json({
        msg: "Book already exists",
      });
    }

    book = new Book({
      isbn,
      title,
      authors,
      description,
      imageUrl,
      addedBy: req.user.id,
      available: true,
    });

    await book.save();

    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error",
    });
  }
});

// ==========================================
// PUT /api/books/:id
// Update book
// ==========================================
router.put("/:id", [auth, librarianOnly], async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!book) {
      return res.status(404).json({
        msg: "Book not found",
      });
    }

    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error",
    });
  }
});

// ==========================================
// DELETE /api/books/:id
// Delete book
// ==========================================
router.delete("/:id", [auth, librarianOnly], async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        msg: "Book not found",
      });
    }

    res.json({
      msg: "Book removed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error",
    });
  }
});

// ==========================================
// GET /api/books
// Get all library books
// ==========================================
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();

    res.json(books);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

module.exports = router;