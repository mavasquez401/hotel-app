import { useState, useEffect } from 'react';
import { getRooms, preReserveRoom } from '../services/api';
import Cart from './Cart';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../App.css';
import PreReservedRooms from './PreReservedRooms';

const roomDescriptions = {
  Single:
    'Cozy room with a single bed, perfect for solo travelers. Includes TV, desk, and private bathroom.',
  Double:
    'Comfortable room with a double bed, ideal for couples. Features TV, work area, and ensuite bathroom.',
  Suite:
    'Spacious suite with separate living area, king bed, and premium amenities. Includes minibar and city views.',
  Deluxe:
    'Luxury room with king bed, lounge area, and upgraded amenities. Features panoramic views and premium services.',
  'Penthouse Suite':
    'Ultimate luxury with multiple rooms, premium furnishings, and spectacular views. Includes private terrace and VIP services.',
};

const Rooms = ({ cart, addToCart, removeFromCart }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDays, setSelectedDays] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await getRooms();
        console.log('Rooms data:', response.data);
        // Sort rooms: available first, then by room number
        const sortedRooms = response.data.sort((a, b) => {
          if (a.status === b.status) {
            return parseInt(a.room_number) - parseInt(b.room_number);
          }
          return a.status === 'available' ? -1 : 1;
        });
        console.log('Sorted rooms:', sortedRooms);
        setRooms(sortedRooms);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to fetch rooms');
        }
        setLoading(false);
      }
    };

    fetchRooms();
  }, [navigate]);

  const getFloorNumber = (roomNumber) => {
    return Math.floor(parseInt(roomNumber) / 100);
  };

  const getRoomCategory = (roomNumber) => {
    const floor = getFloorNumber(roomNumber);
    if (floor >= 9) return 'Penthouse Floor';
    if (floor >= 6) return 'Premium Floor';
    return 'Standard Floor';
  };

  const resetSelections = () => {
    setSelectedRoom('');
    setSelectedDays('');
  };

  const handleAddToCart = async () => {
    const roomToBook = rooms.find((room) => room.room_number === selectedRoom);
    if (roomToBook) {
      console.log('Room to book:', roomToBook); // Debug log
      try {
        const response = await preReserveRoom(
          roomToBook.id, // Use the ID from the database
          parseInt(selectedDays)
        );
        console.log('Pre-reserve response:', response.data); // Debug log
        const booking = {
          room_number: roomToBook.room_number,
          room_type: roomToBook.room_type,
          price: roomToBook.price,
          days: parseInt(selectedDays),
          room_id: roomToBook.id,
          bookingId: response.data.bookingId,
          reservedUntil: response.data.reservedUntil,
        };
        addToCart(booking);

        // Update room availability in the UI
        setRooms(
          rooms.map((room) =>
            room.room_number === selectedRoom
              ? { ...room, status: 'occupied' }
              : room
          )
        );
        resetSelections();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        alert('Failed to reserve room. Please try again.');
      }
    }
  };

  const handleRemoveFromCart = (index) => {
    const removedBooking = cart[index];
    // Update room availability back to available
    setRooms(
      rooms.map((room) =>
        room.room_number === removedBooking.room_number
          ? { ...room, status: 'available' }
          : room
      )
    );
    removeFromCart(index);
  };

  const handleCheckout = async () => {
    try {
      // Here you would typically make an API call to process the bookings
      alert(`Successfully booked ${cart.length} rooms!`);
      resetSelections();
    } catch (error) {
      alert('Failed to process bookings. Please try again.');
    }
  };

  const selectedRoomDetails = rooms.find(
    (room) => room.room_number === selectedRoom
  );

  if (loading) return <div className="loading">Loading rooms...</div>;
  if (error) return <div className="error">{error}</div>;

  // Group rooms by floor category
  const groupedRooms = rooms.reduce((acc, room) => {
    const category = getRoomCategory(room.room_number);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(room);
    return acc;
  }, {});

  return (
    <div className="hotel-booking">
      <Navbar />

      <PreReservedRooms />

      <div className="sidebar">
        {selectedRoom && (
          <div className="booking-form">
            <h2>Book Room {selectedRoom}</h2>
            <label htmlFor="daysSelect">Number of Days:</label>
            <select
              id="daysSelect"
              value={selectedDays}
              onChange={(e) => setSelectedDays(e.target.value)}
            >
              <option value="" disabled>
                Select days
              </option>
              {[...Array(90).keys()].map((day) => (
                <option key={day + 1} value={day + 1}>
                  {day + 1}
                </option>
              ))}
            </select>

            {selectedDays && (
              <div className="booking-details">
                <p>
                  Selected Room:{' '}
                  {rooms.find((r) => r.room_number === selectedRoom)?.room_type}{' '}
                  (Room {selectedRoom})
                </p>
                <p>
                  Daily Rate: $
                  {rooms.find((r) => r.room_number === selectedRoom)?.price}
                </p>
                <p>
                  Total Cost: $
                  {rooms.find((r) => r.room_number === selectedRoom)?.price *
                    selectedDays}
                </p>
                <button className="book-button" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        )}

        <Cart
          bookings={cart}
          removeFromCart={handleRemoveFromCart}
          checkout={handleCheckout}
        />
      </div>

      <div className="main-content">
        {Object.entries(groupedRooms).map(([category, categoryRooms]) => (
          <div key={category} className="floor-section">
            <h2 className="floor-title">{category}</h2>
            <div className="room-grid">
              {categoryRooms.map((room) => (
                <div
                  key={room.room_number}
                  className={`room-card ${
                    room.status === 'available' ? 'available' : 'occupied'
                  } ${selectedRoom === room.room_number ? 'selected' : ''}`}
                  onClick={() =>
                    room.status === 'available' &&
                    setSelectedRoom(room.room_number)
                  }
                >
                  {selectedRoom === room.room_number && (
                    <div className="selected-indicator">✓</div>
                  )}
                  <div className="room-number">Room {room.room_number}</div>
                  <div className="room-type">{room.room_type}</div>
                  <div className="room-description">
                    {roomDescriptions[room.room_type]}
                  </div>
                  <div className="room-price">${room.price}/night</div>
                  <div className={`room-status ${room.status}`}>
                    {room.status === 'available' ? 'Available' : 'Unavailable'}
                  </div>
                  <div className="floor-indicator">
                    Floor {getFloorNumber(room.room_number)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="reset-button" onClick={resetSelections}>
        Reset Selection
      </button>
    </div>
  );
};

export default Rooms;
