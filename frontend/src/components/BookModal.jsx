// src/components/BookModal.jsx
import React from 'react';

const BookModal = ({ book, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{book.title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {book.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-40 h-56 object-contain border"
                />
              </div>
            )}
            <div>
              <p className="text-gray-600">
                <strong>Authors:</strong> {book.authors.join(', ')}
              </p>
              {book.publishedDate && (
                <p className="text-gray-600 mt-1">
                  <strong>Published:</strong> {book.publishedDate}
                </p>
              )}
              {book.isbn && (
                <p className="text-gray-600 mt-1">
                  <strong>ISBN:</strong> {book.isbn}
                </p>
              )}
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800">Description</h3>
                <p className="text-gray-700 mt-2 whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookModal;