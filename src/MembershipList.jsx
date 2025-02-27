import React, { useState, useRef } from "react";

const MembershipList = ({ expenditure_data }) => {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef(null);

  // Filter expenditure_data where Category or Description contains "Membership"
  const membershipRecords = expenditure_data.filter(
    (record) =>
      record.Category?.toLowerCase().includes("membership") ||
      record.Description?.toLowerCase().includes("membership")
  );

  // Extract unique names from filtered expenditure_data and sort them in descending order
  const uniqueNames = [...new Set(membershipRecords.map((record) => record.Name))].sort((a, b) => b.localeCompare(a));

  // Determine how many items to show
  const displayedNames = expanded ? uniqueNames : uniqueNames.slice(0, 10);

  // Function to handle expanding/collapsing
  const toggleExpand = () => {
    if (expanded) {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setExpanded(!expanded);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-2" ref={listRef}>
        Membership Expenditures
      </h2>
      {uniqueNames.length > 0 ? (
        <>
          <ul className="list-disc pl-5">
            {displayedNames.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
          {uniqueNames.length > 10 && (
            <button
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={toggleExpand}
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}
        </>
      ) : (
        <p>No membership payments found.</p>
      )}
    </div>
  );
};

export default MembershipList;
