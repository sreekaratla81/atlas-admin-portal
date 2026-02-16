import { Box, Typography, Paper } from "@mui/material";
import AdminShellLayout from "@/components/layout/AdminShellLayout";

export default function MessagesPage() {
  return (
    <AdminShellLayout title="Messages">
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Template runs and scheduled items will appear here once the API is connected.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This page is a stub for the messaging dashboard (scheduled sends, delivery status).
        </Typography>
      </Paper>
    </AdminShellLayout>
  );
}
