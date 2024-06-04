import { useState } from 'react'
import './hotelBooking.css'

const rooms = [
  { type: 'Single', dailyRate: 50, available: true },
  { type: 'Double', dailyRate: 80, available: true },
  { type: 'Suite', dailyRate: 150, available: true },
  { type: 'Deluxe', dailyRate: 200, available: false },
  { type: 'Penthouse', dailyRate: 300, available: false }
]

const HotelBooking = () => {
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedDays, setSelectedDays] = useState('')

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value)
    setSelectedDays('')
  };

  const resetSelections = () => {
    setSelectedRoom('')
    setSelectedDays('')
  };

  const selectedRoomDetails = rooms.find(room => room.type === selectedRoom);

  return (
    <div className="hotel-booking">
      <h1>DevAccelerator Hotel Inn</h1>
      <label htmlFor="roomSelect">Choose a room type:</label>
      <select id="roomSelect" value={selectedRoom} onChange={handleRoomChange}>
        <option value="" disabled>Select a room type</option>
        {rooms.map((room, index) => (
          <option key={index} value={room.type}>{room.type}</option>
        ))}
      </select>

      <label htmlFor="daysSelect">How many days are you staying?:</label>
      <select id="daysSelect" value={selectedDays} onChange={e => setSelectedDays(e.target.value)} disabled={!selectedRoom}>
        <option value="" disabled>Select days</option>
        {[...Array(90).keys()].map(day => (
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