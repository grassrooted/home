import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './CumulativeContributionsTimeline.css';

function CumulativeContributionsTimeline({ cityProfileData, selectedDateRange }) {
    const chartData = useMemo(() => {
        const datasets = cityProfileData.map((profile, index) => {
            const contributions = profile.contributions || [];
            const filteredContributions = selectedDateRange === 'all'
                ? contributions
                : contributions.filter(contribution => {
                    const contributionDate = new Date(contribution[profile.contribution_fields.Transaction_Date]);
                    return contributionDate >= selectedDateRange.start && contributionDate <= selectedDateRange.end;
                });

            const cumulativeData = [];
            let cumulativeSum = 0;

            filteredContributions
                .sort((a, b) => new Date(a[profile.contribution_fields.Transaction_Date]) - new Date(b[profile.contribution_fields.Transaction_Date]))
                .forEach(contribution => {
                    cumulativeSum += contribution[profile.contribution_fields.Amount];
                    cumulativeData.push({
                        x: new Date(contribution[profile.contribution_fields.Transaction_Date]),
                        y: cumulativeSum,
                    });
                });

            return {
                label: profile.name,
                data: cumulativeData,
                borderColor: `hsl(${index * 60}, 70%, 50%)`,
                backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
                tension: 0.3,
                fill: true,
            };
        });

        return {
            datasets,
        };
    }, [cityProfileData, selectedDateRange]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',  
                labels: {
                    usePointStyle: true,
                },
            },
            tooltip: {
                callbacks: {
                    label: context => {
                        return `${context.dataset.label}: $${context.raw.y.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                    tooltipFormat: 'MMM dd, yyyy',
                },
                title: {
                    display: true,
                    text: 'Date',
                    color: '#555',
                    font: {
                        size: 14,
                    },
                },
                grid: {
                    color: '#e0e0e0',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Cumulative Contributions ($)',
                    color: '#555',
                    font: {
                        size: 14,
                    },
                },
                grid: {
                    color: '#e0e0e0',
                },
            },
        },
    };

    return (
        <div id="timeline-graph-container">
            <h1 id="timeline-graph-title">Cumulative Contribution Timeline</h1>
            <p id="timeline-graph-description">
                This graph shows the cumulative contributions received by each candidate over time.
            </p>
            <div id="cumulative-contributions-line-chart-wrapper">
                <Line data={chartData} options={options} width="100%"/>
            </div>
            <div className="scrollable-legend">
                <div className="chartjs-legend">
                </div>
            </div>
        </div>
    );
}

export default CumulativeContributionsTimeline;
