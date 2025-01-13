import React from 'react';
import { Bar } from 'react-chartjs-2';

const CompareHighlights = ({ city_profile_data, selectedDateRange }) => {
    let all_profiles_total_contributions = {}
    
    city_profile_data.forEach(profile => {
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
        <div>
            <div style={{ marginBottom: '40px' }}>
              <Bar
                data={{
                  labels: city_profile_data.map((profile) => profile.name),
                  datasets: [
                    {
                      label: 'Total Contributions',
                      data: city_profile_data.map((profile) => all_profiles_total_contributions[profile.name]?.total_contributions || 0),
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
                        text: 'Total Contributions ($)',
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />


            <Bar
                data={{
                  labels: city_profile_data.map((profile) => profile.name),
                  datasets: [
                    {
                      label: 'Contributions from outside of the city ($)',
                      data: city_profile_data.map((profile) => all_profiles_total_contributions[profile.name]?.outside_city_sum || 0),
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
                        text: 'Contributions from outside of the city ($)',
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
        </div>
      );
    };

export default CompareHighlights;
