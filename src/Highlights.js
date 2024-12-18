import React, { useMemo } from 'react';

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

        if (total_contributed > limit) {
            excessSum += (total_contributed - limit);
        }
    });

    return excessSum;
}

function Highlights({profile, aggregated_data, contribution_data, selectedDateRange}) {
    const data = useMemo(() => {
        if (selectedDateRange === 'all') {
            return contribution_data;
        }
        const { start, end } = selectedDateRange;
        return contribution_data.filter(record => {
            const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
            return transactionDate >= start && transactionDate <= end;
        });
    }, [contribution_data, profile, selectedDateRange]);

    let total_contributions = 0
    data.forEach(record => {
        total_contributions += record[profile.contribution_fields.Amount]
    });

    const in_city_sum = data
        .filter(item => (item[profile.contribution_fields.Address].includes(profile.city) || (profile.contribution_fields.City_State_Zip ? item[profile.contribution_fields.City_State_Zip].includes(profile.city) : false)))
        .reduce((total, item) => total + item[profile.contribution_fields.Amount], 0);

    let outside_city_sum = Math.round((total_contributions || 0) - (in_city_sum || 0));

    let outside_city_percentage = total_contributions 
        ? Math.round((outside_city_sum / total_contributions) * 100) 
        : 0;

    let totalExcessContributions = calculateExcessContributions(
            aggregated_data,
            selectedDateRange.start,
            selectedDateRange.end,
            profile.individual_limit,
            profile.pac_limit
        )

    totalExcessContributions = Math.round(totalExcessContributions)
    return (
        <div className="section" id="highlights">
            <h1>Highlights</h1>
            <h4><i>Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i></h4>
            <div className="box-container">
                <div className="box-wrapper">
                    <div id="ExternalSupport">{outside_city_percentage}%</div>
                    <div className="box-title">EXTERNAL DONATIONS </div>
                    <div className="box-subtitle">Non-{profile.city} Contributions</div>
                </div>

                <div className="box-wrapper">
                    <div id="TotalContributions">${total_contributions.toLocaleString()}</div>
                    <div className="box-title">TOTAL DONATIONS</div>
                </div>

                <div className="box-wrapper">
                    <div id="AboveLimitSupport">${totalExcessContributions.toLocaleString()}</div>
                    <div className="box-title">ABOVE-LIMIT DONATIONS</div>
                    <div className="box-subtitle">${profile.individual_limit} Limit for Individuals <br></br> ${profile.pac_limit} Limit for PACs</div>
                </div>

            </div>
        </div>
    );
  }
  
  export default Highlights;
  
  
  