const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const processEnv = require('./config/env');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const app = express();

// Security middlewares
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? processEnv.ALLOWED_ORIGINS.split(',') 
    : '*',
  credentials: true
};
app.use(cors(corsOptions));

// Payload limit
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate limiting global (100 req / 15 min / IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});
app.use('/api', globalLimiter);

// Rate limiter strict pour auth (10 req / 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives, veuillez réessayer plus tard.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
const authRoutes = require('./routes/auth');
const livresRoutes = require('./routes/livres');

app.use('/api/auth', authRoutes);
app.use('/api/livres', livresRoutes);

// 404 fallback
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// Error handler en dernier
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
