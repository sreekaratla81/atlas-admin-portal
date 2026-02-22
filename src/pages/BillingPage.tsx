import React, { useEffect, useState } from "react";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import { api, asArray } from "@/lib/api";
import { useBilling } from "@/billing/BillingContext";

interface Plan {
  id: number;
  code: string;
  name: string;
  monthlyPriceInr: number;
  creditsIncluded: number;
  seatLimit: number;
  listingLimit: number;
}

interface Invoice {
  id: number;
  periodStartUtc: string;
  periodEndUtc: string;
  amountInr: number;
  totalInr: number;
  status: string;
  dueAtUtc: string | null;
  paidAtUtc: string | null;
}

const STATUS_BADGE: Record<string, React.CSSProperties> = {
  Draft: { background: "#e5e7eb", color: "#374151" },
  Issued: { background: "#dbeafe", color: "#1d4ed8" },
  Paid: { background: "#d1fae5", color: "#065f46" },
  Overdue: { background: "#fee2e2", color: "#991b1b" },
};

const SUB_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  Trial: { label: "Trial", color: "#6366f1" },
  Active: { label: "Active", color: "#16a34a" },
  PastDue: { label: "Past Due", color: "#ea580c" },
  Suspended: { label: "Suspended", color: "#dc2626" },
  Cancelled: { label: "Cancelled", color: "#6b7280" },
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtInr(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function BillingPage() {
  const { entitlements, isLocked, lockReason, creditsBalance, refresh } = useBilling();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [paying, setPaying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/billing/plans")
      .then((res) => setPlans(asArray<Plan>(res.data, "billing/plans")))
      .catch(() => setError("Failed to load plans."))
      .finally(() => setLoadingPlans(false));

    api.get("/billing/invoices")
      .then((res) => setInvoices(asArray<Invoice>(res.data, "billing/invoices")))
      .catch(() => {})
      .finally(() => setLoadingInvoices(false));
  }, []);

  async function handleSubscribe(planCode: string) {
    try {
      setSubscribing(planCode);
      setError(null);
      await api.post("/billing/subscribe", { planCode, autoRenew: true });
      await refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Subscription failed.");
    } finally {
      setSubscribing(null);
    }
  }

  async function handlePay(invoiceId: number) {
    try {
      setPaying(invoiceId);
      setError(null);
      const res = await api.post(`/billing/invoices/${invoiceId}/pay-link`);
      const url = res.data?.paymentLinkUrl;
      if (url) window.open(url, "_blank");
      else setError("No payment link returned.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not generate payment link.");
    } finally {
      setPaying(null);
    }
  }

  const subStatus = entitlements?.subscriptionStatus;
  const statusMeta = subStatus ? SUB_STATUS_LABEL[subStatus] : null;

  return (
    <AdminShellLayout title="Billing">
      {/* Lock banner */}
      {isLocked && (
        <div style={{
          background: "#dc2626", color: "#fff", borderRadius: 10,
          padding: "14px 20px", marginBottom: 18, display: "flex",
          alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            Your account is locked: {lockReason || "unknown reason"}. Renew your subscription or pay invoice to continue.
          </span>
          {entitlements?.overdueInvoiceId && (
            <button
              onClick={() => handlePay(entitlements.overdueInvoiceId!)}
              disabled={paying === entitlements.overdueInvoiceId}
              style={{
                background: "#fff", color: "#dc2626", border: "none",
                padding: "6px 18px", borderRadius: 6, fontWeight: 700,
                fontSize: 13, cursor: "pointer",
              }}
            >
              {paying === entitlements.overdueInvoiceId ? "Opening…" : "Pay Now"}
            </button>
          )}
        </div>
      )}

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
          padding: "10px 16px", marginBottom: 16, color: "#991b1b", fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Plan card */}
      <div style={{
        background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
        padding: "20px 24px", marginBottom: 24,
      }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>Current Plan</h2>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <Stat label="Plan" value={entitlements?.planCode ?? "—"} />
          <Stat
            label="Status"
            value={statusMeta?.label ?? (subStatus || "—")}
            valueColor={statusMeta?.color}
          />
          <Stat label="Credits Balance" value={String(creditsBalance)} />
          <Stat label="Period Ends" value={fmtDate(entitlements?.periodEndUtc)} />
          {entitlements?.isWithinGracePeriod && (
            <span style={{
              alignSelf: "center", background: "#fef3c7", color: "#92400e",
              padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            }}>
              Grace Period
            </span>
          )}
        </div>
      </div>

      {/* Available plans */}
      <div style={{
        background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
        padding: "20px 24px", marginBottom: 24,
      }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700 }}>Available Plans</h2>
        {loadingPlans ? (
          <p style={{ color: "#9ca3af" }}>Loading plans…</p>
        ) : plans.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No plans available.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {plans.map((p) => {
              const isCurrent = entitlements?.planCode === p.code;
              return (
                <div key={p.id} style={{
                  border: isCurrent ? "2px solid #ea580c" : "1px solid #e5e7eb",
                  borderRadius: 10, padding: "16px 18px",
                  background: isCurrent ? "#fff7ed" : "#fafafa",
                }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{fmtInr(p.monthlyPriceInr)}<span style={{ fontSize: 13, fontWeight: 400, color: "#6b7280" }}>/mo</span></div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                    {p.creditsIncluded} credits · {p.seatLimit} seats · {p.listingLimit} listings
                  </div>
                  <button
                    onClick={() => handleSubscribe(p.code)}
                    disabled={isCurrent || subscribing === p.code}
                    style={{
                      marginTop: 12, width: "100%", padding: "8px 0",
                      borderRadius: 6, border: "none", fontWeight: 700, fontSize: 13,
                      cursor: isCurrent ? "default" : "pointer",
                      background: isCurrent ? "#e5e7eb" : "#ea580c",
                      color: isCurrent ? "#6b7280" : "#fff",
                    }}
                  >
                    {isCurrent ? "Current Plan" : subscribing === p.code ? "Subscribing…" : "Subscribe"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div style={{
        background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
        padding: "20px 24px",
      }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700 }}>Invoices</h2>
        {loadingInvoices ? (
          <p style={{ color: "#9ca3af" }}>Loading invoices…</p>
        ) : invoices.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No invoices yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={th}>Invoice</th>
                  <th style={th}>Period</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Status</th>
                  <th style={th}>Due</th>
                  <th style={th}>Paid</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const badgeStyle = STATUS_BADGE[inv.status] || STATUS_BADGE.Draft;
                  const unpaid = inv.status === "Issued" || inv.status === "Overdue";
                  return (
                    <tr key={inv.id}>
                      <td style={td}>INV-{inv.id}</td>
                      <td style={td}>{fmtDate(inv.periodStartUtc)} – {fmtDate(inv.periodEndUtc)}</td>
                      <td style={td}>{fmtInr(inv.totalInr)}</td>
                      <td style={td}>
                        <span style={{
                          ...badgeStyle, padding: "3px 10px", borderRadius: 12,
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={td}>{fmtDate(inv.dueAtUtc)}</td>
                      <td style={td}>{fmtDate(inv.paidAtUtc)}</td>
                      <td style={td}>
                        {unpaid && (
                          <button
                            onClick={() => handlePay(inv.id)}
                            disabled={paying === inv.id}
                            style={{
                              background: "#ea580c", color: "#fff", border: "none",
                              padding: "5px 14px", borderRadius: 6, fontWeight: 600,
                              fontSize: 12, cursor: "pointer",
                            }}
                          >
                            {paying === inv.id ? "Opening…" : "Pay"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShellLayout>
  );
}

function Stat({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: valueColor || "#111" }}>{value}</div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: 12, textAlign: "left", fontSize: 13,
  fontWeight: 600, borderBottom: "1px solid #eee",
};

const td: React.CSSProperties = {
  padding: 12, fontSize: 14, borderBottom: "1px solid #eee",
};
