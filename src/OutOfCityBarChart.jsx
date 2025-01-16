import React from 'react';
import { Bar } from 'react-chartjs-2';
import './index.css';

const OutOfCityBarChart = ({ cityProfileData, selectedDateRange }) => {
    let all_profiles_total_contributions = {}
    
    cityProfileData.forEach(profile => {
        const filteredData = selectedDateRange === 'all'
            ? profile.contributions
            : profile.contributions.filter(record => {
                const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
                return transactionDate >= selectedDateRange.start && transactionDate <= selectedDateRange.end;
            });
        
        all_profiles_total_contributions[profile.name] = {total_contributions: 0, in_city_sum: 0}

        filteredData.forEach(record => {
            all_profiles_total_contributions[record.Recipient].total_contributions += record.Contribution_Amount;
        })
        
        const in_city_sum = filteredData
                .filter(item => (item[profile.contribution_fields.Address].includes(profile.city) || (profile.contribution_fields.City_State_Zip ? item[profile.contribution_fields.City_State_Zip].includes(profile.city) : false)))
                .reduce((total, item) => total + item[profile.contribution_fields.Amount], 0);

        const outside_city_sum = Math.round((all_profiles_total_contributions[profile.name].total_contributions || 0) - (in_city_sum || 0));

        all_profiles_total_contributions[profile.name].in_city_sum = in_city_sum
        all_profiles_total_contributions[profile.name].outside_city_sum = outside_city_sum
    });


   

    

    return (
        <div className="section" id="out-of-city-wrapper-agg">
            <h2>
              External Support (Non-{cityProfileData[0].city} Contributions)
            </h2>
            <h4>
                <i>
                    Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}
                </i>
            </h4>

            <Bar
                data={{
                  labels: cityProfileData.map((profile) => profile.name),
                  datasets: [
                    {
                      label: `Contributions from outside of ${cityProfileData[0].city}  ($)`,
                      data: cityProfileData.map((profile) => all_profiles_total_contributions[profile.name]?.outside_city_sum || 0),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Name',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: `Contributions from outside of ${cityProfileData[0].city}  ($)`,
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />
          </div>
      );
    };

export default OutOfCityBarChart;
