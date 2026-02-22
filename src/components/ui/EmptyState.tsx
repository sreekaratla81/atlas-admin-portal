import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({ 
  title = "No data",
  message = "There are no items to display."
}: EmptyStateProps) {
  return (
    <Box textAlign="center" py={6}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
