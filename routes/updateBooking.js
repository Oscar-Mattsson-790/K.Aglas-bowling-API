const express = require("express");
const db = require("../models/db");

const router = express.Router();

// Update a booking
router.put("/:bookingNumber", (req, res) => {
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

module.exports = router;
