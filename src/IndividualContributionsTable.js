import React, { useState, useEffect } from 'react';
import {TabulatorFull as Tabulator} from "tabulator-tables"; //import Tabulator library
import 'tabulator-tables/dist/css/tabulator.min.css'; // Import Tabulator CSS
import { CSVLink } from 'react-csv';


function IndividualContributionsTable({profile, dateRanges, contribution_data }) {
    const style = {
        height: "600px",
    }

    const [selectedDateRange, setSelectedDateRange] = useState('all');

    const handleDateRangeChange = (event) => {
        setSelectedDateRange(event.target.value);
    };

    const filterDataByDate = (data, dateRange) => {
    if (dateRange === 'all') {
        return data;
    }

    const dateRanges = {
        '2017-2019': [new Date('2017-05-05'), new Date('2019-05-04')],
        '2019-2021': [new Date('2019-05-05'), new Date('2021-05-04')],
        '2021-2023': [new Date('2021-05-05'), new Date('2023-05-04')],
        '2023-2025': [new Date('2023-05-05'), new Date('2025-05-04')],
    };

    const [startDate, endDate] = dateRanges[dateRange];
    return data.filter(record => {
        const transactionDate = new Date(record["Transaction Date:"]);
        return transactionDate >= startDate && transactionDate <= endDate;
    });
    };

    useEffect(() => {
        const filteredData = filterDataByDate(contribution_data, selectedDateRange);
        const tableData = Object.values(filteredData);
    
        const columns = [
            { title: "Contributor", field: "Name", headerFilter: true },
            { title: "Amount ($)", field: profile.contribution_fields.Amount, formatter: "money"  },
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
            <h1>All Contributions</h1>
            <label>Filter by Election Cycle: </label>
            <select onChange={handleDateRangeChange} value={selectedDateRange}>
                <option value="all">All Data</option>
                {
                    Object.keys(dateRanges).map((k) => (
                        <option key={k} value={k}> {dateRanges[k][0].toDateString()} thru {dateRanges[k][1].toDateString()} </option>
                    ))
                }
            </select>
            <CSVLink data={contribution_data} filename="contribution_data.csv">
                <button>Download Data</button>
            </CSVLink>    
            <div id="individual-contributions-table" style={style}></div>        
        </div>
    );
};

export default IndividualContributionsTable;
