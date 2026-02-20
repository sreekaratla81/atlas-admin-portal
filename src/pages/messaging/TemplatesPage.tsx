import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  IconButton,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import { getTemplates, deleteTemplate, updateTemplate } from "@/api/templatesApi";
import type { MessageTemplate } from "@/types/messaging";
import { mockTemplates } from "@/mocks/templates";

type ChannelFilter = "" | "SMS" | "WhatsApp" | "Email";
type StatusFilter = "" | "active" | "inactive";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { channel?: string; isActive?: boolean } = {};
      if (channelFilter) params.channel = channelFilter;
      if (statusFilter === "active") params.isActive = true;
      if (statusFilter === "inactive") params.isActive = false;
      const data = await getTemplates(params);
      setTemplates(data);
    } catch {
      setError("Failed to load templates. Showing mock data.");
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchTemplates recreated each render; mount + filter change
  }, [channelFilter, statusFilter]);

  const handleDuplicate = (t: MessageTemplate) => {
    navigate("/messaging/templates/new", {
      state: {
        duplicateFrom: {
          name: (t.name || t.templateKey) + " (copy)",
          channel: t.channel,
          body: t.body,
          subject: t.subject,
          eventType: t.eventType,
          scopeType: t.scopeType,
          language: t.language,
        },
      },
    });
  };

  const handleToggleActive = async (t: MessageTemplate) => {
    try {
      await updateTemplate(t.id, {
        templateKey: t.templateKey,
        eventType: t.eventType,
        channel: t.channel,
        scopeType: t.scopeType,
        scopeId: t.scopeId,
        language: t.language,
        templateVersion: t.templateVersion,
        isActive: !t.isActive,
        subject: t.subject,
        body: t.body,
      });
      fetchTemplates();
    } catch {
      setError("Failed to update template.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete template "${name}"?`)) return;
    try {
      await deleteTemplate(id);
      fetchTemplates();
    } catch {
      setError("Failed to delete template.");
    }
  };

  return (
    <AdminShellLayout title="Message templates">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Channel</InputLabel>
            <Select
              value={channelFilter}
              label="Channel"
              onChange={(e) => setChannelFilter(e.target.value as ChannelFilter)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="SMS">SMS</MenuItem>
              <MenuItem value="WhatsApp">WhatsApp</MenuItem>
              <MenuItem value="Email">Email</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Enabled</MenuItem>
              <MenuItem value="inactive">Disabled</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/messaging/templates/new")}
          >
            New template
          </Button>
        </Box>
        {error && <Alert severity="info" onClose={() => setError(null)}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Event type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">No templates found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{(t.name || t.templateKey) || t.eventType}</TableCell>
                      <TableCell>
                        <Chip label={t.channel} size="small" />
                      </TableCell>
                      <TableCell>{t.eventType}</TableCell>
                      <TableCell>
                        <Chip
                          label={t.isActive ? "Enabled" : "Disabled"}
                          size="small"
                          color={t.isActive ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label="Edit"
                          onClick={() => navigate(`/messaging/templates/${t.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Duplicate"
                          onClick={() => handleDuplicate(t)}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                        <Button
                          size="small"
                          onClick={() => handleToggleActive(t)}
                        >
                          {t.isActive ? "Disable" : "Enable"}
                        </Button>
                        <IconButton
                          size="small"
                          aria-label="Delete"
                          onClick={() => handleDelete(t.id, (t.name || t.templateKey) || t.eventType)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </AdminShellLayout>
  );
}
