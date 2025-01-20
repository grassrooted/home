import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js';
import './StackedBarChartDonorSummary.css';

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

function StackedBarChartDonorSummary({ cityProfileData, selectedDateRange }) {
    const chartData = useMemo(() => {
        const labels = cityProfileData.map(profile => profile.name);
        const smallDollarData = [];
        const largeDollarData = [];
        const pacData = [];
        const selfFundingData = [];
        const otherCandidatesData = [];
        const otherData = [];

        const smallDollarLimit = 100;
        const bigDonorLimit = cityProfileData[0].individual_limit;


        cityProfileData.forEach(profile => {
            const filteredData = selectedDateRange === 'all'
                ? profile.contributions
                : profile.contributions.filter(record => {
                    const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
                    return transactionDate >= selectedDateRange.start && transactionDate <= selectedDateRange.end;
                });


            const categoryTotals = {
                smallDollar: 0,
                bigDonor: 0,
                pac: 0,
                selfFunding: 0,
                otherCandidates: 0,
                other: 0,
            };

            const candidateName = profile.name.toLowerCase();

            const otherCandidateNames = cityProfileData.map(candidate => candidate.name.toLowerCase());

            filteredData.forEach(contribution => {
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

            smallDollarData.push(categoryTotals.smallDollar);
            largeDollarData.push(categoryTotals.bigDonor);
            pacData.push(categoryTotals.pac);
            selfFundingData.push(categoryTotals.selfFunding);
            otherCandidatesData.push(categoryTotals.otherCandidates);
            otherData.push(categoryTotals.other);
        });

        return {
            labels,
            datasets: [
                {
                    label: `Large Dollar (Individual Donations ${bigDonorLimit}+)`,
                    data: largeDollarData,
                    backgroundColor: '#ff5722',
                },
                {
                    label: 'Other',
                    data: otherData,
                    backgroundColor: '#9e9e9e',
                },
                {
                    label: 'PAC',
                    data: pacData,
                    backgroundColor: '#3f51b5',
                },
                {
                    label: 'Small Dollar (Individual Donations <$100)',
                    data: smallDollarData,
                    backgroundColor: '#4caf50',
                },

                {
                    label: 'Self-Funding',
                    data: selfFundingData,
                    backgroundColor: '#9c27b0',
                },
                {
                    label: 'Other Candidates',
                    data: otherCandidatesData,
                    backgroundColor: '#ffc107',
                },
            ],
        };
    }, [cityProfileData, selectedDateRange]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        return `${context.dataset.label}: $${value.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true },
        },
    };

    return (
        <div id="contribution-bar-chart-wrapper">
            <h2>Donor Summary</h2>
            <h4>
                <i>
                    Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}
                </i>
            </h4>
            <Bar data={chartData} options={options} width="100%"/>
\        </div>
    );
}

export default StackedBarChartDonorSummary;
