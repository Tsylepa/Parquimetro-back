// ⬅️ Обов'язково першим рядком
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

const connectDB = require("./db/conn");
const routes = require("./routes/router");

// Middleware
app.use(cors());
app.use(express.json());

// Підключення до MongoDB
connectDB();

// Маршрути
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is working!" });
});

// Порт та хост
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`SERVER ONLINE at http://${HOST}:${PORT}`);
});
