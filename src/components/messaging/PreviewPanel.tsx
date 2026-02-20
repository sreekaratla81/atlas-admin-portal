import { Box, Paper, Typography, Button } from "@mui/material";
import ListingMultiSelect from "./ListingMultiSelect";
import { formatScheduleSummary } from "@/constants/scheduleOptions";
import type { ScheduleRule } from "@/types/messaging";
import type { Listing } from "@/api/listingsApi";

interface PreviewPanelProps {
  listingOptions: Listing[];
  selectedListingIds: number[];
  onListingChange: (ids: number[]) => void;
  scheduleRule: ScheduleRule | null;
  onScheduleClick: () => void;
  disabled?: boolean;
}

export default function PreviewPanel({
  listingOptions,
  selectedListingIds,
  onListingChange,
  scheduleRule,
  onScheduleClick,
  disabled,
}: PreviewPanelProps) {
  const scheduleSummary = scheduleRule
    ? formatScheduleSummary(
        scheduleRule.scheduleType,
        scheduleRule.offsetMinutes,
        scheduleRule.sendTimeLocal
      )
    : "Not scheduled";

  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Review template
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <ListingMultiSelect
          listings={listingOptions}
          selectedIds={selectedListingIds}
          onChange={onListingChange}
          label="Choose listings"
          disabled={disabled}
        />
        <Box>
          <Typography variant="caption" color="text.secondary">
            Scheduled for
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.25 }}>
            {scheduleSummary}
          </Typography>
          <Button
            size="small"
            onClick={onScheduleClick}
            disabled={disabled}
            sx={{ mt: 0.5 }}
          >
            Schedule message
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
