CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- Drop tables if they exist
DROP TABLE IF EXISTS bookings;  -- Drop child tables first
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;     -- Drop parent tables last

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    room_type ENUM('Single', 'Double', 'Suite', 'Deluxe', 'Penthouse Suite') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('available', 'occupied') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table (create this last since it references other tables)
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pre-reserved', 'pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reserved_until TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Insert test user first
INSERT INTO users (username, email, password) VALUES
('testuser', 'test@example.com', '$2a$10$6jXxIg1.QRGM0BxVG/4./.VCE.J9.RYq9t.1XYXgX19n8Af/KLkDi');

-- Then insert rooms
INSERT INTO rooms (room_number, room_type, price, status) VALUES
-- Floors 1-5 (Single and Double rooms)
-- Floor 1
('101', 'Single', 100.00, 'available'),
('102', 'Double', 150.00, 'available'),
('103', 'Single', 100.00, 'available'),
('104', 'Double', 150.00, 'available'),
('105', 'Single', 100.00, 'available'),
('106', 'Double', 150.00, 'available'),
('107', 'Single', 100.00, 'available'),
('108', 'Double', 150.00, 'available'),
('109', 'Single', 100.00, 'available'),
('110', 'Double', 150.00, 'available'),

-- Similar pattern for floors 2-5 (rooms 201-510)
-- Floor 2
('201', 'Single', 100.00, 'available'),
-- ... (add remaining rooms for floors 2-5)

-- Floors 6-8 (Suite and Deluxe rooms)
-- Floor 6
('601', 'Suite', 300.00, 'available'),
('602', 'Deluxe', 250.00, 'available'),
('603', 'Suite', 300.00, 'available'),
('604', 'Deluxe', 250.00, 'available'),

-- Floor 7
('701', 'Suite', 300.00, 'available'),
-- ... (add remaining rooms for floors 7-8)

-- Floors 9-10 (Penthouses)
('901', 'Penthouse', 500.00, 'available'),
('902', 'Penthouse', 500.00, 'available'),
('1001', 'Penthouse Suite', 750.00, 'available'),
('1002', 'Penthouse Suite', 750.00, 'available'); 