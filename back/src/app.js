require("dotenv").config();
const express = require("express");
const corsMiddleware = require("./middleware/corsConfig");
const quotesRoutes = require("./routes/quotes");

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use("/quotes", quotesRoutes);

// Middleware de manejo de errores genérico
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
