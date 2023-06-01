const express = require("express");
const {
  db,
  checkBookingNumberExists,
  checkCourseAvailability,
} = require("../models/db");

const router = express.Router();

async function generateBookingNumber() {
  const bookingNumber = Math.floor(Math.random() * 90000) + 10000;
  const exists = await checkBookingNumberExists(bookingNumber);

  if (exists) {
    return await generateBookingNumber();
  }

  return bookingNumber;
}

router.post("/", async (req, res) => {
  const { date, email, time, numPeople, numCourses, shoeSizes, courseId } =
    req.body;

  const shoeSizesArray = shoeSizes.split(",").map(Number);

  if (shoeSizesArray.length !== numPeople) {
    return res
      .status(400)
      .json({ error: "Number of shoe sizes must match number of people." });
  }

  const totalPrice = numPeople * 120 + numCourses * 100;

  const bookingNumber = await generateBookingNumber();

  try {
    const isCourseAvailable = await checkCourseAvailability(
      date,
      time,
      courseId
    );

    if (!isCourseAvailable) {
      db.run(
        `INSERT INTO bookings (date, email, time, numPeople, numCourses, totalPrice, bookingNumber, shoeSizes, courseId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          date,
          email,
          time,
          numPeople,
          numCourses,
          totalPrice,
          bookingNumber,
          shoeSizes,
          courseId,
        ],
        function (err) {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to create booking" });
          }

          const bookingId = this.lastID;

          for (let i = 0; i < numCourses; i++) {
            db.run(
              `INSERT INTO bookings_courses (bookingId, courseId) VALUES (?, ?)`,
              [bookingId, courseId],
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
      res.status(400).json({
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
