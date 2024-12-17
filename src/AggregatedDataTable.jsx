import React, { useEffect } from 'react';
import { TabulatorFull as Tabulator } from "tabulator-tables";
import 'tabulator-tables/dist/css/tabulator.min.css';

const aggregateDataByName = (profile, data) => {
    return data.reduce((acc, contribution) => {
        const normalizedName = contribution[profile.contribution_fields.Donor].toLowerCase();
        if (!acc[normalizedName]) {
            acc[normalizedName] = {
                Amount: 0,
                Campaign: contribution[profile.contribution_fields.Recipient],
                Name: contribution[profile.contribution_fields.Donor],
                Address: contribution[profile.contribution_fields.Address],
                children: []
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
            Name: contribution[profile.contribution_fields.Donor],
            Address: contribution.Address
        });
        return acc;
    }, {});
};

function AggregatedDataTable({ profile, selectedDateRange, contribution_data }) {
    const style = { height: "auto" };

    useEffect(() => {
        const filterDataByDate = (data, dateRange) => {
            const { start, end } = dateRange;

            return data.filter(record => {
                const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
                return transactionDate >= start && transactionDate <= end;
            });
        };

        const filteredData = filterDataByDate(contribution_data, selectedDateRange);
        let aggregatedData = aggregateDataByName(profile, filteredData);
        let tableData = Object.values(aggregatedData);

        // Sort by "Amount" in descending order and take the top 10 rows
        tableData = tableData
            .sort((a, b) => b.Amount - a.Amount)
            .slice(0, 10);

        const table = new Tabulator("#aggregated-contributions-table", {
            data: tableData,
            layout: "fitColumns",
            initialSort: [
                { column: "Amount", dir: "desc" },
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
    }, [contribution_data, selectedDateRange, profile]);

    return (
        <div className='section'>
            <h1>Top Donors</h1>
            <h4><i>Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i></h4>
            <div id="aggregated-contributions-table" style={style}></div>
            <h4><i>Contributions made by the same person have been grouped together.</i></h4>

        </div>
    );
}

export default AggregatedDataTable;
