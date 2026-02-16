import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";
import { SCHEDULE_OPTIONS, formatScheduleSummary } from "@/constants/scheduleOptions";
import type { ScheduleRule, ScheduleType } from "@/types/messaging";

interface ScheduleMessageModalProps {
  open: boolean;
  onClose: () => void;
  value: ScheduleRule | null;
  onApply: (rule: ScheduleRule) => void;
}

export default function ScheduleMessageModal({
  open,
  onClose,
  value,
  onApply,
}: ScheduleMessageModalProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>(value?.scheduleType ?? "none");
  const [offsetMinutes, setOffsetMinutes] = useState(value?.offsetMinutes ?? 5);
  const [sendTimeLocal, setSendTimeLocal] = useState(value?.sendTimeLocal ?? "10:00");
  const [isEnabled, setIsEnabled] = useState(value?.isEnabled ?? true);

  useEffect(() => {
    if (open && value) {
      setScheduleType(value.scheduleType);
      setOffsetMinutes(value.offsetMinutes);
      setSendTimeLocal(value.sendTimeLocal ?? "10:00");
      setIsEnabled(value.isEnabled);
    }
  }, [open, value]);

  const selectedOption = SCHEDULE_OPTIONS.find((o) => o.value === scheduleType);

  const handleApply = () => {
    const rule: ScheduleRule = {
      scheduleType,
      offsetMinutes: scheduleType === "after_booking" ? Math.abs(offsetMinutes) : offsetMinutes,
      sendTimeLocal: scheduleType !== "none" && scheduleType !== "after_booking" ? sendTimeLocal : undefined,
      timezoneSource: "listing",
      isEnabled,
    };
    onApply(rule);
    onClose();
  };

  const summary = formatScheduleSummary(scheduleType, offsetMinutes, sendTimeLocal);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule message</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" fullWidth sx={{ mt: 1 }}>
          <RadioGroup
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
          >
            {SCHEDULE_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio />}
                label={opt.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
        {scheduleType === "custom" && (
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Offset (minutes)"
              type="number"
              value={offsetMinutes}
              onChange={(e) => setOffsetMinutes(Number(e.target.value))}
              helperText="Negative = before, positive = after"
              size="small"
            />
            <TextField
              label="Send time (local)"
              placeholder="HH:mm"
              value={sendTimeLocal}
              onChange={(e) => setSendTimeLocal(e.target.value)}
              size="small"
              inputProps={{ maxLength: 5 }}
            />
          </Box>
        )}
        {scheduleType === "after_booking" && selectedOption?.defaultOffsetMinutes != null && (
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Minutes after booking"
              type="number"
              value={offsetMinutes}
              onChange={(e) => setOffsetMinutes(Math.max(0, Number(e.target.value)))}
              size="small"
              inputProps={{ min: 0 }}
            />
          </Box>
        )}
        {(scheduleType === "before_checkin" || scheduleType === "before_checkout") && (
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Time (listing timezone)"
              placeholder="HH:mm"
              value={sendTimeLocal}
              onChange={(e) => setSendTimeLocal(e.target.value)}
              size="small"
            />
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <strong>Preview:</strong> {summary}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleApply}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
