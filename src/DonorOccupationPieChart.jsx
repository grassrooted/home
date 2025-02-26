import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import './DonorOccupationPieChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonorOccupationPieChart = ({ contribution_data }) => {
  // Aggregate total contributions by Occupation
  const occupationTotals = contribution_data.reduce((acc, record) => {
    const occupation = record.Occupation && record.Occupation !== "NaN" ? record.Occupation : "N/A";
    acc[occupation] = (acc[occupation] || 0) + (record.Amount || 0);
    return acc;
  }, {});

  // Convert to array and sort by total contribution (descending)
  const sortedOccupations = Object.entries(occupationTotals)
    .map(([occupation, totalContribution]) => ({ occupation, totalContribution }))
    .sort((a, b) => b.totalContribution - a.totalContribution);

  // Extract Top 5 Occupations, excluding "N/A"
  const topOccupations = sortedOccupations
    .filter(item => item.occupation !== "N/A") 
    .slice(0, 5);
  
  // Sum remaining occupations (including "N/A") into "Other"
  const otherTotal = sortedOccupations.slice(5).reduce((sum, item) => sum + item.totalContribution, 0);
  if (otherTotal > 0) {
    topOccupations.push({ occupation: "Other", totalContribution: otherTotal });
  }

  // Prepare Pie Chart Data
  const chartData = {
    labels: topOccupations.map((item) => item.occupation),
    datasets: [
      {
        data: topOccupations.map((item) => item.totalContribution),
        backgroundColor: ["#4E5D89", "#D7816A", "#ad6c6c", "#5C6B8A", "#A45C5C", "#8F8DA3"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            let value = tooltipItem.raw || 0;
            return `$${value.toLocaleString()}`; // Formats number with a dollar sign
          },
        },
      },
    }
  };

  return (
    <div className="section" id="occupation-pie-chart-wrapper">
      <h2>Donor Reported Occupations</h2>
      <div id="occupation-pie-chart">
        <Pie data={chartData} options={options} />
      </div>
      <h3>Top 5 Occupations by Contribution Amount</h3>
      <table id="donor-occupation-table">
        <tbody>
          {topOccupations.map((item, index) => (
            <tr key={index}>
              <td>{item.occupation}</td>
              <td>${item.totalContribution.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DonorOccupationPieChart;
