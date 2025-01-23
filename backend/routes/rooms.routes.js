import express from 'express';
import mysql from 'mysql2';
import dbConfig from '../config/db.config.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
const pool = mysql.createPool(dbConfig).promise();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all available rooms
router.get('/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single room
router.get('/rooms/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pre-reserve a room
router.post('/pre-reserve', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { roomId, userId, days, checkIn, checkOut } = req.body;
    if (!roomId || !checkIn || !checkOut) {
      throw new Error(
        'Missing required fields: roomId, checkIn, and checkOut are required'
      );
    }

    // Get user ID from auth token if not provided
    const user = req.user;
    const actualUserId = userId || user.id;

    const reservedUntil = new Date();
    reservedUntil.setHours(reservedUntil.getHours() + 24);
    console.log('Pre-reserve request:', { roomId, actualUserId, days, user });

    // Check if room is available
    const [rooms] = await connection.query(
      'SELECT * FROM rooms WHERE id = ? AND status = ?',
      [roomId, 'available']
    );

    console.log('Found rooms:', rooms, 'for roomId:', roomId);
    if (rooms.length === 0) {
      throw new Error('Room is not available');
    }

    // Create booking record
    const [result] = await connection.query(
      `INSERT INTO bookings 
       (userId, room_id, check_in_date, check_out_date, total_price, status, reserved_until)
       VALUES (?, ?, ?, ?, ?, 'pre-reserved', ?)`,
      [
        actualUserId,
        roomId,
        checkIn,
        checkOut,
        rooms[0].price * days,
        reservedUntil,
      ]
    );

    // Update room status
    await connection.query(
      'UPDATE rooms SET status = "occupied" WHERE id = ?',
      [roomId]
    );

    await connection.commit();
    res.json({
      message: 'Room pre-reserved successfully',
      reservedUntil,
      bookingId: result.insertId,
    });
  } catch (error) {
    console.error('Pre-reserve error:', error);
    await connection.rollback();
    res.status(400).json({
      message: error.message,
      details: {
        error: error.toString(),
        stack: error.stack,
      },
    });
  } finally {
    connection.release();
  }
});

// Confirm booking with payment
router.post('/confirm-booking', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { bookingId, paymentDetails } = req.body;

    // Process payment here...

    // Update booking status
    await connection.query(
      'UPDATE bookings SET status = "confirmed" WHERE id = ?',
      [bookingId]
    );

    await connection.commit();
    res.json({ message: 'Booking confirmed successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Release pre-reserved room if not confirmed
router.post('/release-reservation', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { bookingId } = req.body;

    // Get booking details
    const [bookings] = await connection.query(
      'SELECT room_id FROM bookings WHERE id = ? AND status = "pre-reserved"',
      [bookingId]
    );

    if (bookings.length === 0) {
      throw new Error('Booking not found or already confirmed');
    }

    // Update booking status
    await connection.query(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [bookingId]
    );

    // Update room status
    await connection.query(
      'UPDATE rooms SET status = "available" WHERE id = ?',
      [bookings[0].room_id]
    );

    await connection.commit();
    res.json({ message: 'Reservation released successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Add a cleanup job to release expired pre-reservations
const cleanupExpiredReservations = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get expired pre-reservations
    const [expiredBookings] = await connection.query(
      `SELECT id, room_id FROM bookings 
       WHERE status = 'pre-reserved' 
       AND reserved_until < NOW()`
    );

    for (const booking of expiredBookings) {
      // Update booking status
      await connection.query(
        'UPDATE bookings SET status = "cancelled" WHERE id = ?',
        [booking.id]
      );

      // Update room status
      await connection.query(
        'UPDATE rooms SET status = "available" WHERE id = ?',
        [booking.room_id]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Error cleaning up expired reservations:', error);
  } finally {
    connection.release();
  }
};

// Run cleanup job every hour
setInterval(cleanupExpiredReservations, 60 * 60 * 1000);

// Get pre-reserved rooms for current user
router.get('/pre-reserved-rooms', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, r.room_number, r.room_type 
       FROM bookings b 
       JOIN rooms r ON b.room_id = r.id 
       WHERE b.userId = ? AND b.status = 'pre-reserved'`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
