import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// import session from "express-session";
// import passport from "./config/passport.js";
import userRoutes from "./modules/users/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import facultyRoutes from "./modules/faculty/faculty.routes.js";
import config from "./config/app.config.js";

// 1. Import your Prisma connection
import prisma from "./db.js"; 

const app = new express();

app.use(cors({
    origin: [
        'http://localhost:5173',  // add frontend production url later
    ],
    credentials: true
}));

// app.use(passport.initialize());
// app.use(passport.session());
app.use(cookieParser());
app.use(express.json());

// application-level-routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/faculty', facultyRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error handler caught error:", err.message);
  res.status(err.status || 400).json({
    ok: false,
    message: err.message || "Internal Server Error",
  });
});

// 2. Test Prisma Connection, THEN start the server
if (config.node_env !== 'test') {
  prisma.$connect()
    .then(() => {
      console.log("Database connection successful!");
      
      // Start the Express server only after DB connects
      app.listen(config.port, () => {
        console.log(`Server listening at http://localhost:${config.port}`);
      });
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exit(1); // Stop the server if the database fails
    });
}