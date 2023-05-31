const express = require("express");
const { db } = require("../models/db");

const router = express.Router();

// Get a booking by booking number
router.get("/:bookingNumber", (req, res) => {
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

module.exports = router;
