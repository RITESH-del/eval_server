import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import appConfig from "./config/app.config.js";
const app = new express();

app.use(cors({
    origin: [
        'http://localhost:5173',  // add production url later
    ],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoutes);

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
