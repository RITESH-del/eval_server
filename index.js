import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUI from 'swagger-ui-express'
import swaggerJSdoc from 'swagger-jsdoc'
import userRoutes from "./modules/users/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import facultyRoutes from "./modules/faculty/faculty.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import appRoutes from "./modules/app/app.routes.js";
import config from "./config/app.config.js";
import { rateLimit } from 'express-rate-limit';
import prisma from './db.js';

const app = new express();

const swaggerSpec = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'coding platform api',
      description: 'RESTful API for coding platform',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'development server',
      }
    ],
  },
  apis: ['./modules/**/*.routes.js']
}

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 300,
})

/* Global Middleware */
app.use(cors({
    origin: [
        'http://localhost:5173',  
        'https://eval-platform-ten.vercel.app'  // add frontend production url later
    ],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(limiter);
app.use('/api-docs', swaggerUI.serve,  swaggerUI.setup(swaggerJSdoc(swaggerSpec)));


const ui = `
<style>
html {
  font-family: cursive;
  text-align: center;
  color: white;
  background-color: black;
  font-size: 200%;
}
</style>
<h1 style="margin-top:5%;">Welcome, Sire!</h1>
<p>Swagger docs at: <a href="/api-docs">/api-docs</a></p>
`

app.get('/', (req, res) => {
  res.send(ui);
})

// application-level-routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/faculty', facultyRoutes);
app.use('/student', studentRoutes);
app.use('/app', appRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error handler caught error:", err.message);
  res.status(err.status || 400).json({
    ok: false,
    message: err.message || "Internal Server Error",
  });
});


if (config.node_env !== 'test') {
  prisma.$connect()
    .then(() => {
      console.log("Database connection successful!");
      
      app.listen(config.port, () => {
        console.log(`Server listening at http://localhost:${config.port}`);
      });
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exit(1); 
    });
}
