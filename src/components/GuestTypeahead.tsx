import { useEffect, useRef, useState } from 'react';
import { TextField, Autocomplete, CircularProgress, Box, Typography, Alert } from '@mui/material';
import { getAllGuests, type GuestSummary } from '@/db/idb';
import { useGuestSearch } from '@/hooks/useGuestSearch';

type Props = { onSelect(g: GuestSummary): void; onAddNew?: () => void; };

export default function GuestTypeahead({ onSelect, onAddNew }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<GuestSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [allGuests, setAllGuests] = useState<GuestSummary[] | null>(null);
  const search = useGuestSearch(allGuests as any);
  const debounceRef = useRef<number>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    getAllGuests().then(setAllGuests);
  }, []);

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setOptions([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setError(null);
      try {
        const res = await search(input, ctrl.signal);
        setOptions(res as GuestSummary[]);
      } catch {
        setOptions([]);
        setError('Failed to load guests');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      window.clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [input, search]);

  return (
    <>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(o) => (typeof o === 'string' ? o : o.name || '')}
        onInputChange={(_, v) => setInput(v)}
        onChange={(_, v) => {
          if (v && typeof v !== 'string') onSelect(v as any);
        }}
        loading={loading}
        filterOptions={(x) => x}
        loadingText="Loading..."
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search guest by name or phone"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, g) => (
          <Box component="li" {...props}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography fontWeight={600}>{g.name}</Typography>
              <Typography variant="caption">
                {[g.phone, g.email].filter(Boolean).join(' • ')}
              </Typography>
            </Box>
          </Box>
        )}
        ListboxProps={{ style: { maxHeight: 320 } }}
        noOptionsText={
          <Box sx={{ px: 2, py: 1 }}>
            <Typography>No guest found.</Typography>
            {onAddNew && (
              <Typography sx={{ color: 'primary.main', cursor: 'pointer' }} onClick={onAddNew}>
                + Add new guest
              </Typography>
            )}
          </Box>
        }
      />
      {error && !allGuests?.length && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </>
  );
}
