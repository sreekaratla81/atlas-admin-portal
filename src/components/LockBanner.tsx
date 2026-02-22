import { Link } from "react-router-dom";
import { useBilling } from "@/billing/BillingContext";

export default function LockBanner() {
  const { isLocked, lockReason } = useBilling();
  if (!isLocked) return null;

  return (
    <div style={{
      background: "#dc2626",
      color: "#fff",
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 14,
      fontWeight: 600,
    }}>
      <span>
        Your account is locked: {lockReason || "unknown reason"}. Renew subscription or pay invoice to continue.
      </span>
      <Link
        to="/billing"
        style={{
          background: "#fff",
          color: "#dc2626",
          padding: "6px 16px",
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 13,
          textDecoration: "none",
        }}
      >
        Go to Billing
      </Link>
    </div>
  );
}
