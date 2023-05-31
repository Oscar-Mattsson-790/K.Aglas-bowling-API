const sqlite3 = require("sqlite3").verbose();

function createDbConnection() {
  const db = new sqlite3.Database("./bowling.sqlite", (error) => {
    if (error) return console.log(error.message);
    createTable(db);
  });

  return db;
}

function createTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      bookingId INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      email TEXT,
      time TEXT,
      numPeople INTEGER,
      numCourses INTEGER,
      totalPrice INTEGER,
      bookingNumber TEXT,
      shoeSizes TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      courseId INTEGER PRIMARY KEY AUTOINCREMENT,
      bookingId INTEGER,
      FOREIGN KEY (bookingId) REFERENCES bookings(bookingId)
    );
  `);
}

const db = createDbConnection();

async function checkBookingExists(bookingNumber) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM bookings WHERE bookingNumber = ?",
      [bookingNumber],
      (err, row) => {
        if (err) reject(err);
        resolve(!!row);
      }
    );
  });
}

async function checkBookingNumberExists(bookingNumber) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM bookings WHERE bookingNumber = ?",
      [bookingNumber],
      (err, row) => {
        if (err) reject(err);
        resolve(!!row);
      }
    );
  });
}

async function checkCourseAvailability(date, time) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM bookings WHERE date = ? AND time = ?",
      [date, time],
      (err, row) => {
        if (err) reject(err);
        resolve(!!row);
      }
    );
  });
}

module.exports = {
  db,
  checkBookingExists,
  checkBookingNumberExists,
  checkCourseAvailability,
};
