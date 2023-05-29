const express = require("express");
const db = require("../models/db");

const router = express.Router();

// Delete a booking
router.delete("/:bookingNumber", (req, res) => {
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

module.exports = router;
