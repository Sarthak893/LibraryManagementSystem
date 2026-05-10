const express = require("express");
const router = express.Router();

const Book = require("../models/Book");
const User = require("../models/User");
const Rental = require("../models/Rental");

router.get("/admin-stats", async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();

    const totalUsers = await User.countDocuments();

    const totalRentals = await Rental.countDocuments();

    const issuedBooks = await Rental.countDocuments({
      returned: false,
    });

    res.json({
      totalBooks,
      totalUsers,
      totalRentals,
      issuedBooks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;