import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpendituresCategoryPieChart = ({ records, profile }) => {
  // Aggregate amounts by category
  const categoryTotals = records.reduce((acc, record) => {
    acc[record.Category] = (acc[record.Category] || 0) + record.Amount;
    return acc;
  }, {});

  // Separate out "Self" category
  const selfRecords = records.filter(record => 
    record.Name.toLowerCase().includes(profile.name.toLowerCase())
  );
  
  const selfTotal = selfRecords.reduce((sum, record) => sum + record.Amount, 0);
  
  // Subtract selfTotal amounts from respective categories
  selfRecords.forEach(record => {
    if (categoryTotals[record.Category]) {
      categoryTotals[record.Category] -= record.Amount;
      if (categoryTotals[record.Category] <= 0) {
        delete categoryTotals[record.Category];
      }
    }
  });
  
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);
  
  const topCategories = sortedCategories.slice(0, 5);
  const otherTotal = sortedCategories.slice(5).reduce((sum, [, amount]) => sum + amount, 0);
  
  const finalCategories = topCategories.map(([category]) => category);
  const finalAmounts = topCategories.map(([, amount]) => amount);

  if (otherTotal > 0) {
    finalCategories.push("Other");
    finalAmounts.push(otherTotal);
  }

  if (selfTotal > 0) {
    finalCategories.push("Self");
    finalAmounts.push(selfTotal);
  }

  // Define a visually appealing color palette
  const colors = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"
  ];

  const data = {
    labels: finalCategories,
    datasets: [
      {
        data: finalAmounts,
        backgroundColor: colors.slice(0, finalCategories.length),
        hoverBackgroundColor: colors.slice(0, finalCategories.length).map(color => color + "CC"), // Slight transparency on hover
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#ffffff",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        bodyFont: {
          size: 14,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: "100%", maxWidth: "500px", height: "500px", margin: "auto" }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default ExpendituresCategoryPieChart;
