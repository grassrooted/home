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

const filterDataByDate = (election_date, data, dateRange) => {
    if (dateRange === 'all') {
      return data;
    }  
    const [month, day] = election_date.split("-");

    // Create date objects for the day after the election day for each relevant year
    const getDateRanges = (year_start, year_end) => {
        let electionDate = new Date(`${year_end}-${month}-${day}`);
        const end_date = new Date(electionDate)
        end_date.setDate(electionDate.getDate() + 1);

        electionDate = new Date(`${year_start}-${month}-${day}`);
        const start_date = new Date(electionDate);
        start_date.setDate(electionDate.getDate() + 2);
        return [start_date, end_date]
    };

    const dateRanges = {
      '2017-2019': getDateRanges(2017, 2019),
      '2019-2021': getDateRanges(2019, 2021),
      '2021-2023': getDateRanges(2021, 2023),
      '2023-2025': getDateRanges(2023, 2025),
    };
  
    const [startDate, endDate] = dateRanges[dateRange];
    return data.filter(record => {
      const transactionDate = new Date(record["Transaction Date:"]);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

function AggregatedDataTable ({profile, contribution_data }) {
    const style = {
        height:"600px"
    }
    const [selectedDateRange, setSelectedDateRange] = useState('all');
    let election_date = profile.election_date
    useEffect(() => {
        const filteredData = filterDataByDate(election_date, contribution_data, selectedDateRange);
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

  return (
    <div className='section'>
        <h2>Aggregated Contributions Table</h2>
        <h4><i>Contributions made by the same person have been grouped together.</i></h4>
        <label>Filter by Election Cycle: </label>
        <select onChange={handleDateRangeChange} value={selectedDateRange}>
        <option value="all">All</option>
        <option value="2017-2019">May 5, 2017 - May 4, 2019</option>
        <option value="2019-2021">May 5, 2019 - May 4, 2021</option>
        <option value="2021-2023">May 5, 2021 - May 4, 2023</option>
        <option value="2023-2025">May 5, 2023 - May 4, 2025</option>
      </select>
      <div id="aggregated-contributions-table" style={style}></div>
    </div>
  );
};

export default AggregatedDataTable;

















