import React from "react";

const FoodExpenditureAnalysis = ({ expenditure_data }) => {
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

  // Identify vendor with the most transactions
  const topVendor = Object.keys(vendorStats).reduce((a, b) =>
    vendorStats[a]?.count > vendorStats[b]?.count ? a : b
  , "");

  const topVendorTotalAmount = topVendor && vendorStats[topVendor] ? vendorStats[topVendor].totalAmount : 0;

  // Identify the record with the highest amount
  const highestAmountRecord = foodexpenditure_data.reduce((max, record) =>
    record.Amount > (max?.Amount || 0) ? record : max
  , null);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-2">Food & Beverage Expenditures</h2>
      {topVendor ? (
        <p><strong>Top Vendor by Food & Beverage Expenditures: Most Frequent Vendor & Total Spending</strong> {topVendor} - ${topVendorTotalAmount.toFixed(2)} spent</p>
      ) : (
        <p>No food-related transactions found.</p>
      )}
      {highestAmountRecord ? (
        <p><strong>Largest Single Food & Beverage Expenditure: Vendor with Highest Individual Transaction</strong> {highestAmountRecord.Name} - ${highestAmountRecord.Amount.toFixed(2)}</p>
      ) : null}
    </div>
  );
};

export default FoodExpenditureAnalysis;