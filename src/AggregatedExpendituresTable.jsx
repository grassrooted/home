import React, { useEffect } from 'react';
import { TabulatorFull as Tabulator } from "tabulator-tables";
import 'tabulator-tables/dist/css/tabulator.min.css';

const aggregateDataByName = (profile, data) => {
    return data.reduce((acc, expenditure) => {
        const normalizedName = expenditure[profile.contribution_fields.Donor].toLowerCase();
        if (!acc[normalizedName]) {
            acc[normalizedName] = {
                Amount: 0,
                Campaign: expenditure[profile.contribution_fields.Recipient],
                Name: expenditure[profile.contribution_fields.Donor],
                Address: expenditure[profile.contribution_fields.Address],
                children: []
            };
        }
        acc[normalizedName].Amount += expenditure[profile.contribution_fields.Amount];
        acc[normalizedName].children.push({
            ReportId: expenditure.ReportId,
            Amount: expenditure[profile.contribution_fields.Amount],
            Campaign: expenditure[profile.contribution_fields.Recipient],
            TransactionDate: expenditure[profile.contribution_fields.Transaction_Date],
            Latitude: expenditure.Latitude,
            Longitude: expenditure.Longitude,
            Name: expenditure[profile.contribution_fields.Donor],
            Address: expenditure.Address
        });
        return acc;
    }, {});
};

function AggregatedExpendituresTable({ profile, expenditure_data, selectedDateRange }) {
    const style = { height: "auto" };

    useEffect(() => {
        const filterDataByDate = (data, dateRange) => {
            const { start, end } = dateRange;

            return data.filter(record => {
                const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
                return transactionDate >= start && transactionDate <= end;
            });
        };

        const filteredData = filterDataByDate(expenditure_data, selectedDateRange);
        let aggregatedData = aggregateDataByName(profile, filteredData);
        let tableData = Object.values(aggregatedData);

        // Sort by "Amount" in descending order and take the top 10 rows
        tableData = tableData
            .sort((a, b) => b.Amount - a.Amount)
            .slice(0, 10);

        console.log(tableData)
        const table = new Tabulator("#aggregated-expenditures-table", {
            data: tableData,
            layout: "fitColumns",
            initialSort: [
                { column: "Amount", dir: "desc" },
            ],
            columns: [
                { title: "Vendor", field: "Name" },
                { title: "Amount ($)", field: "Amount", formatter: "money" },
                { title: "Candidate", field: "Campaign" },
                { title: "Transaction Date", field: "TransactionDate" },
            ],
            autoResize: true,
            rowFormatter: (row) => {
                const index = row.getPosition(true);
                row.getElement().style.backgroundColor = index % 2 === 0 ? "#2c2c2c" : "#222";
                row.getElement().style.color = "#fff";
            },
            dataTree: true,
            dataTreeStartExpanded: false,
            dataTreeChildField: "children",
            dataTreeBranchElement: "<span style='color:blue;'>&#x25B6;</span>",
        });

        table.on("rowClick", function (e, row) {
            row.treeToggle();
        });

        return () => table.destroy();
    }, [expenditure_data, selectedDateRange, profile]);

    return (
        <div className='section'>
            <h1>Top Expenditures</h1>
            <h4><i>Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i></h4>
            <div id="aggregated-expenditures-table" style={style}></div>
            <h4><i>Expenditures made to the same person have been grouped together.</i></h4>

        </div>
    );
}

export default AggregatedExpendituresTable;
