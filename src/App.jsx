import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Rooms from './components/Rooms';
import Checkout from './components/Checkout';
import './App.css';
import { useState } from 'react';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (booking) => {
    setCartItems([...cartItems, booking]);
  };

  const removeFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleCheckout = async (paymentDetails) => {
    // Here you would typically make an API call to process the payment
    console.log('Processing payment:', paymentDetails);
    setCartItems([]); // Clear cart after successful payment
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/rooms"
          element={
            <PrivateRoute>
              <Rooms
                cart={cartItems}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout
                bookings={cartItems}
                onCheckout={handleCheckout}
                removeFromCart={removeFromCart}
              />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/rooms" />} />
      </Routes>
    </Router>
  );
}

export default App;
