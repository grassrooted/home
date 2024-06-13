import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

// Function to aggregate data by date
function aggregateDataByDate(data) {
    const aggregatedData = {};
    console.log(data)
    data.forEach(record => {
        const date = record["Transaction Date:"].split(' ')[0]; // Extract the date part only
        const amount = record["Amount:"];

        if (!aggregatedData[date]) {
            aggregatedData[date] = 0;
        }
        aggregatedData[date] += amount;
    });

    // Convert the aggregated data object into an array and sort it by date
    return Object.keys(aggregatedData).map(date => ({
        x: new Date(date),
        y: aggregatedData[date]
    })).sort((a, b) => a.x - b.x);
}

function TimelineChart(contribution_data) {
    // Aggregate the data by date
    const aggregatedData = aggregateDataByDate(contribution_data.contribution_data);

  const data = {
    datasets: [{
        label: 'Total Contributions',
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
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'day'
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

  return <Line data={data} options={options} />;
};

export default TimelineChart;
