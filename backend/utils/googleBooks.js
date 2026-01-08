// backend/utils/googleBooks.js
const axios = require('axios');

const fetchBookByISBN = async (isbn) => {
  try {
    const cleanIsbn = isbn.replace(/-/g, '');
    const res = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`
    );
    if (res.data.items && res.data.items.length > 0) {
      const book = res.data.items[0].volumeInfo;
      return {
        isbn: cleanIsbn,
        title: book.title || 'Unknown Title',
        authors: book.authors || ['Unknown Author'],
        description: book.description || 'No description available.',
        imageUrl: book.imageLinks?.thumbnail || '',
      };
    }
    return null;
  } catch (err) {
    console.error('Google Books API error:', err.message);
    return {
      isbn: isbn,
      title: 'Book Title Unavailable',
      authors: ['Unknown Author'],
      description: 'Description temporarily unavailable.',
      imageUrl: '',
    };
  }
};

module.exports = { fetchBookByISBN };