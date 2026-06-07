import dotenv from "dotenv";
dotenv.config();

const authConfig = {
  secret: process.env.AUTH_SECRET,
  secret_expires_in:process.env.AUTH_SECRET_EXPIRES_IN,
  refresh_secret: process.env.AUTH_REFRESH_SECRET,
  refresh_secret_expires_in: process.env.AUTH_REFRESH_SECRET_EXPIRES_IN,
};

export default authConfig; 