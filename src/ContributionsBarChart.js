import React, {useState} from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components with Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ContributionsBarChart({profile, dateRanges, contribution_data}) {
    const [selectedDateRange, setSelectedDateRange] = useState('all');

    const handleDateRangeChange = (event) => {
      setSelectedDateRange(event.target.value);
    };
  
    const filterDataByDate = (data, dateRange) => {
      if (dateRange === 'all') {
        return data;
      }
  
      const dateRanges = {
        '2017-2019': [new Date('2017-05-05'), new Date('2019-05-04')],
        '2019-2021': [new Date('2019-05-05'), new Date('2021-05-04')],
        '2021-2023': [new Date('2021-05-05'), new Date('2023-05-04')],
        '2023-2025': [new Date('2023-05-05'), new Date('2025-05-04')],
      };
  
      const [startDate, endDate] = dateRanges[dateRange];
      return data.filter(record => {
        const transactionDate = new Date(record[profile.contributions_fields.Transaction_Date]);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    };
  
    const filteredData = filterDataByDate(contribution_data, selectedDateRange);
  
    // Initialize the buckets for amount ranges
    const buckets = Array(11).fill(0);
  
    // Process the contribution_data to fill the buckets
    filteredData.forEach(record => {
      const amount = record[profile.contribution_fields.Amount];
      if (amount <= 1000) {
        const index = Math.floor(amount / 100);
        buckets[index]++;
      }
    });

    // Prepare data for the bar chart
    const data = {
        labels: Array.from({ length: 11 }, (_, i) => `${i * 100} - ${(i + 1) * 100}`),
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
        <div id="contributions-chart-section">
            <h1>Individual Contributions Breakdown</h1>
            <label>Filter by Election Cycle: </label>
            <select onChange={handleDateRangeChange} value={selectedDateRange}>
                <option value="all">All Data</option>
                {
                    Object.keys(dateRanges).map((k) => (
                        <option key={k} value={k}> {dateRanges[k][0].toDateString()} thru {dateRanges[k][1].toDateString()} </option>
                    ))
                }
            </select>
            <Bar data={data} options={options} width="400" height="200" />
        </div>
    );
  }
  
  export default ContributionsBarChart;
  
  
  