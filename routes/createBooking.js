const express = require("express");
const {
  db,
  checkBookingNumberExists,
  checkCourseAvailability,
} = require("../models/db");

const router = express.Router();

// Helper function to generate a booking number
async function generateBookingNumber() {
  const bookingNumber = Math.floor(Math.random() * 90000) + 10000;
  const exists = await checkBookingNumberExists(bookingNumber);

  if (exists) {
    return await generateBookingNumber(); // If the generated booking number exists, generate again
  }

  return bookingNumber;
}

// Create a booking
router.post("/", async (req, res) => {
  const { date, email, time, numPeople, numCourses, shoeSizes } = req.body;

  // Calculate the total price
  const totalPrice = numPeople * 120 + numCourses * 100;

  // Generate a booking number
  const bookingNumber = await generateBookingNumber();

  try {
    // Check course availability
    const isCourseAvailable = await checkCourseAvailability(date, time);

    if (!isCourseAvailable) {
      // Insert the booking into the database
      db.run(
        `INSERT INTO bookings (date, email, time, numPeople, numCourses, totalPrice, bookingNumber, shoeSizes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          date,
          email,
          time,
          numPeople,
          numCourses,
          totalPrice,
          bookingNumber,
          shoeSizes,
        ],
        function (err) {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to create booking" });
          }

          const bookingId = this.lastID;

          // Insert the courses into the database
          for (let i = 0; i < numCourses; i++) {
            db.run(
              `INSERT INTO courses (bookingId) VALUES (?)`,
              [bookingId],
              function (err) {
                if (err) {
                  console.log(err);
                  return res
                    .status(500)
                    .json({ error: "Failed to create booking" });
                }
              }
            );
          }

          res.status(201).json({ bookingId });
        }
      );
    } else {
      res
        .status(400)
        .json({
          error: "Course already booked at the requested date and time",
        });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "An error occurred while checking course availability" });
  }
});

module.exports = router;
