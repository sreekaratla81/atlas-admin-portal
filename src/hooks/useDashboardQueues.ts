export type DashboardBooking = {
  bookingId: string;
  dateRange: string;
  property: string;
  guest: { name: string; phone: string };
  source: string;
  status: string;
};

export type DashboardQueue = {
  key: string;
  label: string;
  rows: DashboardBooking[];
};

const mockRows: DashboardBooking[] = [
  {
    bookingId: "AT-1001",
    dateRange: "Jan 05 - Jan 07",
    property: "Seaside Villa",
    guest: { name: "Alex Morgan", phone: "+1 555 123 4567" },
    source: "Airbnb",
    status: "Upcoming",
  },
  {
    bookingId: "AT-1002",
    dateRange: "Jan 06 - Jan 10",
    property: "City Loft",
    guest: { name: "Jamie Fox", phone: "+44 7700 900123" },
    source: "Website",
    status: "Ongoing",
  },
  {
    bookingId: "AT-1003",
    dateRange: "Jan 08 - Jan 09",
    property: "Mountain Cabin",
    guest: { name: "Jordan Lee", phone: "+91 8877 223344" },
    source: "Walk-in",
    status: "Lead",
  },
];

const queueKeys: DashboardQueue[] = [
  { key: "checkins", label: "Today Check-ins", rows: mockRows },
  { key: "checkouts", label: "Today Check-outs", rows: mockRows },
  { key: "upcoming", label: "Upcoming Bookings", rows: mockRows },
  { key: "leads", label: "Booking Leads", rows: mockRows },
  { key: "todays", label: "Today’s Bookings", rows: mockRows },
  { key: "offline", label: "Offline Bookings", rows: mockRows },
];

export function useDashboardQueues() {
  // Placeholder for a real data hook (React Query, SWR, etc.)
  return { queues: queueKeys };
}
