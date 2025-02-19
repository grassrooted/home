import React, { useState, useRef } from "react";

const DonationList = ({ expenditure_data }) => {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef(null); // Reference to the list container

  // Filter expenditure_data where Category or Description contains "Donation"
  const donationExpenditureData = expenditure_data.filter(
    (record) =>
      record.Category?.toLowerCase().includes("donation") ||
      record.Description?.toLowerCase().includes("donation")
  );

  // Aggregate total amount per unique Name
  const donationTotals = donationExpenditureData.reduce((acc, record) => {
    if (!record.Name) return acc;
    if (!acc[record.Name]) {
      acc[record.Name] = 0;
    }
    acc[record.Name] += record.Amount || 0;
    return acc;
  }, {});

  // Sort the names alphabetically
  const sortedNames = Object.keys(donationTotals).sort();

  // Determine how many items to show
  const displayedNames = expanded ? sortedNames : sortedNames.slice(0, 10);

  // Function to handle expanding/collapsing
  const toggleExpand = () => {
    if (expanded) {
      // Scroll back to the list when collapsing
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setExpanded(!expanded);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 ref={listRef} className="text-xl font-bold mb-2">
        Donation Payments
      </h2>
      {sortedNames.length > 0 ? (
        <>
          <ul className="list-disc pl-5">
            {displayedNames.map((name, index) => (
              <li key={index}>{name} - ${donationTotals[name].toFixed(2)}</li>
            ))}
          </ul>
          {sortedNames.length > 10 && (
            <button
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={toggleExpand}
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}
        </>
      ) : (
        <p>No donation payments found.</p>
      )}
    </div>
  );
};

export default DonationList;
