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
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      email TEXT,
      time TEXT,
      numPeople INTEGER,
      numCourses INTEGER,
      shoeSizes TEXT,
      totalPrice INTEGER,
      bookingNumber TEXT
    )
  `);
}

const db = createDbConnection();

module.exports = db;
