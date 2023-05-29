const express = require("express");
const db = require("../models/db");

const router = express.Router();

// Create a booking
router.post("/", (req, res) => {
  const { date, email, time, numPeople, numCourses, shoeSizes } = req.body;

  // Calculate the total price
  const totalPrice = numPeople * 120 + numCourses * 100;

  // Generate a booking number (you can use a library like `shortid` for this)
  const bookingNumber = generateBookingNumber();

  // Insert the booking into the database
  db.run(
    `INSERT INTO bookings (date, email, time, numPeople, numCourses, shoeSizes, totalPrice, bookingNumber)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      date,
      email,
      time,
      numPeople,
      numCourses,
      shoeSizes,
      totalPrice,
      bookingNumber,
    ],
    function (err) {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to create booking" });
      } else {
        res.status(201).json({ bookingId: this.lastID });
      }
    }
  );
});

// Helper function to generate a booking number
function generateBookingNumber() {
  // Generate a unique random number or use a library like `shortid`
  return Math.floor(Math.random() * 90000) + 10000;
}

module.exports = router;
