import React from 'react';
import EarningsReport from '../components/EarningsReport';
import DailyPayoutReport from '../components/DailyPayoutReport';
import MonthlyEarningsReport from '../components/MonthlyEarningsReport';
import CustomReportGenerator from '../components/CustomReportGenerator';
import SingleCalendarEarningsReport from '../components/SingleCalendarEarningsReport';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import MultiCalendarEarningsReport from '../components/MultiCalendarEarningsReport';

const Reports = () => {
    return (
        <div>
            <h1>Reports Page</h1>
            <section style={{ marginBottom: '2rem' }}>
                <SingleCalendarEarningsReport />
            </section>
            <section style={{ marginBottom: '2rem' }}>
                <EarningsReport />
            </section>
            {
                /*            <section style={{ marginBottom: '2rem' }}>
                    <MultiCalendarEarningsReport />
                </section>
                <section style={{ marginBottom: '2rem' }}>
                    <DailyPayoutReport />
                </section>
                <section style={{ marginBottom: '2rem' }}>
                    <MonthlyEarningsReport />
                </section>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <section style={{ marginBottom: '2rem' }}>
                        <CustomReportGenerator />
                    </section>
                </LocalizationProvider>
                */
            }
        </div>
    );
};

export default Reports;
