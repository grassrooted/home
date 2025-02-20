import React from "react";
import Highcharts from "highcharts";
import HighchartsSunburst from "highcharts/modules/sunburst";
import HighchartsReact from "highcharts-react-official";
import './ExpenditureCategoryPieChart.css';

// Properly initialize the module
if (typeof HighchartsSunburst === "function") {
    HighchartsSunburst(Highcharts);
}

const ExpendituresCategorySunburstChart = ({ records, profile }) => {
    // Aggregate amounts by category
    const categoryTotals = records.reduce((acc, record) => {
        acc[record.Category] = (acc[record.Category] || 0) + Math.round(record.Amount);
        return acc;
    }, {});

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategories = sortedCategories.slice(0, 5);

    // Prepare Sunburst chart data
    let sunburstData = [
        { id: "root", name: "Expenses", color: "#ffffff" },
    ];

    topCategories.forEach(([category, amount], index) => {
        const categoryId = `category-${index}`;
        sunburstData.push({
            id: categoryId,
            parent: "root",
            name: category,
            value: amount,
            color: ["#4E5D89", "#D7816A", "#7A3333", "#5C6B8A", "#A45C5C"][index],
        });

        // Aggregate records by Name within each category
        const nameTotals = records
            .filter(record => record.Category === category)
            .reduce((acc, record) => {
                acc[record.Name] = (acc[record.Name] || 0) + Math.round(record.Amount);
                return acc;
            }, {});

        const sortedNames = Object.entries(nameTotals).sort((a, b) => b[1] - a[1]);
        const topNames = sortedNames.slice(0, 5);
        const otherTotal = sortedNames.slice(5).reduce((sum, [, value]) => sum + value, 0);

        topNames.forEach(([name, total]) => {
            sunburstData.push({
                id: `record-${category}-${name}`,
                parent: categoryId,
                name: name,
                value: total,
            });
        });

        if (otherTotal > 0) {
            sunburstData.push({
                id: `record-${category}-other`,
                parent: categoryId,
                name: "Other",
                value: otherTotal,
            });
        }
    });

    const options = {
        chart: {
            height: null, // Auto height for responsiveness
            width: null,  // Auto width for responsiveness
            backgroundColor: "#000000",
            spacing: [10, 10, 10, 10], // Consistent padding
        },
        title: {
            text: "Top 5 Expense Categories +<br> Top 5 Recipients",
            style: { color: "#ffffff", fontSize: "18px" }
        },
        tooltip: {
            formatter: function () {
                return `<b>${this.point.name}</b>: $${this.y}`;
            }
        },
        series: [{
            type: "sunburst",
            data: sunburstData,
            allowDrillToNode: true,
            levels: [
                {
                    level: 1,
                    colorByPoint: true,
                    dataLabels: { color: "#ffffff", style: { fontSize: "14px" } },
                },
                {
                    level: 2,
                    colorVariation: { key: "brightness", to: -0.5 },
                    dataLabels: { color: "#ffffff", style: { fontSize: "12px" } },
                },
            ],
        }],
        responsive: {
            rules: [{
                condition: { maxWidth: 480 },
                chartOptions: {
                    title: { style: { fontSize: "14px" } },
                    tooltip: { enabled: false }, // Hide tooltips on mobile
                    series: [{
                        levels: [
                            {
                                level: 1,
                                dataLabels: { enabled: false } // Hide labels for cleaner mobile UI
                            },
                            {
                                level: 2,
                                dataLabels: { enabled: false }
                            }
                        ]
                    }]
                }
            }]
        }
    };    

    return (
        <div className="section" id="expenditure-category-section">
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
};

export default ExpendituresCategorySunburstChart;