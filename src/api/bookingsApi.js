import { http } from './http';

export const getBookings = async () => {
  // Request related bank account data with each booking
  const res = await http.get(`/bookings`, { params: { include: 'bankAccount' } });
  return res.data;
};

export const createBooking = async (data) => {
  const res = await http.post(`/bookings`, data);
  return res.data;
};

export const updateBooking = async (id, data) => {
  const res = await http.put(`/bookings/${id}`, data);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await http.delete(`/bookings/${id}`);
  return res.data;
};
