import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './ContributionPieChart.css'; // Import the CSS file

ChartJS.register(ArcElement, Tooltip, Legend);

function ContributionPieChart({ profile, contribution_data, profiles }) {
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

        contribution_data.forEach((contribution) => {
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
            } else if (amount < smallDollarLimit) {
                categoryTotals.smallDollar += amount;
            } else if (amount >= bigDonorLimit) {
                categoryTotals.bigDonor += amount;
            } else {
                categoryTotals.other += amount;
            }
        });

        return categoryTotals;
    }, [contribution_data, profile, profiles]);

    const data = {
        labels: ['Small Dollar', 'Big Donor', 'PAC', 'Self-Funding', 'Other Candidates', 'Other'],
        datasets: [
            {
                label: 'Contribution Amounts',
                data: [
                    categories.smallDollar,
                    categories.bigDonor,
                    categories.pac,
                    categories.selfFunding,
                    categories.otherCandidates,
                    categories.other,
                ],
                backgroundColor: [
                    '#4caf50', '#ff5722', '#3f51b5', '#9c27b0', '#ffc107', '#9e9e9e',
                ],
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        return `${context.label}: $${value.toLocaleString()}`;
                    },
                },
            },
        },
    };

    const totalAmount = Object.values(categories).reduce((sum, value) => sum + value, 0);
    const tableData = Object.keys(categories).map((key, index) => {
        const categoryAmount = categories[key];
        return {
            category: data.labels[index],
            amount: categoryAmount,
            percentage: ((categoryAmount / totalAmount) * 100).toFixed(2) + '%',
        };
    });

    return (
        <div className="contribution-container">
            <h1>Contribution Breakdown</h1>
            <div className="pie-chart-container">
                <Pie data={data} options={options} />
            </div>
            <table>
                <tbody>
                    {tableData.map((row, index) => (
                        <tr key={index}>
                            <td>{row.category}</td>
                            <td>${row.amount.toLocaleString()}</td>
                            <td>{row.percentage}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ContributionPieChart;