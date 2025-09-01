import { api, asArray } from '@/lib/api';

export const getBankAccounts = async () => {
  const { data } = await api.get(`/bankaccounts`);
  return asArray(data, 'bankaccounts');
};

export const createBankAccount = async (data) => {
  const res = await api.post(`/bankaccounts`, data);
  return res.data;
};

export const updateBankAccount = async (id, data) => {
  const res = await api.put(`/bankaccounts/${id}`, data);
  return res.data;
};

export const deleteBankAccount = async (id) => {
  const res = await api.delete(`/bankaccounts/${id}`);
  return res.data;
};

export const getBankAccountEarnings = async () => {
  const { data } = await api.get(`/reports/bank-account-earnings`);
  return asArray(data, 'bank-account-earnings');
};
