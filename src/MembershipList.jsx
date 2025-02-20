import React from "react";

const MembershipList = ({ expenditure_data }) => {
  // Filter expenditure_data where Category or Description contains "Membership"
  const membershipRecords = expenditure_data.filter(
    (record) =>
      record.Category?.toLowerCase().includes("membership") ||
      record.Description?.toLowerCase().includes("membership")
  );

  // Extract unique names from filtered expenditure_data and sort them in descending order
  const uniqueNames = [...new Set(membershipRecords.map((record) => record.Name))].sort((a, b) => b.localeCompare(a));
  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-2">Membership Expenditures</h2>
      {uniqueNames.length > 0 ? (
        <ul className="list-disc pl-5">
          {uniqueNames.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      ) : (
        <p>No membership payments found.</p>
      )}
    </div>
  );
};

export default MembershipList;