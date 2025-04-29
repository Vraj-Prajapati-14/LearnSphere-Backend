import dotenv from 'dotenv';
dotenv.config();

const env={
    DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 5000,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
}

for(const [key,value] of Object.entries(env)){
    if (!value) throw new Error(`Environment variable ${key} is missing`);
}

export default env;