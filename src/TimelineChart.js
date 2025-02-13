import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import './TimelineChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

function aggregateDataByDate(profile, data) {
    const aggregatedData = {};
    data.forEach(record => {
        const date = record[profile.contribution_fields.Transaction_Date].split(' ')[0];
        const amount = record[profile.contribution_fields.Amount];

        if (!aggregatedData[date]) {
            aggregatedData[date] = 0;
        }
        aggregatedData[date] += amount;
    });

    return Object.keys(aggregatedData).map(date => ({
        x: new Date(date),
        y: aggregatedData[date]
    })).sort((a, b) => a.x - b.x);
}

function TimelineChart({ profile, contribution_data }) {
    const aggregatedData = aggregateDataByDate(profile, contribution_data);

    const data = {
        datasets: [{
            label: 'Total Contributions ($)',
            data: aggregatedData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            pointStyle: false,
            fill: true
        }]
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
                    text: 'Total Amount ($)'
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
            <h1>Individual Donation Timeline</h1>
            <h4><i>Refers to all contribution data.</i></h4>
            <div className="timeline-chart-container">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}

export default TimelineChart;
