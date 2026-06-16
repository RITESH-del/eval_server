import dotenv from "dotenv";
dotenv.config();
import { z } from 'zod';


const configSchema = z.object({
  node_env: z.enum(["development", "test", "production"]),
  // host: z.string().default("localhost"),
  port: z.number().default(5000),

  database: z.object({
    url: z.string(),
  }),

   jwt: z.object({
    secret: z.string().min(20),
    expiresIn: z.string().default('7d'),
    refreshSecret: z.string().min(20),
    refreshExpiresIn: z.string().default('30d'),

  }),

})


function loadConfig(){
const config ={
  node_env: process.env.NODE_ENV,
  // host: process.env.HOST,
  port: Number(process.env.PORT),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.AUTH_SECRET,
    expiresIn: process.env.AUTH_SECRET_EXPIRES_IN,
    refreshSecret: process.env.AUTH_REFRESH_SECRET,
    refreshExpiresIn: process.env.AUTH_REFRESH_SECRET_EXPIRES_IN,
  },
}

  // Validate and throw if invalid - fail fast at startup
  const result = configSchema.safeParse(config);
  if (!result.success) {
    console.error('Configuration validation failed:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}


const config = loadConfig(); 

export default config;