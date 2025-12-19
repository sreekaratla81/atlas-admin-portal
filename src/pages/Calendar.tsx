import React, { useMemo, useState } from "react";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import PropertySidebar from "@/components/admin/PropertySidebar";
import Card from "@/components/ui/Card";
import { useUnifiedCalendar } from "@/hooks/useUnifiedCalendar";
import Button from "@/components/ui/Button";

function buildDateRange(days: number) {
  const dates: string[] = [];
  const start = new Date();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function UnifiedCalendarPage() {
  const { data, rangeDays } = useUnifiedCalendar();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [drawerBooking, setDrawerBooking] = useState<string | null>(null);
  const dates = useMemo(() => buildDateRange(rangeDays), [rangeDays]);
  const bookings = useMemo(
    () => data.bookings.filter((b) => !selectedProperty || b.propertyId === selectedProperty),
    [data.bookings, selectedProperty]
  );

  const openBooking = bookings.find((b) => b.id === drawerBooking);

  return (
    <AdminShellLayout
      title="Unified Calendar"
      rightSlot={<Button variant="secondary">Export</Button>}
    >
      <div className="ops-grid">
        <PropertySidebar properties={data.properties} onSelect={setSelectedProperty} selectedId={selectedProperty} />
        <Card className="table-card">
          <div style={{ overflowX: "auto" }}>
            <table className="shell-table calendar-table">
              <thead>
                <tr>
                  <th style={{ width: 160, textAlign: "left" }}>Property</th>
                  {dates.map((date) => (
                    <th key={date} style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                      {date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.properties
                  .filter((p) => !selectedProperty || p.id === selectedProperty)
                  .map((property) => (
                    <tr key={property.id}>
                      <td style={{ fontWeight: 700 }}>{property.name}</td>
                      {dates.map((date) => {
                        const cellBookings = bookings.filter(
                          (b) => b.propertyId === property.id && date >= b.start && date <= b.end
                        );
                        return (
                          <td key={`${property.id}-${date}`} style={{ minWidth: 80 }}>
                            <div style={{ display: "grid", gap: 6 }}>
                              {cellBookings.map((booking) => (
                                <button
                                  key={booking.id}
                                  onClick={() => setDrawerBooking(booking.id)}
                                  className="booking-chip"
                                  style={{ fontSize: 12, lineHeight: 1.3 }}
                                >
                                  <div style={{ fontWeight: 700 }}>{booking.guest}</div>
                                  {booking.source && (
                                    <span className="booking-chip__source">{booking.source}</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {openBooking && (
        <div
          role="dialog"
          aria-modal
          className="shell-card"
          style={{
            position: "fixed",
            right: 24,
            top: 120,
            width: 320,
            zIndex: 60,
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Booking {openBooking.id}</h3>
            <button className="shell-button secondary" onClick={() => setDrawerBooking(null)} style={{ padding: "6px 10px" }}>
              Close
            </button>
          </div>
          <dl style={{ display: "grid", gap: 8, marginTop: 12 }}>
            <div>
              <dt style={{ fontWeight: 600 }}>Guest</dt>
              <dd style={{ margin: 0 }}>{openBooking.guest}</dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600 }}>Source</dt>
              <dd style={{ margin: 0 }}>{openBooking.source ?? "Unspecified"}</dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600 }}>Dates</dt>
              <dd style={{ margin: 0 }}>
                {openBooking.start} – {openBooking.end}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </AdminShellLayout>
  );
}
