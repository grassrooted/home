import ProfileSnapshot from '../ProfileSnapshot';
import { getProfile, getProfiles } from '../Profiles'
import TimelineChart from '../TimelineChart';
import { useLoaderData } from "react-router-dom";
import '../index.css';
import React, { useState } from 'react';

export async function loader({ params }) {
    const data = await getProfile(params.profileId);
    const id = params.profileId
    const profiles = await getProfiles()
    const profile = profiles.find(p => p.id === id);

    return { data, profile,  id};
}

// Function to calculate the total sum of contributions that exceed the respective limits
function calculateExcessContributions(data, startDate, endDate, limitNonPAC, limitPAC) {
    let excessSum = 0;

    data.forEach(record => {
        const transactionDate = new Date(record["Transaction Date:"]);
        if (transactionDate >= startDate && transactionDate <= endDate) {
            const amount = record["Amount:"];
            const name = record["Name"];
            let limit = limitNonPAC;

            // Check if the donor is a PAC
            if (name.includes('PAC')) {
                limit = limitPAC;
            }

            // Calculate the excess amount
            if (amount > limit) {
                excessSum += (amount - limit);
            }
        }
    });

    return excessSum;
}

function Profile() {
    const res = useLoaderData();
    const contribution_data = res.data;
    const profile = res.profile;

    // State to keep track of the selected profile
    const [selectedMap, setSelectedMap] = useState(profile.path_to_maps[0]);

    // Count the number of records with an amount less than $100
    const grassroots_count = contribution_data ? contribution_data.filter(item => item["Amount:"] < 100).length : 0
    // Calculate the percentage
    const grassroots_percentage = Math.round((grassroots_count / contribution_data.length) * 100);

    // Count records with an amount equal to or greater than $1000
    const count = contribution_data.filter(item => item["Amount:"] >= 1000).length;
    // Calculate the percentage
    const big_donor_percentage = Math.round((count / contribution_data.length) * 100);


    // Count the number of records with "Dallas" in the address
    const dallas_count = contribution_data.filter(item => item.Address.includes("Dallas")).length;
    // Subtract count from the total in order to get the records that DO NOT originate from Dallas
    const non_dallas_count = contribution_data.length - dallas_count
    // Calculate the percentage
    const non_dallas_percentage = Math.round((non_dallas_count / contribution_data.length) * 100);

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
            contribution_data,
            cycle.startDate,
            cycle.endDate,
            cycle.limitNonPAC,
            cycle.limitPAC
        );
    });

    totalExcessContributions = Math.round(totalExcessContributions)

    // Handler for when the select value changes
    const handleMapChange = (event) => {
        setSelectedMap(event.target.value);
    };

    return (
        <div>
            <ProfileSnapshot profile = {profile} />

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

            <div className="section" id="donor-map">
                <h2>
                    Contributions Across Dallas
                </h2>
                <h4>
                    <i id="map-subtitle"></i>
                </h4>
                <label htmlFor="map-cycleFilter">Filter by Election Cycle:</label>
                <select id="map-cycleFilter" value={selectedMap} onChange={handleMapChange}>
                    {profile.path_to_maps.map((src, index) => (
                    <option key={index} value={src}>
                        {src}
                    </option>
                    ))}
                </select>
                <img src={selectedMap} alt={selectedMap} />
            </div>

            <div className="section" id="timeline">
                <h2>Individual Contributions Timeline</h2>
                <TimelineChart contribution_data={contribution_data} />
            </div>

        </div>
    );
}
  
  export default Profile;
  
  
  