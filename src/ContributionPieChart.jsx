import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './ContributionPieChart.css';

function ContributionPieChart({ profile, contribution_data, profiles, selectedDateRange }) {
    const filteredData = useMemo(() => {
        if (selectedDateRange === 'all') {
            return contribution_data;
        }
        const { start, end } = selectedDateRange;
        return contribution_data.filter(record => {
            const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
            return transactionDate >= start && transactionDate <= end;
        });
    }, [contribution_data, profile, selectedDateRange]);

    const categories = useMemo(() => {
        const smallDollarLimit = 100;
        const bigDonorLimit = profile.individual_limit;
        const candidateName = profile.name.toLowerCase();
        const otherCandidateNames = profiles?.map(candidate => candidate.name.toLowerCase()) || [];

        let categoryTotals = {
            smallDollar: 0,
            bigDonor: 0,
            pac: 0,
            selfFunding: 0,
            otherCandidates: 0,
            other: 0,
        };

        filteredData.forEach((contribution) => {
            const amount = contribution[profile.contribution_fields.Amount];
            const donorName = contribution[profile.contribution_fields.Donor].toLowerCase();
            const donorNameParts = donorName.split(",");
            const donorLastName = donorNameParts[0]?.trim();
            const donorFirstName = donorNameParts[1]?.trim();
            const formattedDonorName = `${donorFirstName} ${donorLastName}`.toLowerCase();

            if (donorName === candidateName || formattedDonorName === candidateName) {
                categoryTotals.selfFunding += amount;
            } else if (otherCandidateNames.includes(donorName) || otherCandidateNames.includes(formattedDonorName)) {
                categoryTotals.otherCandidates += amount;
            } else if (donorName.includes("pac") || donorName.includes("committee")) {
                categoryTotals.pac += amount;
            } else if (donorName.toUpperCase().includes("TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS") || donorName.toUpperCase().includes("TOTAL OFFICEHOLDER CONTRIBUTIONS OF $50 OR LESS")) {
                categoryTotals.smallDollar += amount;
            } else if (amount < smallDollarLimit) {
                categoryTotals.smallDollar += amount;
            } else if (amount >= bigDonorLimit) {
                categoryTotals.bigDonor += amount;
            } else {
                categoryTotals.other += amount;
            }
        });

        return categoryTotals;
    }, [filteredData, profile, profiles]);

    const colors = ["#4E5D89", "#D7816A", "#ad6c6c", "#5C6B8A", "#A45C5C", "#8F8DA3", "#E3A87C"];
    const legend = [
        'Small Dollar (Individual Donations <$100)',
        `Large Dollar (Individual Donations of $${profile.individual_limit}+)`,
        'PAC',
        'Self-Funding',
        'Other Candidates',
        'Other'
    ];

    const totalAmount = Object.values(categories).reduce((sum, value) => sum + value, 0);

    const pieChartData = legend.map((label, index) => ({
        name: label,
        y: categories[Object.keys(categories)[index]],
        color: colors[index],
    }));

    const options = {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            spacing: [10, 10, 10, 10],
            height: null, // Auto height for responsiveness
            width: null,  // Auto width for responsiveness
        },
        title: {
            text: 'Donor Summary',
            style: { color: '#ffffff'}
        },
        tooltip: {
            formatter: function () {
                return `<b>${this.point.name}</b>: $${this.y.toLocaleString()} (${((this.y / totalAmount) * 100).toFixed(2)}%)`;
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    inside: true,
                    format: '{point.name}',
                    color: 'black',
                    style: { fontSize: '8px' }
                }
            }
        },
        legend: {
            itemStyle: { color: 'white', fontSize: '12px' },
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal'
        },
        series: [{
            name: 'Contributions',
            data: pieChartData
        }],
        responsive: {
            rules: [{
                condition: { maxWidth: 480 },
                chartOptions: {
                    legend: { enabled: false }, // Hide legend on small screens
                    plotOptions: {
                        pie: { dataLabels: { enabled: false } } // Hide labels for smaller screens
                    }
                }
            }]
        }
    };

    return (
        <div className="section" id="contribution-pie-chart-wrapper">
            <div id="funding-summary-pie-chart">
                <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
            <h4><i>Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i></h4>
        </div>
    );
}

export default ContributionPieChart;
