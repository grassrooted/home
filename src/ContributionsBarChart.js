import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './ContributionBarChart.css'

// Register necessary components with Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ContributionsBarChart({ profile, selectedDateRange, contribution_data }) {
    const filterDataByDate = (data, dateRange) => {
        const { start, end } = dateRange;

        return data.filter(record => {
            const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
            return transactionDate >= start && transactionDate <= end;
        });
    };

    const filteredData = filterDataByDate(contribution_data, selectedDateRange);

    // Initialize the buckets for amount ranges
    const step = 100;
    const num_buckets = Math.ceil(profile.individual_limit / step);
    const buckets = Array(num_buckets + 1).fill(0);

    // Process the filtered contribution data to fill the buckets
    filteredData.forEach(record => {
        const amount = record[profile.contribution_fields.Amount];
        if (amount >= profile.individual_limit) {
            buckets[num_buckets]++; // Final bucket for 1000+
        } else {
            const index = Math.floor(amount / step);
            buckets[index]++;
        }
    });

    // Prepare data for the bar chart
    const data = {
        labels: [
            ...Array.from({ length: num_buckets }, (_, i) => `$${i * step} - $${(i + 1) * step - 1}`),
            `${profile.individual_limit}+` // Final bucket label
        ],
        datasets: [
            {
                label: '# of Records',
                data: buckets,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Individual Contributions'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Amount Categories'
                }
            },
        }
    };

    return (
        <div className='section' id="contributions-chart-section">
            <h1>Funding Breakdown</h1>
            <h4><i>Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i></h4>
            <div className="chart-container">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}

export default ContributionsBarChart;
