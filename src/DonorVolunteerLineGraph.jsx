import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './DonorVolunteerLineGraph.css';

const DonorVolunteerLineGraph = ({ expenditure_data }) => {
    const filterAndAggregate = (keyword) => {
        const records = expenditure_data.filter(record =>
            !record.Category?.toLowerCase().includes('contract labor') &&
            (record.Category?.toLowerCase().includes(keyword) ||
             record.Description?.toLowerCase().includes(keyword))
        );

        const dailyRecordsMap = new Map();
        let cumulativeSum = 0;

        records.sort((a, b) => new Date(a.Transaction_Date) - new Date(b.Transaction_Date));

        records.forEach(record => {
            const date = record.Transaction_Date;
            if (!dailyRecordsMap.has(date)) dailyRecordsMap.set(date, []);
            dailyRecordsMap.get(date).push(record);
        });

        const cumulativeData = Array.from(dailyRecordsMap.entries()).map(([date, records]) => {
            const dailySum = records.reduce((sum, record) => sum + record.Amount, 0);
            cumulativeSum += dailySum;
            return { date, cumulativeSum, records };
        });

        return cumulativeData;
    };

    const donorData = filterAndAggregate('donor');
    const volunteerData = filterAndAggregate('volunteer');

    const dateRecordMap = new Map();

    donorData.forEach(item => dateRecordMap.set(item.date, { ...dateRecordMap.get(item.date), donor: item }));
    volunteerData.forEach(item => dateRecordMap.set(item.date, { ...dateRecordMap.get(item.date), volunteer: item }));

    const allDates = Array.from(dateRecordMap.keys()).sort((a, b) => new Date(a) - new Date(b));

    const chartData = {
        labels: allDates,
        datasets: [
            {
                label: 'Cumulative Donor Amount',
                data: allDates.map(date => dateRecordMap.get(date)?.donor?.cumulativeSum || null),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1
            },
            {
                label: 'Cumulative Volunteer Amount',
                data: allDates.map(date => dateRecordMap.get(date)?.volunteer?.cumulativeSum || null),
                fill: false,
                borderColor: 'rgba(255,99,132,1)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        spanGaps: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const date = allDates[context.dataIndex];
                        const recordType = context.dataset.label.includes('Donor') ? 'donor' : 'volunteer';
                        const records = dateRecordMap.get(date)?.[recordType]?.records || [];
                        return records.map(r => `${r.Name} ($${r.Amount}) ${r.Category} - ${r.Description}`);
                    }
                }
            }
        }
    };

    return (
        <div className='section' id="donor-volunteer-line-container">
            <h2>Donor vs Volunteer Spending</h2>
            <div id="donor-volunteer-line-wrapper">
                <Line data={chartData} options={options} />
            </div>
        </div>
        );};

export default DonorVolunteerLineGraph;
