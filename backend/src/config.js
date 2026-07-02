require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET ontbreekt. Voeg JWT_SECRET=<een lange willekeurige string> toe aan je .env"
  );
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

module.exports = { JWT_SECRET, JWT_EXPIRES_IN };
