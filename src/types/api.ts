export interface Guest {
  id: number;
  name: string;
  phone: string;
  email: string;
  idProofUrl?: string;
}

export interface Property {
  id: number;
  name: string;
  address: string;
  type: string;
  ownerName: string;
  contactPhone: string;
  commissionPercent?: number;
  status: string;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  baseAmount?: number;
  discountAmount?: number;
  convenienceFeeAmount?: number;
  method: string;
  type: string;
  receivedOn: string;
  note?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: string;
}

export interface Listing {
  id: number;
  propertyId: number;
  name: string;
  floor: number;
  type: string;
  status: string;
  maxGuests: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Incident {
  id: number;
  listingId: number;
  bookingId?: number;
  description: string;
  actionTaken: string;
  status: string;
  createdBy: string;
  createdOn: string;
}

export interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountType: string;
}

export interface PaginationHeaders {
  totalCount: number;
  page: number;
  pageSize: number;
}
