import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Button } from '@mui/material';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import useGuestSearch from '../hooks/useGuestSearch';
import { GuestListItem } from '../api/guests';

type Props = {
  onSelect: (guest: GuestListItem) => void;
  onAddNew: () => void;
  value?: string;
};

const GuestAutocomplete: React.FC<Props> = ({ onSelect, onAddNew, value = '' }) => {
  const [input, setInput] = useState(value);
  useEffect(() => {
    setInput(value);
  }, [value]);
  const { results, isLoading, isError, refetch } = useGuestSearch(input);

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    try {
      return parsePhoneNumberFromString(phone, 'IN')?.formatInternational() || phone;
    } catch {
      return phone;
    }
  };

  return (
    <Autocomplete<GuestListItem>
      freeSolo
      options={results}
      getOptionLabel={(o) => o.name}
      filterOptions={(x) => x}
      onChange={(_e, val) => { if (val) onSelect(val); }}
      inputValue={input}
      onInputChange={(_e, val) => setInput(val)}
      loading={isLoading}
      noOptionsText={
        isError ? (
          <Box sx={{ p: 1 }}>
            <Typography color="error" variant="body2">Error loading</Typography>
            <Button onMouseDown={(e)=>{e.preventDefault(); refetch();}}>Retry</Button>
            <Button onMouseDown={(e)=>{e.preventDefault(); onAddNew();}}>+ Add new guest</Button>
          </Box>
        ) : (
          <Box sx={{ p: 1 }}>
            <Typography variant="body2">No results</Typography>
            <Button onMouseDown={(e)=>{e.preventDefault(); onAddNew();}}>+ Add new guest</Button>
          </Box>
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search or Add Guest"
          role="combobox"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const q = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${q})`, 'ig');
        const nameParts = option.name.split(regex);
        return (
          <li {...props} key={option.id}>
            <span>
              {nameParts.map((part, i) =>
                regex.test(part) ? <mark key={i}>{part}</mark> : part
              )}
              {option.phone && <> • {formatPhone(option.phone)}</>}
              {option.email && <> • {option.email}</>}
            </span>
          </li>
        );
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && results.length > 0) {
          e.preventDefault();
          onSelect(results[0]);
        }
      }}
    />
  );
};

export default GuestAutocomplete;
