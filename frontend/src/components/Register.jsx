// src/components/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ✅ Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    librarianCode: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, role, librarianCode } = formData;

    // ✅ Frontend validation
    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters long.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'librarian' && librarianCode.trim().length < 4) {
      setError('Invalid librarian code.');
      return;
    }

    try {
      await register(formData);

      setSuccess('✅ Account created! Redirecting to homepage...');

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.msg ||
        'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

      {error && (
        <p className="text-red-500 text-center mb-4 bg-red-50 rounded p-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-600 text-center mb-4 bg-green-50 rounded p-2">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <div className="mb-3">
          <label className="mr-4">
            <input
              type="radio"
              name="role"
              value="student"
              checked={formData.role === 'student'}
              onChange={handleChange}
            />{' '}
            Student
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="librarian"
              checked={formData.role === 'librarian'}
              onChange={handleChange}
            />{' '}
            Librarian
          </label>
        </div>

        {formData.role === 'librarian' && (
          <input
            type="text"
            name="librarianCode"
            value={formData.librarianCode}
            onChange={handleChange}
            placeholder="Librarian Code"
            className="w-full p-2 mb-3 border rounded"
            required
          />
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Register
        </button>
      </form>

      <p className="mt-4 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
