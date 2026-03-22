 Library Management System (MERN Stack)

A web-based Library Management System built using the MERN Stack (MongoDB, Express.js, React.js, Node.js) that enables efficient management of books, users, and rental operations.

This project is being developed as part of research work titled:

Design and Enhancement of a Secure and Scalable JWT-Based Library Management System Using MERN Stack

Features (Current Implementation)
User Authentication
Separate Register & Login for:
Teacher (Librarian/Admin)
Student
Role-based system implemented at application level

Book Management
Add books using ISBN number
Automatic book details fetched using Google Books API
Reduces manual data entry errors


Book Rental System
Students can request books using ISBN
Books can be issued and returned
Rental data stored in MongoDB
Frontend (React)
Separate dashboards for:
Student
Librarian (Teacher)


Components include:
Login / Register pages
Book list display
Rental interface
Backend (Node + Express)
REST API architecture
MongoDB database integration
Modular code structure:
Models
Routes
Middleware
Research Objective (Work in Progress)

This project aims to enhance the system with:

JWT-based authentication
Role-Based Access Control (RBAC)
Secure session handling
Analytics dashboard
Token lifecycle management
Intelligent recommendations
Improved security practices

Tech Stack
Frontend
React.js
Context API
Axios
CSS

Backend
Node.js
Express.js
MongoDB
Mongoose
External API
Google Books API (ISBN-based data fetching)
