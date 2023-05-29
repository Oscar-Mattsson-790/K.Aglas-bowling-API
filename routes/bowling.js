// routes/bowling.js
const express = require("express");
const db = require("../models/db");

const router = express.Router();

// Create a booking
router.post("/bookings", (req, res) => {
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

// Get a booking by booking number
router.get("/bookings/:bookingNumber", (req, res) => {
  const { bookingNumber } = req.params;

  db.get(
    "SELECT * FROM bookings WHERE bookingNumber = ?",
    [bookingNumber],
    (err, row) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to get booking" });
      } else if (row) {
        res.json(row);
      } else {
        res.status(404).json({ error: "Booking not found" });
      }
    }
  );
});

// Update a booking
router.put("/bookings/:bookingNumber", (req, res) => {
  const { bookingNumber } = req.params;
  const { numPeople, numCourses, shoeSizes } = req.body;

  // Check if the booking exists
  db.get(
    "SELECT * FROM bookings WHERE bookingNumber = ?",
    [bookingNumber],
    (err, row) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to update booking" });
      } else if (row) {
        // Update the booking with new values
        const updatedBooking = {
          ...row,
          numPeople,
          numCourses,
          shoeSizes,
        };

        // Check if the shoe sizes match the number of people
        const sizes = updatedBooking.shoeSizes.split(",").map(Number);
        if (sizes.length !== updatedBooking.numPeople) {
          res
            .status(400)
            .json({ error: "Shoe sizes must match the number of people" });
          return;
        }

        // Update the booking in the database
        db.run(
          `UPDATE bookings
           SET numPeople = ?, numCourses = ?, shoeSizes = ?
           WHERE bookingNumber = ?`,
          [
            updatedBooking.numPeople,
            updatedBooking.numCourses,
            updatedBooking.shoeSizes,
            bookingNumber,
          ],
          (err) => {
            if (err) {
              console.log(err);
              res.status(500).json({ error: "Failed to update booking" });
            } else {
              res.json({ message: "Booking updated successfully" });
            }
          }
        );
      } else {
        res.status(404).json({ error: "Booking not found" });
      }
    }
  );
});

// Delete a booking
router.delete("/bookings/:bookingNumber", (req, res) => {
  const { bookingNumber } = req.params;

  // Check if the booking exists
  db.get(
    "SELECT * FROM bookings WHERE bookingNumber = ?",
    [bookingNumber],
    (err, row) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete booking" });
      } else if (row) {
        // Delete the booking from the database
        db.run(
          "DELETE FROM bookings WHERE bookingNumber = ?",
          [bookingNumber],
          (err) => {
            if (err) {
              console.log(err);
              res.status(500).json({ error: "Failed to delete booking" });
            } else {
              res.json({ message: "Booking deleted successfully" });
            }
          }
        );
      } else {
        res.status(404).json({ error: "Booking not found" });
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
