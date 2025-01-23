import React, { useEffect } from 'react';
import { TabulatorFull as Tabulator } from "tabulator-tables";
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CSVLink } from 'react-csv';

function IndividualContributionsTable({ profile, selectedDateRange, contribution_data }) {
    const style = {
        height: "600px",
    };

    useEffect(() => {
        // Preprocess data to convert Transaction Date to a JavaScript Date object
        const preprocessData = (data) => {
            return data.map(record => ({
                ...record,
                [profile.contribution_fields.Transaction_Date]: new Date(record[profile.contribution_fields.Transaction_Date])
            }));
        };

        const filterDataByDate = (data, dateRange) => {
            const { start, end } = dateRange;
            return data.filter(record => {
                const transactionDate = record[profile.contribution_fields.Transaction_Date];
                return transactionDate >= start && transactionDate <= end;
            });
        };

        const processedData = preprocessData(contribution_data);
        const filteredData = selectedDateRange === 'all' 
            ? processedData 
            : filterDataByDate(processedData, selectedDateRange);
        const tableData = Object.values(filteredData);

        const columns = [
            { title: "Contributor", field: "Name", headerFilter: true },
            { title: "Amount ($)", field: profile.contribution_fields.Amount, formatter: "money", headerFilter: true },
            { title: "Candidate", field: profile.contribution_fields.Recipient },
            {
                title: "Transaction Date",
                field: profile.contribution_fields.Transaction_Date,
                sorter: (a, b) => new Date(a) - new Date(b), // Custom date sorter
                formatter: (cell) => {
                    const dateValue = cell.getValue();
                    if (isNaN(dateValue)) {
                        return "(Invalid Date)";
                    }
                    return dateValue.toLocaleDateString("en-US"); // Format as MM/DD/YYYY
                },
                headerFilter: "input" // Optional: Add date search/filter
            }
        ];

        const table = new Tabulator("#individual-contributions-table", {
            data: tableData,
            layout: "fitColumns",
            columns: columns,
        });

        return () => table.destroy();
    }, [
        contribution_data, 
        selectedDateRange, 
        profile.contribution_fields.Amount, 
        profile.contribution_fields.Recipient, 
        profile.contribution_fields.Transaction_Date
    ]);

    return (
        <div className='section'>
            <h1>All Donations</h1>
            <h4>
                <i>Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i>
            </h4>
            <CSVLink data={contribution_data} filename="contribution_data.csv">
                <button>Download Data</button>
            </CSVLink>    
            <div id="individual-contributions-table" style={style}></div>        
        </div>
    );
};

export default IndividualContributionsTable;
