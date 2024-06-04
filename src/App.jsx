import { useState } from 'react'
import './hotelBooking.css'

// Array of data.. type of room, rate of room, if available
const rooms = [
  { type: 'Single', dailyRate: 50, available: true },
  { type: 'Double', dailyRate: 80, available: true },
  { type: 'Suite', dailyRate: 150, available: true },
  { type: 'Deluxe', dailyRate: 200, available: false },
  { type: 'Penthouse', dailyRate: 300, available: false }
]

// HotelBooking Component (Functional Component)
const HotelBooking = () => {
  // State Hook for selected room type
  const [selectedRoom, setSelectedRoom] = useState('')
  // State Hook for selected number of days
  const [selectedDays, setSelectedDays] = useState('')

  // Function to handle room selection change
  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value)
    setSelectedDays('')
  };

  // Function to reset selections
  const resetSelections = () => {
    setSelectedRoom('')
    setSelectedDays('')
  };

  // Find details of the selected room
  const selectedRoomDetails = rooms.find(room => room.type === selectedRoom);

  return (
    // JSX (JavaScript XML)
    <div className="hotel-booking">
      <h1>DevAccelerator Hotel Inn</h1>
      <label htmlFor="roomSelect">Choose a room type:</label>
      <select id="roomSelect" value={selectedRoom} onChange={handleRoomChange}>
        <option value="" disabled>Select a room type</option>
        {rooms.map((room, index) => (
          // JSX and Props
          <option key={index} value={room.type}>{room.type}</option>
        ))}
      </select>

      <label htmlFor="daysSelect">How many days are you staying?:</label>
      <select id="daysSelect" value={selectedDays} onChange={e => setSelectedDays(e.target.value)} disabled={!selectedRoom}>
        <option value="" disabled>Select days</option>
        {[...Array(90).keys()].map(day => (
          // JSX and Props
          <option key={day + 1} value={day + 1}>{day + 1}</option>
        ))}
      </select>

      {selectedRoom && selectedDays && (
        <div className="details">
          <p>
            You selected: {selectedRoom} room for {selectedDays} days
          </p>
          <p>Daily Rate: ${selectedRoomDetails.dailyRate}</p>
          <p>Total Cost: ${selectedRoomDetails.dailyRate * selectedDays}</p>
          {selectedRoomDetails.available ? (
            <button onClick={() => alert(`Booking ${selectedRoom} room for ${selectedDays} days`)}>
              Book Now
            </button>
          ) : (
            <p className="unavailable">This room is already taken.</p>
          )}
        </div>
      )}

      <button className="reset-button" onClick={resetSelections}>Reset</button>
    </div>
  );
};

export default HotelBooking