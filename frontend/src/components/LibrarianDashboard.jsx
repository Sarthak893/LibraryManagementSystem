// src/components/LibrarianDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI } from '../services/api';
import BookCard from './BookCard';

const LibrarianDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [localBooks, setLocalBooks] = useState([]);
  const [searchIsbn, setSearchIsbn] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [editBook, setEditBook] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch local books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await booksAPI.getAll();
        setLocalBooks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    try {
      const res = await booksAPI.searchByISBN(searchIsbn);
      setSearchResult(res.data);
    } catch (err) {
      setSearchError('Book not found or invalid ISBN');
    }
  };

  const handleAddToLocal = async (bookData) => {
    try {
      await booksAPI.add(bookData);
      alert('Book added to library!');
      // Refetch local books
      const res = await booksAPI.getAll();
      setLocalBooks(res.data);
      setSearchResult(null);
      setSearchIsbn('');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to add book');
    }
  };

  const handleEdit = (book) => {
    setEditBook(book);
    setEditForm({
      title: book.title,
      authors: book.authors.join(', '),
      description: book.description,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await booksAPI.update(editBook._id, {
        ...editForm,
        authors: editForm.authors.split(',').map(a => a.trim()),
      });
      alert('Book updated!');
      setEditBook(null);
      const res = await booksAPI.getAll();
      setLocalBooks(res.data);
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await booksAPI.delete(id);
      const res = await booksAPI.getAll();
      setLocalBooks(res.data);
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Librarian Dashboard</h1>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Add New Book from Google Books</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchIsbn}
            onChange={(e) => setSearchIsbn(e.target.value)}
            placeholder="Enter ISBN (e.g., 9780134685991)"
            className="border p-2 flex-grow"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </form>
        {searchError && <p className="text-red-500 mt-2">{searchError}</p>}
        {searchResult && (
          <div className="mt-4 p-4 border rounded">
            <h3 className="font-bold">{searchResult.title}</h3>
            <p>Authors: {searchResult.authors?.join(', ')}</p>
            <button
              onClick={() => handleAddToLocal(searchResult)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Add to Library
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editBook && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Edit Book</h3>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full p-2 border mb-2"
                placeholder="Title"
                required
              />
              <input
                type="text"
                value={editForm.authors}
                onChange={(e) => setEditForm({ ...editForm, authors: e.target.value })}
                className="w-full p-2 border mb-2"
                placeholder="Authors (comma separated)"
                required
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full p-2 border mb-3"
                placeholder="Description"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditBook(null)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Local Books List */}
      <h2 className="text-xl font-semibold mb-3">Library Books ({localBooks.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localBooks.map((book) => (
          <div key={book._id} className="border rounded p-4 relative">
            <BookCard
              book={book}
              onAddToLocal={null}
              onRent={null}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleEdit(book)}
                className="text-sm bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(book._id)}
                className="text-sm bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibrarianDashboard;