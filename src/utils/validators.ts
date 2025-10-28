export type GuestForm = {
  name: string;
  phone: string;
  email: string;
  notes?: string;
};

export function validateGuest(form: GuestForm): string {
  if (!form.name?.trim()) {
    return "Name is required";
  }
  if (!form.phone?.trim()) {
    return "Phone is required";
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return "Email is invalid";
  }
  return "";
}
