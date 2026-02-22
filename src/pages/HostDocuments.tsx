import React, { useEffect, useRef, useState } from "react";
import { Alert } from "@mui/material";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import { api } from "@/lib/api";

const DOC_TYPES = [
  "PAN",
  "Aadhaar",
  "LeaseAgreement",
  "OwnerNOC",
  "TourismReg",
  "FireNOC",
] as const;

type DocType = (typeof DOC_TYPES)[number];

interface ChecklistItem {
  itemKey: string;
  title: string;
  stage: string;
  status: string;
}

export default function HostDocuments() {
  const [documents, setDocuments] = useState<ChecklistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocType>("PAN");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadDocuments = () => {
    api
      .get("/onboarding/status")
      .then((res) => {
        const items: ChecklistItem[] = res.data?.checklist ?? [];
        setDocuments(items.filter((i) => i.stage === "PublishGate" || i.itemKey?.startsWith("Doc_")));
      })
      .catch(() => setError("Failed to load documents."));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setToast({ type: "error", msg: "Please select a file." });
      return;
    }

    setUploading(true);
    setToast(null);
    const formData = new FormData();
    formData.append("documentType", docType);
    formData.append("file", file);

    try {
      await api.post("/onboarding/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({ type: "success", msg: `${docType} uploaded successfully.` });
      if (fileRef.current) fileRef.current.value = "";
      loadDocuments();
    } catch (err: any) {
      setToast({ type: "error", msg: err.response?.data?.message || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminShellLayout title="Host Documents">
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {toast && (
        <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ mb: 2 }}>
          {toast.msg}
        </Alert>
      )}

      {/* Upload form */}
      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Upload Document</h3>
        <form onSubmit={handleUpload} style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Document Type</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value as DocType)} style={inputStyle}>
              {DOC_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>File</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ fontSize: 14 }}
              required
            />
          </div>

          <button type="submit" disabled={uploading} style={{ ...uploadBtnStyle, opacity: uploading ? 0.6 : 1 }}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </div>

      {/* Document list */}
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Document Checklist</h3>
        {documents.length === 0 ? (
          <div style={{ color: "#9ca3af", padding: 16, textAlign: "center" }}>No document items found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={th}>Item</th>
                <th style={th}>Stage</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.itemKey}>
                  <td style={td}>{doc.title}</td>
                  <td style={td}>
                    <span style={stageBadge}>{doc.stage}</span>
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        color: doc.status === "Complete" ? "#059669" : "#d97706",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShellLayout>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  padding: 20,
};

const fieldWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
};

const uploadBtnStyle: React.CSSProperties = {
  background: "#ea580c",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "9px 20px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

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
  borderBottom: "1px solid #f3f4f6",
};

const stageBadge: React.CSSProperties = {
  background: "#f3f4f6",
  color: "#374151",
  padding: "2px 8px",
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 600,
};
