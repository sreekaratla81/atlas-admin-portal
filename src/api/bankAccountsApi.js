import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

export const getBankAccounts = async () => {
  const res = await axios.get(`${API_BASE}/bankaccounts`);
  return res.data;
};

export const createBankAccount = async (data) => {
  const res = await axios.post(`${API_BASE}/bankaccounts`, data);
  return res.data;
};

export const updateBankAccount = async (id, data) => {
  const res = await axios.put(`${API_BASE}/bankaccounts/${id}`, data);
  return res.data;
};

export const deleteBankAccount = async (id) => {
  const res = await axios.delete(`${API_BASE}/bankaccounts/${id}`);
  return res.data;
};
