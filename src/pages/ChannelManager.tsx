import React, { useState } from "react";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import PropertySidebar from "@/components/admin/PropertySidebar";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import { useUnifiedCalendar } from "@/hooks/useUnifiedCalendar";
import Button from "@/components/ui/Button";

const channelTabs = [
  { key: "inventory", label: "Inventory Rate" },
  { key: "flexi", label: "Flexi Pricing" },
];

export default function ChannelManagerPage() {
  const { data } = useUnifiedCalendar();
  const [activeTab, setActiveTab] = useState(channelTabs[0].key);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  return (
    <AdminShellLayout
      title="Channel Manager"
      rightSlot={<Button variant="secondary">Integration settings</Button>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <PropertySidebar
          properties={data.properties}
          onSelect={setSelectedProperty}
          selectedId={selectedProperty}
          title="Select property"
        />

        <div style={{ display: "grid", gap: 16 }}>
          <Card action={<Tabs tabs={channelTabs} activeKey={activeTab} onChange={setActiveTab} />}>
            <div style={{ color: "var(--text-muted)" }}>
              {selectedProperty ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontWeight: 700 }}>Workspace placeholder</div>
                  <p style={{ margin: 0 }}>
                    Rates and availability controls for <strong>{selectedProperty}</strong> will appear here.
                  </p>
                  <p style={{ margin: 0 }}>Active tab: {channelTabs.find((t) => t.key === activeTab)?.label}</p>
                </div>
              ) : (
                <div style={{ padding: "20px 0" }}>Select a property to manage its inventory.</div>
              )}
            </div>
          </Card>

          <Card title="Integration status" action={<Button variant="secondary">Refresh</Button>}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "var(--status-warning-strong)",
                }}
              />
              <div>
                <div style={{ fontWeight: 700 }}>Channex: Not connected</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Connect your PMS or OTA partner here.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminShellLayout>
  );
}
