import React, { useMemo, useState } from "react";
import { CalendarProperty } from "@/hooks/useUnifiedCalendar";

interface Props {
  properties: CalendarProperty[];
  onSelect: (propertyId: string | null) => void;
  selectedId?: string | null;
  title?: string;
}

export default function PropertySidebar({ properties, onSelect, selectedId, title = "Properties" }: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => properties.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [properties, query]
  );

  return (
    <aside className="shell-card" style={{ minWidth: 260, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{properties.length} total</span>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search property"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid var(--shell-border)",
          marginBottom: 12,
        }}
      />
      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map((property) => (
          <button
            key={property.id}
            onClick={() => onSelect(property.id)}
            className="shell-button secondary"
            style={{
              justifyContent: "flex-start",
              borderColor: selectedId === property.id ? "#0ea5e9" : "var(--shell-border)",
              background: selectedId === property.id ? "#e0f2fe" : "#fff",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700 }}>{property.name}</div>
              {property.location && <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{property.location}</div>}
            </div>
          </button>
        ))}
        {!filtered.length && <div style={{ color: "var(--text-muted)", fontSize: 14 }}>No properties match.</div>}
      </div>
    </aside>
  );
}
