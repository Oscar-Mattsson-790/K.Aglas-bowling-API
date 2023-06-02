const {
  checkBookingExists,
  checkBookingNumberExists,
  checkCourseAvailability,
} = require("../models/db");

async function checkBooking(req, res, next) {
  const { bookingNumber, date, time, courseId } = req.body;

  if (!bookingNumber || !date || !time || !courseId) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  try {
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
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while checking the booking" });
  }
}

async function checkBookingNumber(req, res, next) {
  const { bookingNumber } = req.body;

  if (!bookingNumber) {
    return res.status(400).json({ error: "Booking number is missing" });
  }

  try {
    const isBookingNumberExists = await checkBookingNumberExists(bookingNumber);

    if (!isBookingNumberExists) {
      next();
    } else {
      res.json({ success: false, message: "Booking number already exists" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while checking the booking number" });
  }
}

async function verifyBookingNumber(req, res, next) {
  const { bookingNumber } = req.params;

  if (!bookingNumber) {
    return res.status(400).json({ error: "Booking number is missing" });
  }

  try {
    const isBookingNumberExists = await checkBookingNumberExists(bookingNumber);

    if (isBookingNumberExists) {
      next();
    } else {
      res
        .status(404)
        .json({ success: false, message: "Booking number does not exist" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while verifying the booking number" });
  }
}

module.exports = {
  checkBooking,
  checkBookingNumber,
  verifyBookingNumber,
};
