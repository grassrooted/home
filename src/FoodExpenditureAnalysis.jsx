import React, { useState, useRef } from "react";

const FoodExpenditureAnalysis = ({ expenditure_data }) => {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef(null);

  // Keywords to identify food-related expenses
  const foodKeywords = ["meals", "food", "beverage", "drinks"];

  // Filter expenditure_data where Category or Description contains food-related keywords
  const foodexpenditure_data = expenditure_data.filter((record) =>
    foodKeywords.some((keyword) =>
      record.Category?.toLowerCase().includes(keyword) ||
      record.Description?.toLowerCase().includes(keyword)
    )
  );

  // Count occurrences and total amount spent at each vendor
  const vendorStats = foodexpenditure_data.reduce((acc, record) => {
    if (!record.Name) return acc;
    if (!acc[record.Name]) {
      acc[record.Name] = { count: 0, totalAmount: 0 };
    }
    acc[record.Name].count += 1;
    acc[record.Name].totalAmount += record.Amount || 0;
    return acc;
  }, {});

  // Filter vendors that have been visited more than once and sort by total amount spent
  const frequentVendors = Object.entries(vendorStats)
    .filter(([_, stats]) => stats.count > 1)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount);

  // Determine how many items to show
  const displayedVendors = expanded ? frequentVendors : frequentVendors.slice(0, 10);

  // Function to handle expanding/collapsing
  const toggleExpand = () => {
    if (expanded) {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setExpanded(!expanded);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-2" ref={listRef}>Food & Beverage Expenditures</h2>
      <h3 className="text-lg font-semibold mt-4">Frequently Visited Vendors</h3>
      <ul>
        {displayedVendors.map(([vendor, stats]) => (
          <li key={vendor}>{vendor} - ${stats.totalAmount.toFixed(2)}</li>
        ))}
      </ul>
      {frequentVendors.length > 10 && (
        <button
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          onClick={toggleExpand}>
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default FoodExpenditureAnalysis;