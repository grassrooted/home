// Function to calculate the total sum of contributions that exceed the respective limits
function calculateExcessContributions(data, startDate, endDate, limitNonPAC, limitPAC) {
    let excessSum = 0;
    Object.keys(data).forEach(true_name => {
        let total_contributed = 0
        const name = true_name;
        const limit = name.includes('pac') ? limitPAC : limitNonPAC;

        data[true_name].children.forEach(child => {
            const isodatestring = child.TransactionDate.replace(" ","T")
            const transactionDate = new Date(isodatestring);

            if (transactionDate >= startDate && transactionDate <= endDate) {
                const amount = child.Amount;
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

function Highlights({profile, aggregated_data, contribution_data}) {
    const data = contribution_data

    let total_contributions = 0
    data.forEach(record => {
        total_contributions += record[profile.contribution_fields.Amount]
    });

    const in_city_sum = data
        .filter(item => (item[profile.contribution_fields.Address].includes(profile.city) || (profile.contribution_fields.City_State_Zip ? item[profile.contribution_fields.City_State_Zip].includes(profile.city) : false)))
        .reduce((total, item) => total + item[profile.contribution_fields.Amount], 0);

    const outside_city_sum = total_contributions - in_city_sum
    const outside_city_percentage = Math.round((outside_city_sum / total_contributions) * 100);

    // Define election cycles and limits
    const electionCycles = [
        { startDate: new Date('2017-05-05'), endDate: new Date('2019-05-04'), limitNonPAC: profile.individual_limit, limitPAC: profile.pac_limit },
        { startDate: new Date('2019-05-05'), endDate: new Date('2021-05-04'), limitNonPAC: profile.individual_limit, limitPAC: profile.pac_limit },
        { startDate: new Date('2021-05-05'), endDate: new Date('2023-05-04'), limitNonPAC: profile.individual_limit, limitPAC: profile.pac_limit },
        { startDate: new Date('2023-05-05'), endDate: new Date('2025-05-04'), limitNonPAC: profile.individual_limit, limitPAC: profile.pac_limit }
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
            <h1>Highlights</h1>
            <h4><i>Refers to all contribution data.</i></h4>
            <div className="box-container">
                <div className="box-wrapper">
                    <div id="ExternalSupport">{outside_city_percentage}%</div>
                    <div className="box-title">EXTERNAL SUPPORT </div>
                    <div className="box-subtitle">Non-{profile.city} Contributions</div>
                </div>

                <div className="box-wrapper">
                    <div id="TotalContributions">${total_contributions.toLocaleString()}</div>
                    <div className="box-title">TOTAL CONTRIBUTIONS</div>
                </div>

                <div className="box-wrapper">
                    <div id="AboveLimitSupport">${totalExcessContributions.toLocaleString()}</div>
                    <div className="box-title">ABOVE-LIMIT SUPPORT</div>
                    <div className="box-subtitle">${profile.individual_limit} Limit for Individuals <br></br> ${profile.pac_limit} Limit for PACs</div>
                </div>

            </div>
        </div>
    );
  }
  
  export default Highlights;
  
  
  