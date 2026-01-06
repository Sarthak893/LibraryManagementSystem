// src/components/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI, rentalsAPI } from '../services/api';

const StudentDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Rent state
  const [isbnToRent, setIsbnToRent] = useState('');
  const [rentError, setRentError] = useState('');
  const [rentSuccess, setRentSuccess] = useState('');

  // Return state
  const [returnForm, setReturnForm] = useState({ isbn: '', code: '' });
  const [returnError, setReturnError] = useState('');
  const [returnSuccess, setReturnSuccess] = useState('');

  // Rented books
  const [rentedBooks, setRentedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real rentals for current student
const fetchRentedBooks = async () => {
  try {
    const res = await rentalsAPI.getMe();
    
    // ✅ Robust filter
    const activeRentals = res.data.filter(r => 
      r.book && 
      typeof r.book === 'object' && 
      r.book.title && 
      r.book.isbn &&
      (r.returned === false || r.returned === undefined)
    );
    
    setRentedBooks(activeRentals);
  } catch (err) {
    console.error('Failed to fetch rentals:', err);
    setRentedBooks([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchRentedBooks();
  }, []);

  // Handle Rent
  const handleRent = async (e) => {
    e.preventDefault();
    setRentError('');
    setRentSuccess('');
    try {
      const res = await rentalsAPI.rent(isbnToRent);
      setRentSuccess(`✅ Rented! Return code: ${res.data.returnCode}`);
      setIsbnToRent('');
      fetchRentedBooks();
    } catch (err) {
      setRentError(err.response?.data?.msg || 'Renting failed');
    }
  };

  // Handle Return (via code)
  const handleReturn = async (e) => {
    e.preventDefault();
    setReturnError('');
    setReturnSuccess('');

    const { isbn, code } = returnForm;
    if (!isbn || !code) {
      setReturnError('Please enter both ISBN and return code');
      return;
    }

    try {
      await rentalsAPI.returnByCode(isbn, code);
      setReturnSuccess('✅ Book returned successfully!');
      setReturnForm({ isbn: '', code: '' });
      fetchRentedBooks(); // ← Refreshes list (now excludes returned books)
    } catch (err) {
      setReturnError(err.response?.data?.msg || 'Invalid ISBN or return code');
    }
  };

  // Copy return code to clipboard
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </div>

      {/* Rent Section */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 Rent a Book</h2>
        <form onSubmit={handleRent} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={isbnToRent}
            onChange={(e) => setIsbnToRent(e.target.value)}
            placeholder="Enter ISBN (e.g., 9780134685991)"
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition whitespace-nowrap"
          >
            Rent Book
          </button>
        </form>
        {rentError && <p className="mt-3 text-red-600 font-medium">{rentError}</p>}
        {rentSuccess && <p className="mt-3 text-green-600 font-medium">{rentSuccess}</p>}
      </div>

      {/* Return Section */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">↩️ Return a Book</h2>
        <form onSubmit={handleReturn} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
            <input
              type="text"
              value={returnForm.isbn}
              onChange={(e) => setReturnForm({ ...returnForm, isbn: e.target.value })}
              placeholder="e.g. 9780134685991"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Code</label>
            <div className="flex">
              <input
                type="text"
                value={returnForm.code}
                onChange={(e) => setReturnForm({ ...returnForm, code: e.target.value })}
                placeholder="e.g. 739142"
                className="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => {
                  if (rentedBooks.length === 1) {
                    const r = rentedBooks[0];
                    const book = r.book || {};
                    setReturnForm({ 
                      isbn: book.isbn || '', 
                      code: r.returnCode || '' 
                    });
                  }
                }}
                className="bg-gray-200 hover:bg-gray-300 px-3 rounded-r-lg text-gray-700"
                title="Auto-fill from rented books"
              >
                🔄
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Return Book
            </button>
          </div>
        </form>
        {returnError && <p className="mt-3 text-red-600 font-medium">{returnError}</p>}
        {returnSuccess && <p className="mt-3 text-green-600 font-medium">{returnSuccess}</p>}
      </div>

      {/* Rented Books List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📖 Your Rented Books ({rentedBooks.length})
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : rentedBooks.length === 0 ? (
          <p className="text-gray-500">You have no rented books.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rentedBooks.map((rental) => {
              const book = rental.book || {};
              return (
                <div
                  key={rental._id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:shadow-sm transition"
                >
                  <h3 className="font-bold text-gray-800">{book.title || 'Unknown Title'}</h3>
                  <p className="text-sm text-gray-600 mt-1">ISBN: {book.isbn || 'N/A'}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      Code: {rental.returnCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(rental.returnCode)}
                      className="ml-2 text-xs text-gray-500 hover:text-blue-600"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Rented on {new Date(rental.rentedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;