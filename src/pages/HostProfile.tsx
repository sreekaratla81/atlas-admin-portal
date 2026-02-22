import React, { useState } from "react";
import { Alert } from "@mui/material";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import { api } from "@/lib/api";

const BUSINESS_TYPES = [
  "Individual",
  "Proprietorship",
  "Partnership",
  "PvtLtd",
  "LLP",
  "Trust",
] as const;

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

type FormFields = {
  legalName: string;
  displayName: string;
  businessType: string;
  registeredAddressLine: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  gstin: string;
  placeOfSupplyState: string;
  primaryEmail: string;
  primaryPhone: string;
};

const emptyForm: FormFields = {
  legalName: "",
  displayName: "",
  businessType: "Individual",
  registeredAddressLine: "",
  city: "",
  state: "",
  pincode: "",
  pan: "",
  gstin: "",
  placeOfSupplyState: "",
  primaryEmail: "",
  primaryPhone: "",
};

export default function HostProfile() {
  const [form, setForm] = useState<FormFields>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [panError, setPanError] = useState<string | null>(null);

  const set = (field: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (field === "pan") {
      setPanError(val && !PAN_REGEX.test(val.toUpperCase()) ? "PAN must match ABCDE1234F format" : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pan && !PAN_REGEX.test(form.pan.toUpperCase())) {
      setPanError("PAN must match ABCDE1234F format");
      return;
    }
    setSaving(true);
    setToast(null);
    try {
      await api.put("/onboarding/profile", {
        ...form,
        pan: form.pan.toUpperCase(),
      });
      setToast({ type: "success", msg: "Profile saved successfully." });
    } catch (err: any) {
      setToast({ type: "error", msg: err.response?.data?.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShellLayout title="Host Profile">
      {toast && (
        <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ mb: 2 }}>
          {toast.msg}
        </Alert>
      )}

      <form onSubmit={handleSubmit} style={formCard}>
        <div style={gridStyle}>
          <Field label="Legal Name" value={form.legalName} onChange={set("legalName")} required />
          <Field label="Display Name" value={form.displayName} onChange={set("displayName")} required />

          <div style={fieldWrap}>
            <label style={labelStyle}>
              Business Type <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select value={form.businessType} onChange={set("businessType")} style={inputStyle} required>
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>

          <Field label="Registered Address" value={form.registeredAddressLine} onChange={set("registeredAddressLine")} />
          <Field label="City" value={form.city} onChange={set("city")} />
          <Field label="State" value={form.state} onChange={set("state")} />
          <Field label="Pincode" value={form.pincode} onChange={set("pincode")} />

          <div style={fieldWrap}>
            <label style={labelStyle}>PAN</label>
            <input
              value={form.pan}
              onChange={set("pan")}
              style={{ ...inputStyle, borderColor: panError ? "#ef4444" : undefined }}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
            {panError && <span style={{ color: "#ef4444", fontSize: 12 }}>{panError}</span>}
          </div>

          <Field label="GSTIN" value={form.gstin} onChange={set("gstin")} placeholder="22AAAAA0000A1Z5" />
          <Field label="Place of Supply State" value={form.placeOfSupplyState} onChange={set("placeOfSupplyState")} />
          <Field label="Primary Email" value={form.primaryEmail} onChange={set("primaryEmail")} type="email" required />
          <Field label="Primary Phone" value={form.primaryPhone} onChange={set("primaryPhone")} type="tel" required />
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <button type="submit" disabled={saving} style={{ ...saveBtnStyle, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </form>
    </AdminShellLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

const formCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  padding: 24,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
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
  outline: "none",
};

const saveBtnStyle: React.CSSProperties = {
  background: "#ea580c",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "9px 22px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
