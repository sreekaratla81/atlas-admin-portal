export type CalendarBooking = {
  id: string;
  propertyId: string;
  guest: string;
  source?: string;
  start: string;
  end: string;
};

export type CalendarProperty = {
  id: string;
  name: string;
  location?: string;
};

export type UnifiedCalendarData = {
  properties: CalendarProperty[];
  bookings: CalendarBooking[];
};

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const mockCalendar: UnifiedCalendarData = {
  properties: [
    { id: "p1", name: "Seaside Villa" },
    { id: "p2", name: "City Loft" },
    { id: "p3", name: "Mountain Cabin" },
    { id: "p4", name: "Lakeside Retreat" },
  ],
  bookings: [
    { id: "b1", propertyId: "p1", guest: "Alex Morgan", source: "Airbnb", start: addDays(1), end: addDays(4) },
    { id: "b2", propertyId: "p2", guest: "Jamie Fox", source: "Website", start: addDays(0), end: addDays(2) },
    { id: "b3", propertyId: "p3", guest: "Jordan Lee", source: "Walk-in", start: addDays(3), end: addDays(7) },
  ],
};

export function useUnifiedCalendar() {
  // Replace with data fetching later
  return { data: mockCalendar, rangeDays: 14 };
}
