import { http } from './http';

export const getBankAccounts = async () => {
  const res = await http.get(`/bankaccounts`);
  return res.data;
};

export const createBankAccount = async (data) => {
  const res = await http.post(`/bankaccounts`, data);
  return res.data;
};

export const updateBankAccount = async (id, data) => {
  const res = await http.put(`/bankaccounts/${id}`, data);
  return res.data;
};

export const deleteBankAccount = async (id) => {
  const res = await http.delete(`/bankaccounts/${id}`);
  return res.data;
};

export const getBankAccountEarnings = async () => {
  const res = await http.get(`/reports/bank-account-earnings`);
  return res.data;
};
