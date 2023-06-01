function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    res.status(400).json({ error: "Bad request - invalid JSON" });
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = errorHandler;
