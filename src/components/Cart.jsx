import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Cart = ({ bookings, removeFromCart, checkout }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const calculateTotal = () => {
    return bookings.reduce((total, booking) => {
      return total + booking.price * booking.days;
    }, 0);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    navigate('/checkout');
  };

  if (bookings.length === 0) {
    return null;
  }

  return (
    <div className="cart-container">
      <h3>Your Bookings</h3>
      <div className="cart-items">
        {bookings.map((booking, index) => (
          <div key={index} className="cart-item">
            <div className="cart-item-details">
              <h4>Room {booking.room_number}</h4>
              <p>{booking.room_type}</p>
              <p>{booking.days} days</p>
              <p>${booking.price}/night</p>
              <p className="cart-item-total">
                Total: ${booking.price * booking.days}
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
      </div>
      <div className="cart-summary">
        <div className="cart-total">Total: ${calculateTotal()}</div>
        <button
          className="checkout-button"
          onClick={handleCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
