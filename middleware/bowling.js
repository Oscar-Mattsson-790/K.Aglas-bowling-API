const {
  checkBookingExists,
  checkBookingNumberExists,
} = require("../models/db");

async function checkBooking(req, res, next) {
  const { bookingNumber } = req.body;
  const check = await checkBookingExists(bookingNumber);

  if (check) {
    next();
  } else {
    res.json({ success: false, message: "Invalid booking" });
  }
}

async function checkBookingNumber(req, res, next) {
  const { bookingNumber } = req.body;
  const check = await checkBookingNumberExists(bookingNumber);

  if (!check) {
    next();
  } else {
    res.json({ success: false, message: "Booking number already exists" });
  }
}

module.exports = {
  checkBooking,
  checkBookingNumber,
};
