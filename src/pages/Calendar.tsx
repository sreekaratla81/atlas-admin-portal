import React, { useMemo, useRef, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

const listings = [
  "Atlas Homes 101",
  "Atlas Homes 102",
  "Atlas Homes 201",
  "Atlas Homes 202",
  "Atlas Homes 301",
  "Atlas Homes 302",
  "Penthouse",
];

const CELL_WIDTH = 110;

export default function YearCalendarGrid() {
  const today = dayjs();
  const todayRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(today.startOf("month"));

  /* Build full year days */
  const yearDays: Dayjs[] = useMemo(() => {
    const start = today.startOf("year");
    const end = today.endOf("year");
    const days: Dayjs[] = [];
    let d = start;

    while (d.isBefore(end) || d.isSame(end, "day")) {
      days.push(d);
      d = d.add(1, "day");
    }
    return days;
  }, [today]);

  /* Month dropdown */
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        today.month(i).startOf("month")
      ),
    [today]
  );

  /* Filter listings */
  const filteredListings = listings.filter(l =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  /* Scroll sync month */
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const index = Math.floor(scrollRef.current.scrollLeft / CELL_WIDTH);
    const day = yearDays[index];
    if (day) setVisibleMonth(day.startOf("month"));
  };

  /* Scroll to today */
  useEffect(() => {
    todayRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
    });
  }, []);

  /* Dropdown change */
  const handleMonthChange = (value: string) => {
    const month = dayjs(value);
    const index = yearDays.findIndex(d => d.isSame(month, "month"));
    if (index >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * CELL_WIDTH,
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* LEFT PANEL */}
      <div style={{ width: 280, borderRight: "1px solid #e5e7eb" }}>
        <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 20 }}>
          <h2 style={{ padding: 12 }}>{filteredListings.length} listings</h2>
          <input
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "80%",
              margin: "0 12px 12px",
              padding: 10,
              border: "1px solid #e5e7eb",
              borderRadius: 6,
            }}
          />
        </div>

        <div style={{ overflowY: "auto", height: "calc(100vh - 120px)" }}>
          {filteredListings.map((l, i) => (
            <div
              key={i}
              style={{
                height: 52,
                display: "flex",
                alignItems: "center",
                paddingLeft: 14,
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
    <div style={{ flex: 1, overflow: "hidden", paddingTop: 16 }}>

        {/* 🔹 SINGLE STICKY DROPDOWN BAR */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
          }}
        >
          <select
            value={visibleMonth.format("YYYY-MM")}
            onChange={e => handleMonthChange(e.target.value)}
            style={{
              padding: 8,
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {months.map(m => (
              <option key={m.format("YYYY-MM")} value={m.format("YYYY-MM")}>
                {m.format("MMMM YYYY")}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              todayRef.current?.scrollIntoView({
                behavior: "smooth",
                inline: "center",
              })
            }
            style={{
              background: "#0284c7",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
            }}
          >
            Today
          </button>
        </div>

        {/* SCROLL AREA */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            overflow: "auto",
            height: "calc(100vh - 52px)",
          }}
        >
          {/* WEEK + DATE (SCROLLABLE) */}
          <div
  style={{
    display: "grid",
    gridTemplateColumns: `repeat(${yearDays.length}, ${CELL_WIDTH}px)`,
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: 20,
  }}
>

            {yearDays.map(d => {
              const isToday = d.isSame(today, "day");
              return (
                <div
                  key={d.toString()}
                  ref={isToday ? todayRef : null}
                  style={{
                    height: 56,
                    textAlign: "center",
                    fontWeight: 600,
                    background: isToday ? "#e0f2fe" : "#fff",
                    borderRight: "1px solid #f1f5f9",
                  }}
                >
                  <div>{d.format("ddd")}</div>
                  <div>{d.format("D")}</div>
                </div>
              );
            })}
          </div>

          {/* PRICE GRID (ROOMS × DATES — ORIGINAL BEHAVIOR) */}
          {filteredListings.map((_, r) => (
            <div
              key={r}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${yearDays.length}, ${CELL_WIDTH}px)`,
              }}
            >
              {yearDays.map((d, c) => {
                const isToday = d.isSame(today, "day");
                return (
                  <div
                    key={c}
                    style={{
                      height: 44,
                      borderBottom: "1px solid #f1f5f9",
                      borderRight: "1px solid #f1f5f9",
                      background: isToday ? "#bae6fd" : "#fffbe6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    ₹{2600 + r * 40}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
