// Function to calculate the total sum of contributions that exceed the respective limits
function calculateExcessContributions(data, startDate, endDate, limitNonPAC, limitPAC) {
    let excessSum = 0;
    Object.keys(data).forEach(true_name => {
        let total_contributed = 0
        const name = true_name;
        const limit = name.includes('PAC') ? limitPAC : limitNonPAC;

        data[true_name].children.forEach(child => {
            const isodatestring = child["TransactionDate"].replace(" ","T")
            const transactionDate = new Date(isodatestring);

            if (transactionDate >= startDate && transactionDate <= endDate) {
                const amount = child["Amount"];
                total_contributed += amount
            }
        });

        // Calculate the excess amount
        if (total_contributed > limit) {
            excessSum += (total_contributed - limit);
        }
    });

    return excessSum;
}

function Highlights({aggregated_data, contribution_data}) {
    const data = contribution_data
    // Count the number of records with an amount less than $100
    const grassroots_count = data ? data.filter(item => item["Amount:"] < 100).length : 0
    // Calculate the percentage
    const grassroots_percentage = Math.round((grassroots_count / data.length) * 100);

    // Count records with an amount equal to or greater than $1000
    const count = data.filter(item => item["Amount:"] >= 1000).length;
    // Calculate the percentage
    const big_donor_percentage = Math.round((count / data.length) * 100);


    // Count the number of records with "Dallas" in the address
    const dallas_count = data.filter(item => item.Address.includes("Dallas")).length;
    // Subtract count from the total in order to get the records that DO NOT originate from Dallas
    const non_dallas_count = data.length - dallas_count
    // Calculate the percentage
    const non_dallas_percentage = Math.round((non_dallas_count / data.length) * 100);

    // Define election cycles and limits
    const electionCycles = [
        { startDate: new Date('2017-05-05'), endDate: new Date('2019-05-04'), limitNonPAC: 1000, limitPAC: 2500 },
        { startDate: new Date('2019-05-05'), endDate: new Date('2021-05-04'), limitNonPAC: 1000, limitPAC: 2500 },
        { startDate: new Date('2021-05-05'), endDate: new Date('2023-05-04'), limitNonPAC: 1000, limitPAC: 2500 },
        { startDate: new Date('2023-05-05'), endDate: new Date('2025-05-04'), limitNonPAC: 1000, limitPAC: 2500 }
    ];

    // Calculate the excess contributions for each election cycle
    let totalExcessContributions = 0;
    electionCycles.forEach(cycle => {
        totalExcessContributions += calculateExcessContributions(
            aggregated_data,
            cycle.startDate,
            cycle.endDate,
            cycle.limitNonPAC,
            cycle.limitPAC
        );
    });

    totalExcessContributions = Math.round(totalExcessContributions)
    return (
        <div className="section" id="highlights">
            <h2>Highlights</h2>
            <div className="box-container">
                <div className="box-wrapper">
                    <div className="box green">{grassroots_percentage}%</div>
                    <div className="box-title">Small Donor Support<br/>(Contributions Less than $100)</div>
                </div>
                <div className="box-wrapper">
                    <div className="box red" id="BigDonorSupport">{big_donor_percentage}%</div>
                    <div className="box-title">Big Donor Support<br/>(Contributions of $1000 or More)</div>
                </div>
                <div className="box-wrapper">
                    <div className="box red" id="ExternalSupport">{non_dallas_percentage}%</div>
                    <div className="box-title">External Support (Non-Dallas Contributions)</div>
                </div>
                <div className="box-wrapper">
                    <div className="box red" id="AboveLimitSupport">${totalExcessContributions.toLocaleString()}</div>
                    <div className="box-title">Above-Limit Support ($1,000 limit for individuals; $2,500 limit for PACs)</div>
                </div>
            </div>
        </div>
    );
  }
  
  export default Highlights;
  
  
  