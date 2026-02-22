import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@mui/material";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import { api } from "@/lib/api";

interface ChecklistItem {
  itemKey: string;
  title: string;
  stage: string;
  status: string;
  isBlocking: boolean;
}

interface OnboardingStatus {
  overallStatus: string;
  checklist: ChecklistItem[];
}

const STAGE_ORDER = ["FastStart", "PublishGate", "PostPublish"] as const;

const stageBadgeColors: Record<string, { bg: string; text: string }> = {
  FastStart: { bg: "#dbeafe", text: "#1d4ed8" },
  PublishGate: { bg: "#fef3c7", text: "#92400e" },
  PostPublish: { bg: "#d1fae5", text: "#065f46" },
};

const statusDot: Record<string, string> = {
  Complete: "#22c55e",
  Pending: "#f59e0b",
};

export default function OnboardingDashboard() {
  const [data, setData] = useState<OnboardingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string[] | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    api
      .get("/onboarding/status")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load onboarding status."));
  }, []);

  const grouped = STAGE_ORDER.map((stage) => ({
    stage,
    items: (data?.checklist ?? []).filter((c) => c.stage === stage),
  })).filter((g) => g.items.length > 0);

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);
    try {
      await api.post("/onboarding/publish");
      setPublishSuccess(true);
      const res = await api.get("/onboarding/status");
      setData(res.data);
    } catch (err: any) {
      const body = err.response?.data;
      if (body?.blockers && Array.isArray(body.blockers)) {
        setPublishError(body.blockers);
      } else {
        setPublishError([body?.message || "Publish failed. Please try again."]);
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AdminShellLayout
      title="Onboarding"
      rightSlot={
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/onboarding/profile" style={linkBtnStyle}>
            Edit Profile
          </Link>
          <Link to="/onboarding/documents" style={linkBtnStyle}>
            Upload Documents
          </Link>
        </div>
      }
    >
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {publishSuccess && (
        <Alert severity="success" onClose={() => setPublishSuccess(false)} sx={{ mb: 2 }}>
          Published successfully!
        </Alert>
      )}

      {publishError && (
        <div style={errorBoxStyle}>
          <strong>Cannot publish — blockers found:</strong>
          <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
            {publishError.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Status banner */}
      {data && (
        <div style={bannerStyle}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>
            Status:{" "}
            <span style={{ color: data.overallStatus === "Published" ? "#059669" : "#d97706" }}>
              {data.overallStatus}
            </span>
          </span>
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              ...publishBtnStyle,
              opacity: publishing ? 0.6 : 1,
            }}
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      )}

      {/* Checklist grouped by stage */}
      {grouped.map(({ stage, items }) => {
        const colors = stageBadgeColors[stage] ?? { bg: "#f3f4f6", text: "#374151" };
        return (
          <div key={stage} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span
                style={{
                  background: colors.bg,
                  color: colors.text,
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {stage}
              </span>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              {items.map((item, idx) => (
                <div
                  key={item.itemKey}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: idx < items.length - 1 ? "1px solid #f3f4f6" : undefined,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: statusDot[item.status] ?? "#9ca3af",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1, fontSize: 14 }}>{item.title}</span>
                  {item.isBlocking && (
                    <span
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      Blocking
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: item.status === "Complete" ? "#059669" : "#9ca3af",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {!data && !error && (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading…</div>
      )}
    </AdminShellLayout>
  );
}

const bannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: 10,
  padding: "12px 18px",
  marginBottom: 20,
};

const publishBtnStyle: React.CSSProperties = {
  background: "#ea580c",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 20px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const linkBtnStyle: React.CSSProperties = {
  background: "#f3f4f6",
  color: "#374151",
  padding: "6px 14px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
};

const errorBoxStyle: React.CSSProperties = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 10,
  padding: "14px 18px",
  marginBottom: 16,
  color: "#991b1b",
  fontSize: 14,
};
