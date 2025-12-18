import React, { useMemo, useState } from "react";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import { useDashboardQueues } from "@/hooks/useDashboardQueues";

export default function DashboardPage() {
  const { queues } = useDashboardQueues();
  const [active, setActive] = useState(queues[0]?.key ?? "");
  const activeQueue = useMemo(() => queues.find((q) => q.key === active) ?? queues[0], [queues, active]);

  return (
    <AdminShellLayout
      title="Operations Dashboard"
      rightSlot={<Button variant="secondary">Download Report</Button>}
    >
      <div className="page-grid">
        <Card
          title={activeQueue?.label ?? "Queue"}
          action={<Tabs tabs={queues.map((q) => ({ key: q.key, label: q.label }))} activeKey={active} onChange={setActive} />}
        >
          <DataTable
            columns={[
              { key: "bookingId", header: "Booking Id" },
              { key: "dateRange", header: "Date Range" },
              { key: "property", header: "Property" },
              {
                key: "guest",
                header: "Guest",
                render: (row) => (
                  <div>
                    <div style={{ fontWeight: 700 }}>{row.guest.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{row.guest.phone}</div>
                  </div>
                ),
              },
              { key: "source", header: "Source" },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <span
                    className="status-badge"
                    style={{
                      background: "var(--color-status-info-bg)",
                      color: "var(--color-status-info-text)",
                      border: "1px solid var(--color-status-info-border)",
                    }}
                  >
                    {row.status}
                  </span>
                ),
              },
            ]}
            data={activeQueue?.rows ?? []}
          />
        </Card>

        <Card title="Activities" action={<small style={{ color: "var(--text-muted)" }}>Realtime feed coming soon</small>}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {[1, 2, 3].map((item) => (
              <li
                key={item}
                style={{
                  padding: "12px 14px",
                  border: "1px dashed var(--shell-border)",
                  borderRadius: 10,
                  background: "var(--color-accent-soft)",
                }}
              >
                <div style={{ fontWeight: 700 }}>Activity placeholder {item}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Future activity feed will land here.</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AdminShellLayout>
  );
}
