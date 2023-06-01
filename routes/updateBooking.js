const express = require("express");
const { db } = require("../models/db");
const {
  checkBooking,
  verifyBookingNumber,
  checkCourseAvailability,
} = require("../middleware/bowling");

const router = express.Router();

router.put(
  "/:bookingNumber",
  checkBooking,
  verifyBookingNumber,
  async (req, res) => {
    const { bookingNumber } = req.params;
    const { numPeople, numCourses, shoeSizes, courseId, date, time } = req.body;

    const shoeSizesArray = shoeSizes.split(",").map(Number);

    if (shoeSizesArray.length !== numPeople) {
      return res
        .status(400)
        .json({ error: "Number of shoe sizes must match number of people." });
    }

    try {
      const isCourseAvailable = await checkCourseAvailability(
        date,
        time,
        courseId
      );

      if (!isCourseAvailable) {
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
                courseId,
                date,
                time,
              };

              const totalPrice = calculateTotalPrice(updatedBooking);

              db.run(
                `UPDATE bookings
              SET numPeople = ?, numCourses = ?, shoeSizes = ?, totalPrice = ?, courseId = ?, date = ?, time = ?
              WHERE bookingNumber = ?`,
                [
                  updatedBooking.numPeople,
                  updatedBooking.numCourses,
                  updatedBooking.shoeSizes,
                  totalPrice,
                  courseId,
                  updatedBooking.date,
                  updatedBooking.time,
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
      } else {
        res.status(400).json({
          error: "Course already booked at the requested date and time",
        });
      }
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({
          error: "An error occurred while checking course availability",
        });
    }
  }
);

function calculateTotalPrice(booking) {
  return booking.numPeople * 120 + booking.numCourses * 100;
}

module.exports = router;
