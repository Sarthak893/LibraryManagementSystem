// src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI } from '../services/api';
import BookModal from './BookModal';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await booksAPI.getPopular();
        setBooks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

   useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // If still loading, show nothing (prevents flash)
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 flex items-center">
            <span className="mr-2">📚</span> Library System
          </h1>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-gray-700">
                Hello, <span className="font-medium">{user.name}</span>
              </span>
              <Link
                to={user.role === 'librarian' ? '/librarian' : '/student'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-gray-600 hover:text-indigo-600 font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 font-medium hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="py-10 md:py-14 bg-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Discover Inspiring Books
          </h2>
          <p className="text-lg opacity-90">
            Explore hand-picked popular titles from around the world.
          </p>
        </div>
      </section>

      {/* Popular Books Section */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800">🌟 Popular Books</h2>
            <p className="text-gray-600 mt-2">Curated from Google Books — updated daily</p>
          </div>

          {loading ? (
            // Skeleton Loader
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gray-200 h-48 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No books available right now. Try again later.</p>
            </div>
          ) : (
            // Book Grid
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book.id || book.isbn}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div 
                    className="h-48 bg-gray-100 flex items-center justify-center cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm text-center px-2">
                        No cover
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 min-h-[3rem]">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {book.authors.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 h-10">
                      {book.description}
                    </p>
                    <button
                      onClick={() => setSelectedBook(book)}
                      className="mt-3 w-full text-indigo-600 text-xs font-medium hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto text-center px-4 text-sm">
          <p>© {new Date().getFullYear()} Library System — Powered by Google Books API</p>
        </div>
      </footer>

      {/* Book Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};

export default Home;