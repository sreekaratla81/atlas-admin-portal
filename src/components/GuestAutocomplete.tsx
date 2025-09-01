import { useState } from "react";
import { useLocalGuestSearch } from "../hooks/useLocalGuestSearch";
import type { GuestLite } from "../api/guests";

export default function GuestAutocomplete({
  onSelect, onAddNew
}: { onSelect: (g: GuestLite) => void; onAddNew: () => void; }) {

  const [q, setQ] = useState("");
  const { results, loading, ensureLoaded } =
    useLocalGuestSearch(q, { maxRecords: 2000, pageSize: 200 });

  return (
    <div className="relative">
      <input
        placeholder="Search or Add Guest"
        value={q}
        onFocus={ensureLoaded}
        onChange={(e) => setQ(e.target.value)}
        className="input"
      />
      {q && (
        <div className="dropdown">
          {loading && <div className="item">Loading guests…</div>}
          {!loading && results.map(r => (
            <div key={r.id} className="item" onClick={() => onSelect(r)}>
              <strong>{r.name}</strong> &nbsp;·&nbsp; {r.phone ?? ""} &nbsp;·&nbsp; {r.email ?? ""}
            </div>
          ))}
          {!loading && <div className="item add" onClick={onAddNew}>+ Add new guest</div>}
        </div>
      )}
    </div>
  );
}
