// src/services/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  // ✅ Check BOTH — in case token exists in either
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
};

export const booksAPI = {
  getPopular: () => API.get('/books/popular'),
  searchByISBN: (isbn) => API.get(`/books/search/${isbn}`),
  getAll: () => API.get('/books'),
  add: (bookData) => API.post('/books', bookData),
  update: (id, bookData) => API.put(`/books/${id}`, bookData),
  delete: (id) => API.delete(`/books/${id}`),
};

export const rentalsAPI = {
  rent: (isbn) => API.post('/rentals/rent', { isbn }),
  returnByCode: (isbn, code) => API.post('/rentals/return', { isbn, returnCode: code }),
  getMe: () => API.get('/rentals/me'),
};