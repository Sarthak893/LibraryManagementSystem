const express = require("express");
const axios = require("axios");
const Book = require("../models/Book");
const { fetchBookByISBN } = require("../utils/googleBooks");
const { auth, librarianOnly } = require("../middleware/auth");

const router = express.Router();

let popularBooksCache = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

router.get("/popular", async (req, res) => {
  try {
    if (
      popularBooksCache.length &&
      Date.now() - lastFetchTime < CACHE_DURATION
    ) {
      console.log("Serving books from cache");
      return res.json(popularBooksCache);
    }

    console.log(
      "Loaded key:",
      process.env.GOOGLE_BOOKS_API_KEY
        ? process.env.GOOGLE_BOOKS_API_KEY.substring(0, 10)
        : "NO KEY"
    );

    const response = await axios.get(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: "subject:fiction",
          maxResults: 20,
          orderBy: "relevance",
          key: process.env.GOOGLE_BOOKS_API_KEY,
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
              (id) => id.type === "ISBN_13"
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

    console.log("Fetched", books.length);

    return res.json(books);
  } catch (err) {
    console.error("STATUS:", err.response?.status);
    console.error("DATA:", err.response?.data);
    console.error("MESSAGE:", err.message);

    if (popularBooksCache.length) {
      console.log("Returning cached books");
      return res.json(popularBooksCache);
    }

    return res.status(500).json({
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
  }
});

// Search ISBN
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
    res.status(500).json({
      msg: "Server error",
    });
  }
});

// Add Book
router.post("/", [auth, librarianOnly], async (req, res) => {
  try {
    const { isbn, title, authors, description, imageUrl } = req.body;

    let book = await Book.findOne({ isbn });

    if (book) {
      return res.status(400).json({
        msg: "Book already exists",
      });
    }

    book = await Book.create({
      isbn,
      title,
      authors,
      description,
      imageUrl,
      addedBy: req.user.id,
      available: true,
    });

    res.status(201).json(book);
  } catch {
    res.status(500).json({
      msg: "Server error",
    });
  }
});

// Update
router.put("/:id", [auth, librarianOnly], async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({
        msg: "Book not found",
      });
    }

    res.json(book);
  } catch {
    res.status(500).json({
      msg: "Server error",
    });
  }
});

// Delete
router.delete("/:id", [auth, librarianOnly], async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        msg: "Book not found",
      });
    }

    res.json({
      msg: "Book removed",
    });
  } catch {
    res.status(500).json({
      msg: "Server error",
    });
  }
});

// Local Library
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();

    res.json(books);
  } catch {
    res.status(500).json({
      msg: "Server error",
    });
  }
});

module.exports = router;