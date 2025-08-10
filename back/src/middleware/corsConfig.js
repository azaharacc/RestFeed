const cors = require("cors");

const allowedOrigins = [
  "https://rest-feed.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman, curl
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS: acceso denegado a ${origin}`;
      return callback(new Error(msg), false);
    }
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

module.exports = cors(corsOptions);
