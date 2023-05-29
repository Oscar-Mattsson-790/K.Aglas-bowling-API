const {
  checkBookingExists,
  checkBookingNumberExists,
} = require("../models/db");

async function checkBooking(req, res, next) {
  const { bookingNumber, date, time } = req.body;
  const isBookingExists = await checkBookingExists(bookingNumber);
  const isCourseAlreadyBooked = await checkCourseAvailability(date, time);

  if (isBookingExists && !isCourseAlreadyBooked) {
    next();
  } else if (!isBookingExists) {
    res.json({ success: false, message: "Invalid booking" });
  } else {
    res.json({
      success: false,
      message: "Course already booked at the requested date and time",
    });
  }
}

async function checkBookingNumber(req, res, next) {
  const { bookingNumber } = req.body;
  const isBookingNumberExists = await checkBookingNumberExists(bookingNumber);

  if (!isBookingNumberExists) {
    next();
  } else {
    res.json({ success: false, message: "Booking number already exists" });
  }
}

async function checkCourseAvailability(date, time) {
  const query = "SELECT * FROM bookings WHERE date = ? AND time = ?";
  const row = await db.get(query, [date, time]);
  return !!row;
}

module.exports = {
  checkBooking,
  checkBookingNumber,
};
