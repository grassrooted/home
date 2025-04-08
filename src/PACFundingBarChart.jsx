import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./PACFundingBarChart.css";

const PACFundingBarChart = ({ allContributions }) => {
  // Filter contributions that come from donors with "PAC" in their name
  const pacContributions = useMemo(() => {
    return allContributions.filter((contribution) =>
      contribution.Name.toLowerCase().includes("pac")
    );
  }, [allContributions]);

  // Aggregate PAC contributions per recipient
  const recipientPACTotals = useMemo(() => {
    return pacContributions.reduce((acc, contribution) => {
      if (!acc[contribution.profileName]) {
        acc[contribution.profileName] = 0;
      }
      acc[contribution.profileName] += contribution.Amount;
      return acc;
    }, {});
  }, [pacContributions]);

  // Identify recipients with no PAC funding
  const recipientsWithoutPACFunding = useMemo(() => {
    const allRecipients = [...new Set(allContributions.map(c => c.profileName))];
    return allRecipients.filter(name => !recipientPACTotals[name]);
  }, [allContributions, recipientPACTotals]);

  // Prepare chart data sorted by PAC contribution amount
  const sortedRecipients = Object.entries(recipientPACTotals).sort((a, b) => b[1] - a[1]);
  const chartData = {
    labels: sortedRecipients.map(([recipient]) => recipient),
    datasets: [
      {
        label: "Total PAC Contributions ($)",
        data: sortedRecipients.map(([_, amount]) => amount),
        backgroundColor: "#4CAF50",
      },
    ],
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg" id="PACFundingBarChartWrapper">
      <h2 className="text-xl font-bold mb-4">PAC Contributions by Recipient</h2>
      {sortedRecipients.length > 0 ? (
        <div className="chart-container">
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} width="100%" height="500px" />
        </div>
      ) : (
        <p>No PAC contributions found.</p>
      )}
      {recipientsWithoutPACFunding.length > 0 && (
        <div className="mt-4 p-2 bg-gray-800 rounded">
          <h3 className="text-lg font-semibold">Recipients Without PAC Contributions:</h3>
          <ul className="list-disc pl-5">
            {recipientsWithoutPACFunding.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PACFundingBarChart;
