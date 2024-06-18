import React, { useState } from 'react';
import 'react-tabulator/lib/styles.css'; // default theme
import 'react-tabulator/css/tabulator_simple.min.css'; // use Theme(s)
import { ReactTabulator } from 'react-tabulator'; // for React 16.4+
import { CSVLink } from 'react-csv';


function IndividualContributionsTable({ contribution_data }) {
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

    const filteredData = filterDataByDate(contribution_data, selectedDateRange);

    const columns = [
        { title: "Contributor", field: "Name", headerFilter: true  },
        { title: "Amount ($)", field: "Amount:" },
        { title: "Candidate", field: "Cand/Committee:" },
        { title: "Transaction Date", field: "Transaction Date:", formatter: cell => new Date(cell.getValue()).toLocaleDateString() }
    ];

    return (
        <div className='section'>
            <h2>Individual Contributions Table</h2>
            <select onChange={handleDateRangeChange} value={selectedDateRange}>
                <option value="all">All Data</option>
                <option value="2017-2019">May 5, 2017 - May 4, 2019</option>
                <option value="2019-2021">May 5, 2019 - May 4, 2021</option>
                <option value="2021-2023">May 5, 2021 - May 4, 2023</option>
                <option value="2023-2025">May 5, 2023 - May 4, 2025</option>
            </select>
            <CSVLink data={contribution_data} filename="contribution_data.csv">
                <button>Download Data</button>
            </CSVLink>            
            <ReactTabulator
                data={filteredData}
                columns={columns}
                layout={"fitData"}
                style={style}
            />
        </div>
    );
};

export default IndividualContributionsTable;
