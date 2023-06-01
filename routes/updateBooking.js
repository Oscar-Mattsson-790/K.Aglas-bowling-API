const express = require("express");
const { db } = require("../models/db");
const { checkBooking, verifyBookingNumber } = require("../middleware/bowling");

const router = express.Router();

router.put("/:bookingNumber", checkBooking, verifyBookingNumber, (req, res) => {
  const { bookingNumber } = req.params;
  const { numPeople, numCourses, shoeSizes } = req.body;

  db.get(
    `SELECT * FROM bookings WHERE bookingNumber = ?`,
    [bookingNumber],
    (err, row) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to update booking" });
      } else if (row) {
        const updatedBooking = {
          ...row,
          numPeople,
          numCourses,
          shoeSizes,
        };

        const sizes = updatedBooking.shoeSizes.split(",").map(Number);
        if (sizes.length !== updatedBooking.numPeople) {
          res
            .status(400)
            .json({ error: "Shoe sizes must match the number of people" });
          return;
        }

        const totalPrice = calculateTotalPrice(updatedBooking);

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
