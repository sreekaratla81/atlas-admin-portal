import React from 'react';
import EarningsReport from '../components/EarningsReport';
import DailyPayoutReport from '../components/DailyPayoutReport';
import MonthlyEarningsReport from '../components/MonthlyEarningsReport';
import CustomReportGenerator from '../components/CustomReportGenerator';
import SingleCalendarEarningsReport from '../components/SingleCalendarEarningsReport';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import MultiCalendarEarningsReport from '../components/MultiCalendarEarningsReport';
import { Stack } from '@mui/material';

const Reports = () => {
    return (
        <div>
            <h1>Reports Page</h1>
            <Stack spacing={2}>
                <EarningsReport />
                <DailyPayoutReport />
                <MonthlyEarningsReport />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack spacing={2}>
                        <CustomReportGenerator />
                        <SingleCalendarEarningsReport />
                        <MultiCalendarEarningsReport/>
                    </Stack>
                </LocalizationProvider>
            </Stack>
        </div>
    );
};

export default Reports;
