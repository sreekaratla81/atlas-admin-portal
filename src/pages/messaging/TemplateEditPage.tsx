import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Grid,
} from "@mui/material";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import VariableChipBar from "@/components/messaging/VariableChipBar";
import PreviewPanel from "@/components/messaging/PreviewPanel";
import ScheduleMessageModal from "@/components/messaging/ScheduleMessageModal";
import { getTemplate, createTemplate, updateTemplate } from "@/api/templatesApi";
import { getListings } from "@/api/listingsApi";
import type { Listing } from "@/api/listingsApi";
import type { MessageTemplateCreateUpdate, ScheduleRule } from "@/types/messaging";
import type { Channel } from "@/types/messaging";

const CHANNELS: Channel[] = ["SMS", "WhatsApp", "Email"];
const SMS_MAX_LENGTH = 160;

interface DuplicateFromState {
  name?: string;
  channel?: Channel;
  body?: string;
  subject?: string;
  eventType?: string;
  scopeType?: string;
  language?: string;
}

export default function TemplateEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = id === "new" || !id;
  const duplicateFrom = (location.state as { duplicateFrom?: DuplicateFromState })?.duplicateFrom;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Channel>("SMS");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [eventType, setEventType] = useState("booking.confirmed");
  const [scopeType, setScopeType] = useState("Global");
  const [language, setLanguage] = useState("en");
  const [isActive, setIsActive] = useState(true);
  const [selectedListingIds, setSelectedListingIds] = useState<number[]>([]);
  const [scheduleRule, setScheduleRule] = useState<ScheduleRule | null>(null);

  const bodyRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const listingList = await getListings().catch(() => []);
        if (cancelled) return;
        setListings(listingList);
        if (isNew) {
          if (duplicateFrom) {
            setName(duplicateFrom.name ?? "");
            setChannel(duplicateFrom.channel ?? "SMS");
            setBody(duplicateFrom.body ?? "");
            setSubject(duplicateFrom.subject ?? "");
            setEventType(duplicateFrom.eventType ?? "booking.confirmed");
            setScopeType(duplicateFrom.scopeType ?? "Global");
            setLanguage(duplicateFrom.language ?? "en");
          }
        } else {
          const t = await getTemplate(Number(id!));
          if (cancelled) return;
          if (t) {
            setName(t.name ?? t.templateKey ?? "");
            setChannel(t.channel);
            setBody(t.body);
            setSubject(t.subject ?? "");
            setEventType(t.eventType);
            setScopeType(t.scopeType);
            setLanguage(t.language);
            setIsActive(t.isActive);
          } else setError("Template not found.");
        }
      } catch {
        if (!cancelled) setError("Failed to load data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isNew, duplicateFrom]);

  const insertVariable = (variable: string) => {
    setBody((prev) => prev + variable);
    setTimeout(() => bodyRef.current?.focus(), 0);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Template name is required.");
      return;
    }
    if (channel === "SMS" && body.length > SMS_MAX_LENGTH) {
      setError(`SMS body must be ${SMS_MAX_LENGTH} characters or less.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: MessageTemplateCreateUpdate & { name?: string } = {
        templateKey: trimmedName,
        name: trimmedName,
        eventType,
        channel,
        scopeType,
        scopeId: null,
        language,
        templateVersion: 1,
        isActive,
        subject: channel === "Email" ? subject || undefined : undefined,
        body,
      };
      if (isNew) {
        await createTemplate(payload);
      } else {
        await updateTemplate(Number(id!), payload);
      }
      setError(null);
      navigate("/messaging/templates");
    } catch {
      setError("Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this template?")) return;
    navigate("/messaging/templates");
  };

  if (loading) {
    return (
      <AdminShellLayout title={isNew ? "New template" : "Edit template"}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </AdminShellLayout>
    );
  }

  return (
    <AdminShellLayout title={isNew ? "New template" : "Edit template"}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    label="Template name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="small"
                    sx={{ flex: "1 1 200px" }}
                  />
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Channel</InputLabel>
                    <Select
                      value={channel}
                      label="Channel"
                      onChange={(e) => setChannel(e.target.value as Channel)}
                    >
                      {CHANNELS.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                {channel === "Email" && (
                  <TextField
                    label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    size="small"
                    fullWidth
                  />
                )}
                <Box>
                  <VariableChipBar onInsert={insertVariable} />
                  <TextField
                    inputRef={bodyRef}
                    label="Message"
                    required
                    multiline
                    minRows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    helperText={
                      channel === "SMS"
                        ? `${body.length} / ${SMS_MAX_LENGTH} characters`
                        : undefined
                    }
                    error={channel === "SMS" && body.length > SMS_MAX_LENGTH}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? <CircularProgress size={24} /> : "Save"}
                  </Button>
                  {!isNew && (
                    <Button color="error" onClick={handleDelete}>
                      Delete template
                    </Button>
                  )}
                  <Button onClick={() => navigate("/messaging/templates")}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <PreviewPanel
              listingOptions={listings}
              selectedListingIds={selectedListingIds}
              onListingChange={setSelectedListingIds}
              scheduleRule={scheduleRule}
              onScheduleClick={() => setScheduleModalOpen(true)}
            />
          </Grid>
        </Grid>
      </Box>
      <ScheduleMessageModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        value={scheduleRule}
        onApply={setScheduleRule}
      />
    </AdminShellLayout>
  );
}
