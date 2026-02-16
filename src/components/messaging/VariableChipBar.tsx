import { Chip, Stack, Typography } from "@mui/material";
import { TEMPLATE_VARIABLES } from "@/types/messaging";

interface VariableChipBarProps {
  onInsert: (variable: string) => void;
  disabled?: boolean;
}

export default function VariableChipBar({ onInsert, disabled }: VariableChipBarProps) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center" useFlexGap>
      <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
        Insert:
      </Typography>
      {TEMPLATE_VARIABLES.map(({ key }) => (
        <Chip
          key={key}
          label={`{${key}}`}
          size="small"
          onClick={() => onInsert(`{${key}}`)}
          disabled={disabled}
          sx={{ fontFamily: "monospace" }}
        />
      ))}
    </Stack>
  );
}
