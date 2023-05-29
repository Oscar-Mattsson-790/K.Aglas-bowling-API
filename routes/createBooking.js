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
    `INSERT INTO bookings (date, email, time, numPeople, totalPrice, bookingNumber, shoeSizes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [date, email, time, numPeople, totalPrice, bookingNumber, shoeSizes],
    function (err) {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to create booking" });
      } else {
        const bookingId = this.lastID;

        // Insert the courses into the database
        for (let i = 0; i < numCourses; i++) {
          db.run(
            `INSERT INTO courses (bookingId) VALUES (?)`,
            [bookingId],
            function (err) {
              if (err) {
                console.log(err);
                res.status(500).json({ error: "Failed to create booking" });
              }
            }
          );
        }

        res.status(201).json({ bookingId });
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
