// src/components/BookCard.jsx
import React, { useState } from 'react';
import BookModal from './BookModal';

const BookCard = ({ book, onRent, onAddToLocal }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
        <img
          src={book.imageUrl || 'https://via.placeholder.com/120'}
          alt={book.title}
          className="w-32 h-44 object-cover mx-auto mb-2"
        />
        <h3 className="font-bold text-center truncate">{book.title}</h3>
        <p className="text-sm text-gray-600 text-center">
          {book.authors?.join(', ')}
        </p>
        <div className="mt-2 flex justify-center space-x-2">
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            View Details
          </button>
          {onRent && (
            <button
              onClick={() => onRent(book.isbn)}
              className="text-green-600 hover:underline text-sm"
            >
              Rent
            </button>
          )}
          {onAddToLocal && (
            <button
              onClick={() => onAddToLocal(book)}
              className="text-purple-600 hover:underline text-sm"
            >
              Add to Library
            </button>
          )}
        </div>
      </div>
      {showModal && (
        <BookModal book={book} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default BookCard;