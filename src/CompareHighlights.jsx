import React from 'react';
import { Bar } from 'react-chartjs-2';

const CompareHighlights = ({ profiles, data }) => {
    let all_profiles_total_contributions = {}

    profiles.forEach(profile => {
        all_profiles_total_contributions[profile.name] = {total_contributions: 0}
    })
    
    data.forEach(dataset => {
        dataset.forEach(record => {
            if (!all_profiles_total_contributions[record.Recipient]) {
                all_profiles_total_contributions[record.Recipient] = { total_contributions: record.Contribution_Amount };
            }
            all_profiles_total_contributions[record.Recipient].total_contributions += record.Contribution_Amount;
    })});

    console.log(all_profiles_total_contributions)
    console.log(profiles)
    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
              <Bar
                data={{
                  labels: profiles.map((profile) => profile.name),
                  datasets: [
                    {
                      label: 'Total Contributions',
                      data: profiles.map((profile) => all_profiles_total_contributions[profile.name]?.total_contributions || 0),
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
            </div>
        </div>
      );
    };

export default CompareHighlights;
