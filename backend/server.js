const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: the React dev server runs on another port (5173), and browsers block
// cross-origin calls unless this server explicitly allows them.
app.use(cors());

// express.json(): parses JSON request bodies into req.body.
app.use(express.json());

// tiny request logger - handy to watch the client/server conversation live
app.use((req, _res, next) => {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method.padEnd(6)} ${req.originalUrl}`);
  next();
});

app.get("/", (_req, res) => {
  res.json({ service: "Student Registry API", status: "running", try: "/api/students" });
});

app.use("/api/students", studentRoutes);

// unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} does not exist` });
});

// malformed JSON and any other unexpected error end up here
app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body is not valid JSON" });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`\n  Student Registry API listening on http://localhost:${PORT}\n`);
});
