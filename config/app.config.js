import dotenv from "dotenv";
dotenv.config();

const appConfig = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 5000,
  node_env: process.env.NODE_ENV || "development",
  db_url: process.env.DATABASE_URL || "",
  
  
};

export default appConfig; 