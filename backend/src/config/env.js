const dotenv = require("dotenv");

dotenv.config();

const requiredVars = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    cookieName: process.env.COOKIE_NAME || "tuition_token"
  },
  zoom: {
    webhookSecret: process.env.ZOOM_WEBHOOK_SECRET || ""
  },
  vimeo: {
    accessToken: process.env.VIMEO_ACCESS_TOKEN || ""
  }
};


