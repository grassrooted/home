import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import './DonorOccupationPieChart.css'

ChartJS.register(ArcElement, Tooltip, Legend);

const DonorOccupationPieChart = ({ contribution_data }) => {
  // Grouping data by `Donor_Reported_Occupation` and summing contributions
  const occupationData = contribution_data.reduce((acc, record) => {
    const occupation = record.Donor_Reported_Occupation === "NaN" ? "Unknown" : record.Donor_Reported_Occupation;
    if (!acc[occupation]) {
      acc[occupation] = { count: 0, totalContribution: 0 };
    }
    acc[occupation].count += 1;
    acc[occupation].totalContribution += record.Contribution_Amount || 0;
    return acc;
  }, {});

  // Separating data into top occupations and "Other" bucket
  const occupations = Object.entries(occupationData).map(([occupation, details]) => ({
    occupation,
    count: details.count,
    totalContribution: details.totalContribution,
  }));

  const topOccupations = occupations.filter((item) => item.count >= 10);
  const otherOccupations = occupations.filter((item) => item.count < 10);

  const otherCount = otherOccupations.reduce((sum, item) => sum + item.count, 0);
  const otherTotalContribution = otherOccupations.reduce((sum, item) => sum + item.totalContribution, 0);

  if (otherCount > 0) {
    topOccupations.push({
      occupation: "Other",
      count: otherCount,
      totalContribution: otherTotalContribution,
    });
  }

  // Sorting by total contribution for the table
  const sortedOccupations = [...topOccupations].sort((a, b) => b.totalContribution - a.totalContribution);

  // Preparing data for the pie chart
  const labels = topOccupations.map((item) => item.occupation);
  const dataPoints = topOccupations.map((item) => item.totalContribution);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataPoints,
        backgroundColor: ['#4caf50', '#ff5722', '#3f51b5', '#9c27b0', '#ffc107', '#9e9e9e'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="section" id="occupation-pie-chart-wrapper">
      <h2>Donor Reported Occupations</h2>
      <div id="occupation-pie-chart">
        <Pie data={chartData} options={options} />
      </div>
      <h3>Top 5 Occupations by Contribution Amount</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <tbody>
          {sortedOccupations.slice(1, 6).map((item, index) => (
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
