import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preReserveRoom, confirmBooking } from '../services/api';
import Navbar from './Navbar';
import '../App.css';

const Checkout = ({ bookings, onCheckout, removeFromCart }) => {
  const navigate = useNavigate();
  const [isPreReserving, setIsPreReserving] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  if (!bookings || bookings.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="empty-cart">
          <p>Your cart is empty. Please select rooms to book.</p>
          <button onClick={() => navigate('/rooms')} className="return-button">
            Return to Rooms
          </button>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    return bookings.reduce((total, booking) => {
      return total + booking.price * booking.days;
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First confirm all pre-reserved rooms
      for (const booking of bookings) {
        if (booking.bookingId) {
          await confirmBooking(booking.bookingId, paymentDetails);
        }
      }

      alert('Payment successful! Thank you for your booking.');
      navigate('/rooms');
    } catch (error) {
      alert('Payment failed. Please try again.');
    }
  };

  const handlePreReserve = async () => {
    setIsPreReserving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        throw new Error('Please log in again');
      }

      for (const booking of bookings) {
        await preReserveRoom(booking.room_id || booking.id, booking.days);
      }
      alert('Rooms have been pre-reserved for 24 hours!');
      navigate('/rooms');
    } catch (error) {
      alert(error.message || 'Failed to pre-reserve rooms. Please try again.');
    } finally {
      setIsPreReserving(false);
    }
  };

  return (
    <div className="checkout-page">
      <Navbar />

      <div className="checkout-actions">
        <button onClick={() => navigate('/rooms')} className="add-rooms-button">
          <span>+</span> Add More Rooms
        </button>
      </div>

      <div className="checkout-grid">
        <div className="booking-summary">
          <h2>Booking Summary</h2>
          {bookings.map((booking, index) => (
            <div key={index} className="checkout-item">
              <div className="checkout-item-details">
                <h3>Room {booking.room_number}</h3>
                <p>{booking.room_type}</p>
                <p>{booking.days} days</p>
                <p className="price">${booking.price}/night</p>
                <p className="subtotal">
                  Subtotal: ${booking.price * booking.days}
                </p>
              </div>
              <button
                className="remove-button"
                onClick={() => removeFromCart(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="total-amount">
            <h3>Total Amount: ${calculateTotal()}</h3>
            <div className="checkout-options">
              <button
                className="pre-reserve-button"
                onClick={handlePreReserve}
                disabled={isPreReserving}
              >
                {isPreReserving
                  ? 'Pre-reserving...'
                  : 'Pre-reserve for 24 hours'}
              </button>
              <p className="pre-reserve-note">
                *Pre-reserve will hold the rooms for 24 hours without payment
              </p>
            </div>
          </div>
        </div>

        <div className="payment-form">
          <h2>Payment Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name on Card</label>
              <input
                type="text"
                name="cardName"
                value={paymentDetails.cardName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                pattern="[0-9]{16}"
                maxLength="16"
                placeholder="1234567890123456"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={paymentDetails.expiryDate}
                  onChange={handleInputChange}
                  pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentDetails.cvv}
                  onChange={handleInputChange}
                  pattern="[0-9]{3,4}"
                  maxLength="4"
                  required
                />
              </div>
            </div>
            <button type="submit" className="pay-button">
              Pay ${calculateTotal()}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
