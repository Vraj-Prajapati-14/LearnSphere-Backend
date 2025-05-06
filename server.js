import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import prisma from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import categoryRoutes from './routes/category.routes.js';
import progressRoutes from './routes/progress.routes.js';
import reviewRoutes from './routes/review.routes.js';
import './config/passport.js';

const app = express();

// CORS configuration
const corsOptions = {
  origin: env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware
app.use(cors(corsOptions));
// Handle preflight OPTIONS requests
// app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet());

// Core middleware
app.use(express.json());
app.use(cookieParser());

// Session middleware for Passport (Google OAuth)
app.use(
  session({
    secret: env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting for sensitive routes (excluding auth routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter selectively
// app.use('/api/courses', apiLimiter);
// app.use('/api/enrollments', apiLimiter);
// app.use('/api/reviews', apiLimiter);
// app.use('/api/progress', apiLimiter);

// Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/category', categoryRoutes);
  app.use('/api/courses', courseRoutes); // sessionRoutes is mounted within courseRoutes
  app.use('/api/enrollments', enrollmentRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/reviews', reviewRoutes);
} catch (err) {
  console.error('Error mounting routes:', err.message, err.stack);
  process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message, err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only after database connection
async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    app.listen(env.PORT || 5000, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

startServer();