
let originalData = [];
let aggregatedData = [];

document.addEventListener("DOMContentLoaded", function() {
    fetch('src/candidates/Moreno/Data/moreno_contributions.json')
        .then(response => response.json())
        .then(data => {
            originalData = data;
            // Initialize Tabulator table with fetched data
            var table = new Tabulator("#all-contributors-table", {
                data: data,
                layout: "fitColumns",
                columns: [
                    { title: "Contributor", field: "Name", headerFilter: "input"},
                    {
                        title: "Amount ($)",
                        field: "Amount:",
                        formatter: function(cell, formatterParams, onRendered){
                        // Round the value to 2 decimal places
                        return cell.getValue().toFixed(0);
                }
                    },
                    { title: "Candidate", field: "Cand/Committee:" },
                    { title: "Transaction Date", field: "Transaction Date:" },
                ],
            });
            // Store the table instance globally for later use in filterTable
            window.table = table;
        })
});

function filterRawTable() {
    const cycleFilter = document.getElementById('raw-cycleFilter').value;
    let filteredData = [];

    if (cycleFilter === 'all') {
        filteredData = originalData;
    } else {
        const [startYear, endYear] = cycleFilter.split('-').map(year => parseInt(year.trim()));

        const startDate = new Date(startYear, 4, 5); // May 5 of start year
        const endDate = new Date(endYear, 4, 4, 23, 59, 59, 999); // May 4 of end year, end of the day

        filteredData = originalData.filter(item => {
            const transactionDate = new Date(item["Transaction Date:"]);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    // Update the table data
    window.table.setData(filteredData);
}

function filterContributionsChart() {
    const cycleFilter = document.getElementById('contributions-chart-cycleFilter').value;
    let filteredData = [];

    if (cycleFilter === 'all') {
        filteredData = originalData;
    } else {
        const [startYear, endYear] = cycleFilter.split('-').map(year => parseInt(year.trim()));

        const startDate = new Date(startYear, 4, 5); // May 5 of start year
        const endDate = new Date(endYear, 4, 4, 23, 59, 59, 999); // May 4 of end year, end of the day

        filteredData = originalData.filter(item => {
            const transactionDate = new Date(item["Transaction Date:"]);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    // Update the table data
    window.contributionsChart.setData(filteredData);
}

// Download button event listener
document.getElementById('download-csv').addEventListener('click', function() {
    window.table.download("csv", "filtered_data.csv");
});

document.addEventListener("DOMContentLoaded", function() {
    fetch('src/candidates/Moreno/Data/moreno_contributions.json')
        .then(response => response.json())
        .then(data => {
            // Store raw data globally
            window.rawData = data;

            // Function to aggregate data
            const aggregateData = (data) => {
                return data.reduce((acc, contribution) => {
                    const normalizedName = contribution.Name.toLowerCase();
                    if (!acc[normalizedName]) {
                        acc[normalizedName] = {
                            Amount: 0,
                            Campaign: contribution["Cand/Committee:"],
                            Name: contribution.Name, // Keep the original name for display
                            Address: contribution.Address,
                            children: [] // Initialize the children array for transactions
                        };
                    }
                    acc[normalizedName].Amount += contribution["Amount:"];
                    acc[normalizedName].children.push({
                        ContactType: contribution["Contact Type:"],
                        ReportId: contribution.ReportId,
                        Amount: contribution["Amount:"],
                        Campaign: contribution["Cand/Committee:"],
                        TransactionDate: contribution["Transaction Date:"],
                        Latitude: contribution.Latitude,
                        Longitude: contribution.Longitude,
                        Name: contribution.Name, // Keep the original name for display
                        Address: contribution.Address
                    });
                    return acc;
                }, {});
            };

            // Aggregate initial data
            let aggregatedData = aggregateData(data);
            const tableData = Object.values(aggregatedData);

            // Initialize Tabulator table with tree structure
            const table = new Tabulator("#aggregated-contributions-table", {
                data: tableData,
                layout: "fitColumns",
                columns: [
                    { title: "Contributor", field: "Name", headerFilter: "input" },
                    {
                        title: "Amount ($)",
                        field: "Amount",
                        formatter: function(cell, formatterParams, onRendered){
                            // Round the value to 2 decimal places
                            return cell.getValue().toFixed(0);
                        }
                    },
                    { title: "Candidate", field: "Campaign" },
                    { title: "Transaction Date", field: "TransactionDate" },
                ],
                // Enable tree structure
                dataTree: true,
                dataTreeStartExpanded: false, // Start with tree collapsed
                dataTreeChildField: "children", // Specify the field that contains the children array
                dataTreeBranchElement: "<span style='color:blue;'>&#x25B6;</span>" // Custom branch element for expanded rows
            });

            // Store the table instance globally for later use in filterTable
            window.aggTable = table;

            // Filter data by election year
            window.filterAggTable = function() {
                const selectedYearRange = document.getElementById("agg-cycleFilter").value;
                if (selectedYearRange === "all") {
                    aggTable.setData(Object.values(aggregateData(window.rawData))); // Show all data
                    return;
                }

                const [startYear, endYear] = selectedYearRange.split('-').map(Number);
                const filteredData = window.rawData.filter(contribution => {
                    const transactionDate = new Date(contribution["Transaction Date:"]);
                    const startDate = new Date(`${startYear}-05-04`);
                    const endDate = new Date(`${endYear}-05-05`);
                    return transactionDate >= startDate && transactionDate < endDate;
                });

                aggTable.setData(Object.values(aggregateData(filteredData)));
            };
        });
});


// Function to show the image corresponding to the selected election cycle
function filterImages() {
    var selectedCycle = document.getElementById("map-cycleFilter").value;
    var images = document.querySelectorAll("#image-container img");
    images.forEach(function(img) {
        img.classList.remove("active");
        if (img.id === "img-" + selectedCycle) {
            img.classList.add("active");
        }
    });
}

// Show the default image on page load
document.addEventListener("DOMContentLoaded", function() {
    filterImages();
});


document.addEventListener("DOMContentLoaded", function() {
    fetch('src/candidates/Moreno/Data/moreno_contributions.json')
        .then(response => response.json())
        .then(data => {
            // Count the number of records with an amount less than 100
            const count = data.filter(item => item["Amount:"] < 100).length;
            // Calculate the percentage
            const percentage = Math.round((count / data.length) * 100);

            // Now, assuming you want to display this percentage in the first green box:
            const greenBox = document.querySelector('.green');
            greenBox.textContent = `${percentage}%`;
        })
});

document.addEventListener("DOMContentLoaded", function() {
    fetch('src/candidates/Moreno/Data/moreno_contributions.json')
        .then(response => response.json())
        .then(data => {
            // Count the number of records with an amount greater than 1000
            const count = data.filter(item => item["Amount:"] >= 1000).length;
            // Calculate the percentage
            const percentage = Math.round((count / data.length) * 100);

            // Now, assuming you want to display this percentage in the first green box:
            const greenBox = document.getElementById('BigDonorSupport');
            greenBox.textContent = `${percentage}%`;
        })
});

document.addEventListener("DOMContentLoaded", function() {
    fetch('src/candidates/Moreno/Data/moreno_contributions.json')
        .then(response => response.json())
        .then(data => {
            // Count the number of records with "Dallas" in the address
            const dallas_count = data.filter(item => item.Address.includes("Dallas")).length;

            // Subtract count from the total in order to get the records that DO NOT originate from Dallas
            const non_dallas_count = data.length - dallas_count
            // Calculate the percentage
            const percentage = Math.round((non_dallas_count / data.length) * 100);

            // Now, assuming you want to display this percentage in the first green box:
            const greenBox = document.getElementById('ExternalSupport');
            greenBox.textContent = `${percentage}%`;
        })
});

// Fetch the data and initialize the dropdown and chart
document.addEventListener("DOMContentLoaded", function() {
    fetch('src/candidates/Moreno/Data/moreno_contributions.json')
        .then(response => response.json())
        .then(data => {
            originalData = data;
            filteredData = data;
            generateChart(data);
        });
});

function filterContributionsChart(){
    cycleFilter = document.getElementById("contributions-chart-cycleFilter").value;

    if (cycleFilter === 'all') {
        filteredData = originalData;
    } else {
        const [startYear, endYear] = cycleFilter.split('-').map(year => parseInt(year.trim()));

        const startDate = new Date(startYear, 4, 5); // May 5 of start year
        const endDate = new Date(endYear, 4, 4, 23, 59, 59, 999); // May 4 of end year, end of the day

        filteredData = originalData.filter(item => {
            const transactionDate = new Date(item["Transaction Date:"]);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    generateChart(filteredData);
}

// Function to filter data by year
function filterDataByYear(year) {
    if (year === "all") {
        filteredData = originalData;
    } else {
        filteredData = originalData.filter(item => new Date(item['Transaction Date:']).getFullYear() == year);
    }
}

// Function to generate the chart
function generateChart(data) {
    // Group records into categories based on increments of 100
    const categories = {};
    data.forEach(item => {
        const amount = parseInt(item['Amount:']);
        const category = Math.floor(amount / 100);
        const adjustedCategory = Math.min(category, 11); // Ensure the last category is 9 or less
        categories[adjustedCategory] = (categories[adjustedCategory] || 0) + 1;
    });

    // Extract the counts and labels for the chart
    const counts = Object.values(categories);
    const labels = Object.keys(categories).map(category => {
        const start = parseInt(category) * 100 + 1;
        const end = (parseInt(category) + 1) * 100;
        return (category == 10) ? '$901-$1,000': (category == 11) ? '$1,000+': `$${start} -$${end}`;
    });

    // Destroy previous chart if it exists
    if (window.myChart) {
        window.myChart.destroy();
    }

    // Create the bar chart
    const ctx = document.getElementById('contributions-chart').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Amount Distribution',
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Individual Contributions'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Amount Categories'
                    }
                }
            }
        }
    });
}

// Function to fetch JSON data from a file
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

// Function to aggregate data by date
function aggregateDataByDate(data) {
    const aggregatedData = {};

    data.forEach(record => {
        const date = record["Transaction Date:"].split(' ')[0]; // Extract the date part only
        const amount = record["Amount:"];

        if (!aggregatedData[date]) {
            aggregatedData[date] = 0;
        }
        aggregatedData[date] += amount;
    });

    // Convert the aggregated data object into an array and sort it by date
    return Object.keys(aggregatedData).map(date => ({
        x: new Date(date),
        y: aggregatedData[date]
    })).sort((a, b) => a.x - b.x);
}

// Function to generate the timeline chart
function generateTimelineChart(data) {
    const ctx = document.getElementById('timeline-chart').getContext('2d');

    // Aggregate the data by date
    const aggregatedData = aggregateDataByDate(data);

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Total Contributions',
                data: aggregatedData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                pointStyle: false,
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Transaction Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Amount ($)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch and store the data in the global variable if not already fetched
        if (originalData.length === 0) {
            originalData = await fetchData('src/candidates/Moreno/Data/moreno_contributions.json');
        }
        // Generate the timeline chart using the aggregated data
        generateTimelineChart(originalData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});
