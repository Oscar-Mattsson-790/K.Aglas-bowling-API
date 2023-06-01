const express = require("express");
const { db } = require("../models/db");
const { checkBooking, verifyBookingNumber } = require("../middleware/bowling");

const router = express.Router();

// Update a booking
router.put("/:bookingNumber", checkBooking, verifyBookingNumber, (req, res) => {
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

        // Check if the number of shoes matches the number of people
        const sizes = updatedBooking.shoeSizes.split(",").map(Number);
        if (sizes.length !== updatedBooking.numPeople) {
          res
            .status(400)
            .json({ error: "Shoe sizes must match the number of people" });
          return;
        }

        // Recalculate the total price based on the updated values
        const totalPrice = calculateTotalPrice(updatedBooking);

        // Update the booking in the database
        db.run(
          `UPDATE bookings
           SET numPeople = ?, numCourses = ?, shoeSizes = ?, totalPrice = ?
           WHERE bookingNumber = ?`,
          [
            updatedBooking.numPeople,
            updatedBooking.numCourses,
            updatedBooking.shoeSizes,
            totalPrice,
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

function calculateTotalPrice(booking) {
  return booking.numPeople * 120 + booking.numCourses * 100;
}

module.exports = router;
