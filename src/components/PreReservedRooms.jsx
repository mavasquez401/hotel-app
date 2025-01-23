import { useState, useEffect } from 'react';
import { getPreReservedRooms, releaseReservation } from '../services/api';
import '../App.css';

const PreReservedRooms = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = async () => {
    try {
      const response = await getPreReservedRooms();
      setReservations(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reservations');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleRelease = async (bookingId) => {
    try {
      await releaseReservation(bookingId);
      await fetchReservations(); // Refresh the list
      alert('Reservation released successfully');
    } catch (error) {
      alert('Failed to release reservation');
    }
  };

  if (loading) return <div>Loading reservations...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pre-reserved-section">
      <h2>Pre-reserved Rooms</h2>
      {reservations.length === 0 ? (
        <p className="no-reservations">No pre-reserved rooms</p>
      ) : (
        <div className="reservations-grid">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="reservation-card">
              <div className="reservation-header">
                <h3>Room {reservation.room_number}</h3>
                <span className="reservation-status">Pre-reserved</span>
              </div>
              <div className="reservation-details">
                <p>Room Type: {reservation.room_type}</p>
                <p>
                  Check-in:{' '}
                  {new Date(reservation.check_in_date).toLocaleDateString()}
                </p>
                <p>
                  Check-out:{' '}
                  {new Date(reservation.check_out_date).toLocaleDateString()}
                </p>
                <p>Total Price: ${reservation.total_price}</p>
                <p className="expiry-time">
                  Reserved until:{' '}
                  {new Date(reservation.reserved_until).toLocaleString()}
                </p>
              </div>
              <button
                className="release-button"
                onClick={() => handleRelease(reservation.id)}
              >
                Release Reservation
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreReservedRooms;
