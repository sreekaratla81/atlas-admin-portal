import React, { useEffect, useMemo, useState } from "react";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import { api } from "@/lib/api";

/* ---------- Tabs ---------- */
const TABS = [
  { key: "checkin", label: "Today's Check-ins" },
  { key: "checkout", label: "Today's Check-outs" },
  { key: "upcoming", label: "Upcoming Bookings" },
  { key: "lead", label: "Booking Leads" },
];

export default function DashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [active, setActive] = useState("checkin");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuFilter, setMenuFilter] = useState<string | null>(null);

  /* ---------- API ---------- */
  useEffect(() => {
    api.get("/bookings").then((res) => {
      setBookings(res.data || []);
    });
  }, []);

  /* ---------- Helpers ---------- */
  const parseGuest = (guest: string) => {
    if (!guest) return { name: "-", phone: "-" };
    const parts = guest.split(" ");
    const phone = parts.pop();
    return { name: parts.join(" "), phone };
  };

  const today = new Date().toISOString().split("T")[0];

  /* ---------- Filters ---------- */
  const filteredRows = useMemo(() => {
    let rows = bookings;

    // Menu filter overrides tab
    if (menuFilter === "today") {
      rows = rows.filter((b) => b.checkinDate?.startsWith(today));
    } else if (menuFilter === "offline") {
      rows = rows.filter((b) => b.bookingSource === "Walk-in");
    } else {
      if (active === "checkin") rows = rows.filter((b) => b.checkinDate?.startsWith(today));
      if (active === "checkout") rows = rows.filter((b) => b.checkoutDate?.startsWith(today));
      if (active === "upcoming") rows = rows.filter((b) => b.checkinDate > today);
      if (active === "lead") rows = rows.filter((b) => b.bookingSource !== "Walk-in");
    }

    // Sort descending for upcoming, offline, lead
    if (active === "upcoming" || menuFilter === "offline" || active === "lead") {
      rows = rows.sort((a, b) => (b.checkinDate > a.checkinDate ? 1 : -1));
    }

    return rows;
  }, [bookings, active, today, menuFilter]);

  const countByType = (type: string) =>
    bookings.filter((b) => {
      if (type === "checkin") return b.checkinDate?.startsWith(today);
      if (type === "checkout") return b.checkoutDate?.startsWith(today);
      if (type === "upcoming") return b.checkinDate > today;
      if (type === "lead") return b.bookingSource !== "Walk-in";
      return false;
    }).length;

  return (
    <AdminShellLayout title="Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20 }}>
        {/* LEFT CARD */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            height: "80vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              padding: "16px 20px",
              borderBottom: "1px solid #eee",
            }}
          >
            {TABS.map((t) => (
              <div
                key={t.key}
                onClick={() => {
                  setActive(t.key);
                  setMenuFilter(null); // Clear menu filter when clicking a tab
                }}
                style={{
                  cursor: "pointer",
                  fontWeight: 600,
                  color: active === t.key ? "#ea580c" : "#555",
                  borderBottom:
                    active === t.key
                      ? "3px solid #ea580c"
                      : "3px solid transparent",
                  paddingBottom: 6,
                }}
              >
                {t.label} ({countByType(t.key)})
              </div>
            ))}

            {/* THREE DOTS */}
            <div
              style={{ marginLeft: "auto", position: "relative" }}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div style={{ fontSize: 22, cursor: "pointer" }}>⋯</div>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 28,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    minWidth: 200,
                    zIndex: 20,
                  }}
                >
                  <MenuItem
                    label={`Today's Bookings (${countByType("checkin")})`}
                    onClick={() => setMenuFilter("today")}
                  />
                  <MenuItem
                    label={`Offline Bookings (${bookings.filter(b => b.bookingSource === "Walk-in").length})`}
                    onClick={() => setMenuFilter("offline")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#fafafa" }}>
                <tr>
                  <th style={th}>Booking ID</th>
                  <th style={th}>Check-in – Check-out</th>
                  <th style={th}>Source</th>
                  <th style={th}>Guest</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length ? (
                  filteredRows.map((b) => {
                    const guest = parseGuest(b.guest);

                    return (
                      <tr key={b.id}>
                        <td style={td}>ABB-{b.id}</td>
                        <td style={td}>
                          {b.checkinDate?.split("T")[0]} →{" "}
                          {b.checkoutDate?.split("T")[0]}
                        </td>
                        <td style={td}>{b.bookingSource}</td>
                        <td style={td}>
                          <div style={{ fontWeight: 600 }}>{guest.name}</div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
                            {guest.phone}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: 16,
          }}
        >
          Activities – Coming Soon
        </div>
      </div>
    </AdminShellLayout>
  );
}

/* ---------- Helpers ---------- */
function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div
      style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14 }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </div>
  );
}

const th: React.CSSProperties = {
  padding: 12,
  textAlign: "left",
  fontSize: 13,
  fontWeight: 600,
  borderBottom: "1px solid #eee",
};

const td: React.CSSProperties = {
  padding: 12,
  fontSize: 14,
  borderBottom: "1px solid #eee",
};
