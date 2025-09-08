import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useGuestSearch, type Guest } from '@/hooks/useGuestSearch';

type Props = {
  allGuests?: Guest[];
  /**
   * Currently selected guest.  When provided the component becomes
   * controlled by the parent so it can update the displayed value when a new
   * guest is created outside of the Autocomplete.
   */
  value?: Guest | null;
  onSelect: (g: Guest | null) => void;
  /**
   * Called when the user wants to create a guest that doesn't exist yet.
   */
  onAddNew?: () => void;
};

type GuestOption = Guest | { id: string; name: string; isAddNew: true };

export default function GuestTypeahead({
  allGuests = [],
  value: selectedGuest = null,
  onSelect,
  onAddNew,
}: Props) {
  const search = useGuestSearch(allGuests);
  const [value, setValue] = React.useState<Guest | null>(selectedGuest);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<Guest[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Keep internal state in sync with the value passed in by the parent.  This
  // allows consumers to programmatically set the selected guest (e.g. after
  // creating a new guest via a modal).
  React.useEffect(() => {
    setValue(selectedGuest);
  }, [selectedGuest]);

  const debouncedText = useDebouncedValue(inputValue, 300);

  React.useEffect(() => {
    let alive = true;
    const run = async () => {
      const q = debouncedText.trim();
      if (!q) {
        if (alive) {
          // When the query is cleared keep the selected value in the options
          // list so that MUI's Autocomplete doesn't complain about the value
          // not matching any option.
          setOptions(value ? [value] : []);
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
  }, [debouncedText, search, value]);

  const showAddNew =
    !!onAddNew && !loading && debouncedText.trim() !== '' && options.length === 0;
  const displayOptions: GuestOption[] = showAddNew
    ? [{ id: 'add-new', name: 'Add new guest', isAddNew: true }]
    : options;

  return (
    <Autocomplete
      options={displayOptions}
      loading={loading}
      value={value}
      isOptionEqualToValue={(option, val) => option.id === val?.id}
      onChange={(_, newVal) => {
        if (newVal && (newVal as any).isAddNew) {
          onAddNew?.();
          return;
        }
        setValue(newVal as Guest | null);
        onSelect((newVal as Guest) ?? null);
      }}
      inputValue={inputValue}
      onInputChange={(_, newInput, reason) => {
        setInputValue(prev => (prev === newInput ? prev : newInput));
        // If the user types a new value, clear the current selection so we
        // don't end up with a value that doesn't exist in the options array
        // which triggers console warnings from MUI's Autocomplete.
        if (reason === 'input') {
          setValue(null);
          onSelect(null);
        }
        if (newInput === '') {
          setValue(null);
          onSelect(null);
        }
      }}
      getOptionLabel={o => o?.name ?? ''}
      filterOptions={x => x}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option.name}
        </li>
      )}
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
