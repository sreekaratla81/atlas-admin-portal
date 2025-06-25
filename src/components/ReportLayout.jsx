import React from 'react';
import { Box, Typography, Button, TextField, Autocomplete, CircularProgress, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function ReportLayout({
  title,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  listings = [],
  listingValue,
  setListingValue,
  multiple = false,
  onExportCSV,
  onExportPDF,
  loading = false,
  error = '',
  children
}) {
  return (
    <Box sx={{ padding: 4 }}>
      {title && (
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {startDate && setStartDate && (
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            renderInput={(params) => <TextField {...params} />}
          />
        )}
        {endDate && setEndDate && (
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            renderInput={(params) => <TextField {...params} />}
          />
        )}
        {Array.isArray(listings) && setListingValue && (
          <Autocomplete
            sx={{ minWidth: 200 }}
            options={listings}
            multiple={multiple}
            getOptionLabel={(opt) => opt.name || opt.label || ''}
            value={listingValue}
            onChange={(e, val) => setListingValue(val)}
            renderInput={(params) => <TextField {...params} label="Listing" />}
          />
        )}
        {onExportPDF && (
          <Button variant="contained" onClick={onExportPDF}>Export PDF</Button>
        )}
        {onExportCSV && (
          <Button variant="outlined" onClick={onExportCSV}>Export CSV</Button>
        )}
      </Box>
      {loading && <CircularProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {children}
    </Box>
  );
}

export default ReportLayout;
