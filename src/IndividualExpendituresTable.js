import React, { useEffect } from 'react';
import { TabulatorFull as Tabulator } from "tabulator-tables";
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CSVLink } from 'react-csv';

function IndividualExpendituresTable({ profile, selectedDateRange, expenditure_data }) {
    const style = {
        height: "600px",
    };

    useEffect(() => {
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

        const processedData = preprocessData(expenditure_data);
        const filteredData = selectedDateRange === 'all' 
            ? processedData 
            : filterDataByDate(processedData, selectedDateRange);
        const tableData = Object.values(filteredData);

        const columns = [
            { title: "Vendor", field: "Name", headerFilter: true },
            { title: "Amount ($)", field: profile.contribution_fields.Amount, formatter: "money", headerFilter: true },
            { title: "Category", field: "Category", headerFilter: true },
            { title: "Description", field: "Description", headerFilter: true },
            {
                title: "Transaction Date",
                field: profile.contribution_fields.Transaction_Date,
                sorter: (a, b) => new Date(a) - new Date(b),
                formatter: (cell) => {
                    const dateValue = cell.getValue();
                    if (isNaN(dateValue)) {
                        return "(Invalid Date)";
                    }
                    return dateValue.toLocaleDateString("en-US");
                },
                headerFilter: "input"
            }
        ];

        const table = new Tabulator("#individual-expenditures-table", {
            data: tableData,
            layout: "fitDataFill",
            columns: columns,
            renderHorizontal: "virtual",
            autoResize: true,
            rowFormatter: (row) => {
                const index = row.getPosition(true);
                row.getElement().style.backgroundColor = index % 2 === 0 ? "#2c2c2c" : "#222";
                row.getElement().style.color = "#fff";
            },
        });

        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll(".tabulator .tabulator-header").forEach(header => {
                header.style.backgroundColor = "#1a1a1a";
                header.style.color = "white";
            });
        });
        

        return () => table.destroy();
    }, [
        expenditure_data, 
        selectedDateRange, 
        profile.contribution_fields.Amount, 
        profile.contribution_fields.Recipient, 
        profile.contribution_fields.Transaction_Date
    ]);

    return (
        <div className='section'>
            <h1>All Expenditures</h1>
            <h4>
                <i>Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i>
            </h4>
            <CSVLink data={expenditure_data} filename="expenditure_data.csv">
                <button>Download Data</button>
            </CSVLink>    
            <div id="individual-expenditures-table" style={style}></div>        
        </div>
    );
};

export default IndividualExpendituresTable;
