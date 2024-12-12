import React, { useState, useEffect } from 'react';
import { TabulatorFull as Tabulator } from "tabulator-tables"; // Import Tabulator library
import 'tabulator-tables/dist/css/tabulator.min.css'; // Import Tabulator CSS

const aggregateDataByName = (profile, data) => {
    return data.reduce((acc, contribution) => {
        const normalizedName = contribution[profile.contribution_fields.Donor].toLowerCase();
        if (!acc[normalizedName]) {
            acc[normalizedName] = {
                Amount: 0,
                Campaign: contribution[profile.contribution_fields.Recipient],
                Name: contribution.Name, // Keep the original name for display
                Address: contribution.Address,
                children: [] // Initialize the children array for transactions
            };
        }
        acc[normalizedName].Amount += contribution[profile.contribution_fields.Amount];
        acc[normalizedName].children.push({
            ReportId: contribution.ReportId,
            Amount: contribution[profile.contribution_fields.Amount],
            Campaign: contribution[profile.contribution_fields.Recipient],
            TransactionDate: contribution[profile.contribution_fields.Transaction_Date],
            Latitude: contribution.Latitude,
            Longitude: contribution.Longitude,
            Name: contribution[profile.contribution_fields.Donor], // Keep the original name for display
            Address: contribution.Address
        });
        return acc;
    }, {});
};

function AggregatedDataTable({ profile, dateRanges, contribution_data }) {
    const style = { height: "auto" };
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
        let aggregatedData = aggregateDataByName(profile, filteredData);
        let tableData = Object.values(aggregatedData);

        // Sort by "Amount" in descending order and take the top 10 rows
        tableData = tableData
            .sort((a, b) => b.Amount - a.Amount) // Sort descending
            .slice(0, 10); // Get top 10 rows

        const table = new Tabulator("#aggregated-contributions-table", {
            data: tableData,
            layout: "fitColumns",
            initialSort: [
                { column: "Amount", dir: "desc" }, // Sort by "Amount" descending
            ],
            columns: [
                { title: "Contributor", field: "Name" },
                { title: "Amount ($)", field: "Amount", formatter: "money" },
                { title: "Candidate", field: "Campaign" },
                { title: "Transaction Date", field: "TransactionDate" },
            ],
            dataTree: true,
            dataTreeStartExpanded: false,
            dataTreeChildField: "children",
            dataTreeBranchElement: "<span style='color:blue;'>&#x25B6;</span>",
        });

        table.on("rowClick", function (e, row) {
            row.treeToggle();
        });

        return () => table.destroy();
    }, [contribution_data, selectedDateRange, dateRanges, profile]);

    const handleDateRangeChange = (event) => {
        setSelectedDateRange(event.target.value);
    };

    return (
        <div className='section'>
            <h1>Top Contributors</h1>
            <h4><i>Contributions made by the same person have been grouped together.</i></h4>
            <label>Filter by Election Cycle: </label>
            <select onChange={handleDateRangeChange} value={selectedDateRange}>
                <option value="all">All</option>
                {
                    Object.keys(dateRanges).map((k) => (
                        <option key={k} value={k}>
                            {dateRanges[k][0].toDateString()} thru {dateRanges[k][1].toDateString()}
                        </option>
                    ))
                }
            </select>
            <div id="aggregated-contributions-table" style={style}></div>
        </div>
    );
}

export default AggregatedDataTable;
