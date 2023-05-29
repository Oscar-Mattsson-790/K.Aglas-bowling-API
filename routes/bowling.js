const express = require("express");
const router = express.Router();

const createBookingRouter = require("./createBooking");
const getBookingRouter = require("./getBooking");
const updateBookingRouter = require("./updateBooking");
const deleteBookingRouter = require("./deleteBooking");

router.use("/bookings", createBookingRouter);
router.use("/bookings", getBookingRouter);
router.use("/bookings", updateBookingRouter);
router.use("/bookings", deleteBookingRouter);

module.exports = router;
