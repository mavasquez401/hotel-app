import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import dbConfig from './config/db.config.js';
import roomsRoutes from './routes/rooms.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create MySQL connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database.');
  connection.release();
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the hotel booking API.' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', roomsRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
