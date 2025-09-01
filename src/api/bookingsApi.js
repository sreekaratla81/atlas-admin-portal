import { api, asArray } from '@/lib/api';

export const getBookings = async () => {
  // Request related bank account data with each booking
  const { data } = await api.get(`/bookings`, { params: { include: 'bankAccount' } });
  return asArray(data, 'bookings');
};

export const createBooking = async (data) => {
  const res = await api.post(`/bookings`, data);
  return res.data;
};

export const updateBooking = async (id, data) => {
  const res = await api.put(`/bookings/${id}`, data);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await api.delete(`/bookings/${id}`);
  return res.data;
};
