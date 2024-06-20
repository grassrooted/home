import React, { useState, useEffect } from 'react';
import {TabulatorFull as Tabulator} from "tabulator-tables"; //import Tabulator library
import 'tabulator-tables/dist/css/tabulator.min.css'; // Import Tabulator CSS


const aggregateDataByName = (data) => {
    return data.reduce((acc, contribution) => {
        const normalizedName = contribution.Name.toLowerCase();
        if (!acc[normalizedName]) {
            acc[normalizedName] = {
                Amount: 0,
                Campaign: contribution["Cand/Committee:"],
                Name: contribution.Name, // Keep the original name for display
                Address: contribution.Address,
                children: [] // Initialize the children array for transactions
            };
        }
        acc[normalizedName].Amount += contribution["Amount:"];
        acc[normalizedName].children.push({
            ContactType: contribution["Contact Type:"],
            ReportId: contribution.ReportId,
            Amount: contribution["Amount:"],
            Campaign: contribution["Cand/Committee:"],
            TransactionDate: contribution["Transaction Date:"],
            Latitude: contribution.Latitude,
            Longitude: contribution.Longitude,
            Name: contribution.Name, // Keep the original name for display
            Address: contribution.Address
        });
        return acc;
    }, {});
};

function AggregatedDataTable ({dateRanges, contribution_data }) {
  const style = {
    height:"600px"
  }
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  useEffect(() => {
    const filterDataByDate = (data, dateRange) => {
        if (dateRange === 'all') {
          return data;
        }  
      
        const [startDate, endDate] = dateRanges[dateRange];
        
        return data.filter(record => {
          const transactionDate = new Date(record["Transaction Date:"]);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      };

    const filteredData = filterDataByDate(contribution_data, selectedDateRange);
    let aggregatedData = aggregateDataByName(filteredData);
    const tableData = Object.values(aggregatedData);

    const table = new Tabulator("#aggregated-contributions-table", {
        data: tableData,
        layout: "fitColumns",
        columns: [
            { title: "Contributor", field: "Name", headerFilter: "input" },
            {
                title: "Amount ($)",
                field: "Amount",
            },
            { title: "Candidate", field: "Campaign" },
            { title: "Transaction Date", field: "TransactionDate" },
        ],
        // Enable tree structure
        dataTree: true,
        dataTreeStartExpanded: false, // Start with tree collapsed
        dataTreeChildField: "children", // Specify the field that contains the children array
        dataTreeBranchElement: "<span style='color:blue;'>&#x25B6;</span>" // Custom branch element for expanded rows
    });

    table.on("rowClick", function(e, row){
        row.treeToggle();
    });

    return () => table.destroy();
  }, [contribution_data, selectedDateRange]);

  const handleDateRangeChange = (event) => {
    setSelectedDateRange(event.target.value);
  };
  const dateRanges_keys = Object.keys(dateRanges)
  return (
    <div className='section'>
        <h2>Aggregated Contributions Table</h2>
        <h4><i>Contributions made by the same person have been grouped together.</i></h4>
        <label>Filter by Election Cycle: </label>
        <select onChange={handleDateRangeChange} value={selectedDateRange}>
            <option value="all">All</option>
            {
              dateRanges_keys.map((k) => (
                <option key={k} value={k}> {dateRanges[k][0].toDateString()} thru {dateRanges[k][1].toDateString()} </option>
              ))
            }
      </select>
      <div id="aggregated-contributions-table" style={style}></div>
    </div>
  );
};

export default AggregatedDataTable;

















