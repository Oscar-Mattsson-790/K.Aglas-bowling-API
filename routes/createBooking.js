const express = require("express");
const { db, checkBookingNumberExists } = require("../models/db");

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
  const { date, email, time, numPeople, numCourses, shoeSizes } = req.body;

  const totalPrice = numPeople * 120 + numCourses * 100;

  const bookingNumber = await generateBookingNumber();

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
        res.status(500).json({ error: "Failed to create booking" });
      } else {
        const bookingId = this.lastID;

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

module.exports = router;
