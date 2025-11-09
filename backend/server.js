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
      clientPayments: '/api/client-payments',
      supplierPayments: '/api/supplier-payments',
      hotels: '/api/hotels',
      tourSuppliers: '/api/tour-suppliers',
      guides: '/api/guides',
      vehicles: '/api/vehicles',
      bookings: '/api/bookings',
      bookingFlights: '/api/booking-flights',
      bookingHotels: '/api/booking-hotels',
      bookingTours: '/api/booking-tours',
      passengers: '/api/passengers',
      payments: '/api/payments',
      operationalExpenses: '/api/operational-expenses',
      expenses: '/api/expenses',
      reports: '/api/reports',
      vouchers: '/api/vouchers',
      vehicleTypes: '/api/vehicle-types',
      vehicleRates: '/api/vehicle-rates',
      tourRates: '/api/tour-rates',
      guideRates: '/api/guide-rates',
      entranceFees: '/api/entrance-fees'
    }
  });
});

// Import routes
const authRoutes = require('./src/routes/auth');
const clientPaymentRoutes = require('./src/routes/clientPayments');
const supplierPaymentRoutes = require('./src/routes/supplierPayments');
const clientRoutes = require('./src/routes/clients');
const bookingRoutes = require('./src/routes/bookings');
const hotelRoutes = require('./src/routes/hotels');
const tourSupplierRoutes = require('./src/routes/tourSuppliers');
const guideRoutes = require('./src/routes/guides');
const vehicleRoutes = require('./src/routes/vehicles');
const bookingFlightRoutes = require('./src/routes/bookingFlights');
const bookingHotelRoutes = require('./src/routes/bookingHotels');
const bookingTourRoutes = require('./src/routes/bookingTours');
const bookingTransferRoutes = require('./src/routes/bookingTransfers');
const passengerRoutes = require('./src/routes/passengers');
const voucherRoutes = require('./src/routes/vouchers');
const operationalExpenseRoutes = require('./src/routes/operationalExpenses');
const userRoutes = require('./src/routes/users');
const reportRoutes = require('./src/routes/reports');
const vehicleTypeRoutes = require('./src/routes/vehicleTypes');
const vehicleRateRoutes = require('./src/routes/vehicleRates');
const tourRateRoutes = require('./src/routes/tourRates');
const guideRateRoutes = require('./src/routes/guideRates');
const cityRoutes = require('./src/routes/cities');
const entranceFeeRoutes = require('./src/routes/entranceFees');

// Use routes
app.use('/api/client-payments', clientPaymentRoutes);
app.use('/api/supplier-payments', supplierPaymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/tour-suppliers', tourSupplierRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/booking-flights', bookingFlightRoutes);
app.use('/api/booking-hotels', bookingHotelRoutes);
app.use('/api/booking-tours', bookingTourRoutes);
app.use('/api/booking-transfers', bookingTransferRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/operational-expenses', operationalExpenseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vehicle-types', vehicleTypeRoutes);
app.use('/api/vehicle-rates', vehicleRateRoutes);
app.use('/api/tour-rates', tourRateRoutes);
app.use('/api/guide-rates', guideRateRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/entrance-fees', entranceFeeRoutes);

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

