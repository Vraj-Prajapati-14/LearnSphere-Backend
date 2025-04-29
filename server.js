import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env.js';
import prisma from './config/database.js';
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import sessionRoutes from './routes/session.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import categoryRoutes from './routes/category.routes.js';
import progressRoutes from './routes/progress.routes.js';


const app=express();

async function connectDatabase() {
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
  }
  
connectDatabase();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses', sessionRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);

app.listen(env.PORT,()=>{
    console.log(`Server running on http://localhost:${env.PORT}`);
})