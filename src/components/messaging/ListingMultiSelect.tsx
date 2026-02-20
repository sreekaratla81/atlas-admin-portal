import { FormControl, InputLabel, Select, MenuItem, Chip, Box, OutlinedInput, SelectChangeEvent } from "@mui/material";
import type { Listing } from "@/api/listingsApi";

interface ListingMultiSelectProps {
  listings: Listing[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  label?: string;
  disabled?: boolean;
}

export default function ListingMultiSelect({
  listings,
  selectedIds,
  onChange,
  label = "Listings",
  disabled,
}: ListingMultiSelectProps) {
  const handleChange = (e: SelectChangeEvent<number[]>) => {
    const value = e.target.value;
    onChange(Array.isArray(value) ? value : [value]);
  };

  const selectedListings = listings.filter((l) => selectedIds.includes(l.id));

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel id="listing-select-label">{label}</InputLabel>
      <Select
        labelId="listing-select-label"
        multiple
        value={selectedIds}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(ids) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {ids.length === 0
              ? "None selected"
              : ids.length === listings.length
                ? "All listings"
                : `${ids.length} selected`}
          </Box>
        )}
      >
        {listings.map((listing) => (
          <MenuItem key={listing.id} value={listing.id}>
            {listing.name}
          </MenuItem>
        ))}
      </Select>
      {selectedListings.length > 0 && selectedListings.length < listings.length && (
        <Box sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {selectedListings.map((l) => (
            <Chip
              key={l.id}
              label={l.name}
              size="small"
              onDelete={() => onChange(selectedIds.filter((id) => id !== l.id))}
            />
          ))}
        </Box>
      )}
    </FormControl>
  );
}
