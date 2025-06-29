import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

export const getBookings = async () => {
  const res = await axios.get(`${API_BASE}/bookings`);
  return res.data;
};

export const createBooking = async (data) => {
  const res = await axios.post(`${API_BASE}/bookings`, data);
  return res.data;
};

export const updateBooking = async (id, data) => {
  const res = await axios.put(`${API_BASE}/bookings/${id}`, data);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await axios.delete(`${API_BASE}/bookings/${id}`);
  return res.data;
};
