import React, { useEffect } from 'react';
import { TabulatorFull as Tabulator } from "tabulator-tables";
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CSVLink } from 'react-csv';

function IndividualContributionsTable({ profile, selectedDateRange, contribution_data }) {
    const style = {
        height: "600px",
    };

    useEffect(() => {
        const filterDataByDate = (data, dateRange) => {
            const { start, end } = dateRange;
            return data.filter(record => {
                const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
                return transactionDate >= start && transactionDate <= end;
            });
        };

        const filteredData = selectedDateRange === 'all' ? contribution_data : filterDataByDate(contribution_data, selectedDateRange);
        const tableData = Object.values(filteredData);

        const columns = [
            { title: "Contributor", field: "Name", headerFilter: true },
            { title: "Amount ($)", field: profile.contribution_fields.Amount, formatter: "money" },
            { title: "Candidate", field: profile.contribution_fields.Recipient },
            {
                title: "Transaction Date",
                field: profile.contribution_fields.Transaction_Date,
                formatter: cell => new Date(cell.getValue()).toLocaleDateString()
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
            <h4><i>Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i></h4>
            <CSVLink data={contribution_data} filename="contribution_data.csv">
                <button>Download Data</button>
            </CSVLink>    
            <div id="individual-contributions-table" style={style}></div>        
        </div>
    );
};

export default IndividualContributionsTable;