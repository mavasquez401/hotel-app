import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// Room endpoints
export const getRooms = () => api.get('/rooms');
export const getRoom = (id) => api.get(`/rooms/${id}`);
export const preReserveRoom = (roomId, { checkIn, checkOut, days }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    throw new Error('User not found');
  }
  console.log('Sending pre-reserve request:', {
    roomId,
    days,
    checkIn,
    checkOut,
    userId: user.id,
  });
  return api
    .post('/pre-reserve', {
      roomId,
      days,
      checkIn,
      checkOut,
      userId: user.id,
    })
    .catch((error) => {
      console.error('Pre-reserve error response:', error.response?.data);
      throw error;
    });
};
export const confirmBooking = (bookingId, paymentDetails) =>
  api.post('/confirm-booking', {
    bookingId,
    paymentDetails,
    status: 'confirmed',
  });
export const releaseReservation = (bookingId) =>
  api.post('/release-reservation', { bookingId });

// Get pre-reserved rooms for current user
export const getPreReservedRooms = () => api.get('/pre-reserved-rooms');
