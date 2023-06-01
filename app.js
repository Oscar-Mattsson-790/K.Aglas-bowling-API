const express = require("express");
const app = express();
const PORT = 8000;
const bowlingRouter = require("./routes/bowling");

app.use(express.json());

app.use("/api", bowlingRouter);

try {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
} catch (error) {
  console.log("Failed to connect to the database:", error);
}
