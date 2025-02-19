import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import './TimelineChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

function aggregateCumulativeData(profile, data) {
    const aggregatedData = [];
    let cumulativeTotal = 0;

    const sortedData = data.map(record => ({
        date: new Date(record[profile.contribution_fields.Transaction_Date].split(' ')[0]),
        amount: record[profile.contribution_fields.Amount]
    })).sort((a, b) => a.date - b.date);

    sortedData.forEach(entry => {
        cumulativeTotal += entry.amount;
        aggregatedData.push({ x: entry.date, y: cumulativeTotal });
    });

    return aggregatedData;
}

function TimelineChart({ profile, contribution_data, expenditure_data }) {
    const cumulativeContributions = aggregateCumulativeData(profile, contribution_data);
    const cumulativeExpenditures = aggregateCumulativeData(profile, expenditure_data);

    const data = {
        datasets: [
            {
                label: 'Cumulative Contributions ($)',
                data: cumulativeContributions,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                pointStyle: false,
                fill: true
            },
            {
                label: 'Cumulative Expenditures ($)',
                data: cumulativeExpenditures,
                backgroundColor: 'rgba(192, 75, 75, 0.2)',
                borderColor: 'rgba(192, 75, 75, 1)',
                borderWidth: 1,
                pointStyle: false,
                fill: true
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month'
                },
                title: {
                    display: true,
                    text: 'Transaction Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Cumulative Amount ($)'
                }
            }
        },
        plugins: {
            legend: {
                display: true
            }
        }
    };

    return (
        <div className='section' id="timeline">
            <h1>Cumulative Contributions vs Cumulative Expenditures</h1>
            <h4><i>Tracking cumulative totals over time.</i></h4>
            <div className="timeline-chart-container">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}

export default TimelineChart;
