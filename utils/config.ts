import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const COOKIE_SALT = process.env.COOKIE_SALT;

if (!PORT || !COOKIE_SALT) {
  throw new Error("secrets failed");
}

export default { PORT, COOKIE_SALT };
