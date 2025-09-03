import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useGuestSearch, type Guest } from '@/hooks/useGuestSearch';

type Props = {
  allGuests?: Guest[];
  onSelect: (g: Guest | null) => void;
};

export default function GuestTypeahead({ allGuests = [], onSelect }: Props) {
  const search = useGuestSearch(allGuests);
  const [value, setValue] = React.useState<Guest | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<Guest[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const debouncedText = useDebouncedValue(inputValue, 300);

  React.useEffect(() => {
    let alive = true;
    const run = async () => {
      const q = debouncedText.trim();
      if (!q) {
        if (alive) {
          setOptions([]);
          setError(null);
        }
        return;
      }
      setLoading(true);
      try {
        const res = await search(q);
        if (alive) {
          setOptions(res);
          setError(null);
        }
      } catch (err) {
        console.error('Guest search failed', err);
        if (alive) {
          setError('Failed to load guest results');
          setOptions([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [debouncedText, search]);

  return (
    <Autocomplete
      options={options}
      loading={loading}
      value={value}
      onChange={(_, newVal) => {
        setValue(newVal);
        onSelect(newVal ?? null);
      }}
      inputValue={inputValue}
      onInputChange={(_, newInput) => {
        setInputValue(prev => (prev === newInput ? prev : newInput));
      }}
      getOptionLabel={o => o?.name ?? ''}
      filterOptions={x => x}
      renderInput={params => (
        <TextField
          {...params}
          label="Guest"
          placeholder="Type name/phone/email"
          error={!!error}
          helperText={error}
        />
      )}
    />
  );
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
