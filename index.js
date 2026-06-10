import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// import session from "express-session";
// import passport from "./config/passport.js";
import userRoutes from "./modules/users/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import facultyRoutes from "./modules/faculty/faculty.routes.js";
import appConfig from "./config/app.config.js";

const app = new express();

app.use(cors({
    origin: [
        'http://localhost:5173',  // add production url later
    ],
    credentials: true
}));

// app.use(passport.initialize());
// app.use(passport.session());
app.use(cookieParser());
app.use(express.json());

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
//   })
// );

// passport.serializeUser(
//   (user, done) => done(null, user)
// );

// passport.deserializeUser(
//   (user, done) => done(null, user)
// );


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

app.listen(appConfig.port, () => {
  console.log(`Server listening at http://localhost:${appConfig.port}`);
});
