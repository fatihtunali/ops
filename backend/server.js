const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { pool } = require('./src/config/database');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP request logger

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Server is healthy',
      database: 'connected',
      time: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// API routes will be added here
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Funny Tourism Operations API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      clients: '/api/clients',
      hotels: '/api/hotels',
      tourSuppliers: '/api/tour-suppliers',
      guides: '/api/guides',
      vehicles: '/api/vehicles',
      bookings: '/api/bookings',
      payments: '/api/payments',
      expenses: '/api/expenses',
      reports: '/api/reports',
      vouchers: '/api/vouchers'
    }
  });
});

// Import routes
const authRoutes = require('./src/routes/auth');
const clientRoutes = require('./src/routes/clients');
const hotelRoutes = require('./src/routes/hotels');
const tourSupplierRoutes = require('./src/routes/tourSuppliers');
const guideRoutes = require('./src/routes/guides');
const vehicleRoutes = require('./src/routes/vehicles');
// const userRoutes = require('./src/routes/users');
// ... more routes will be added

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/tour-suppliers', tourSupplierRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/vehicles', vehicleRoutes);
// app.use('/api/users', userRoutes);
// ... more routes will be added

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 Funny Tourism Operations API                     ║
║                                                        ║
║   Server running on: http://localhost:${PORT}          ║
║   Environment: ${process.env.NODE_ENV}                           ║
║   Database: ${process.env.DATABASE_NAME}@${process.env.DATABASE_HOST}             ║
║                                                        ║
║   Health Check: http://localhost:${PORT}/health        ║
║   API Info: http://localhost:${PORT}/api               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⏹️  SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⏹️  SIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});

