import dotenv from 'dotenv';
dotenv.config();

const env={
    DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 5000,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  RECAPTCHA_SECRET_KEY:process.env.RECAPTCHA_SECRET_KEY,
}

for(const [key,value] of Object.entries(env)){
    if (!value) throw new Error(`Environment variable ${key} is missing`);
}

export default env;