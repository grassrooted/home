import ProfileSnapshot from '../ProfileSnapshot';
import { getProfile, getProfiles } from '../Profiles';
import TimelineChart from '../TimelineChart';
import ContributionsBarChart from '../ContributionsBarChart';
import { useLoaderData } from "react-router-dom";
import '../index.css';
import Highlights from '../Highlights';
import IndividualContributionsTable from '../IndividualContributionsTable';
import AggregatedDataTable from '../AggregatedDataTable';
import Header from '../Header';
import ContributionPieChart from '../ContributionPieChart';
import ElectionCycleDropdown from '../ElectionCycleDropdown';
import React, { useState } from 'react';


export async function loader({ params }) {
    const profile = await getProfile(params.profileId);
    const id = params.profileId;
    const profiles = await getProfiles();

    return { profile, id, profiles };
}

const aggregateDataByName = (data, profile) => {
    return data.reduce((acc, contribution) => {
        const normalizedName = contribution[profile.contribution_fields.Donor].toLowerCase();
        if (!acc[normalizedName]) {
            acc[normalizedName] = {
                Amount: 0,
                Campaign: contribution[profile.contribution_fields.Recipient],
                Name: contribution[normalizedName],
                Address: contribution[profile.contribution_fields.Address],
                children: []
            };
        }
        acc[normalizedName].Amount += contribution[profile.contribution_fields.Amount];
        acc[normalizedName].children.push({
            Amount: contribution[profile.contribution_fields.Amount],
            Campaign: contribution[profile.contribution_fields.Recipient],
            TransactionDate: contribution[profile.contribution_fields.Transaction_Date],
            Latitude: contribution[profile.contribution_fields.Latitude],
            Longitude: contribution[[profile.contribution_fields.Longitude]],
            Name: contribution[profile.contribution_fields.Donor],
            Address: contribution[profile.contribution_fields.Address]
        });
        return acc;
    }, {});
};

const generateElectionCycles = (profile) => {
    const { first_election, next_election, election_date, election_cycle_years } = profile;

    const electionCycles = [];
    let year = parseInt(first_election, 10)-election_cycle_years;
    const nextElectionYear = parseInt(next_election, 10);
    const [month, day] = election_date.split('-').map(Number);

    while (year < nextElectionYear) {
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year + election_cycle_years, month - 1, day - 1);
        electionCycles.push({
            start: startDate,
            end: endDate,
        });
        year += election_cycle_years;
    }

    return electionCycles;
};

function Profile() {
    const res = useLoaderData();
    const contribution_data = res.profile.contributions;
    const profile = res.profile;
    const profiles = res.profiles;

    const aggregated_data = aggregateDataByName(contribution_data, profile);

    const electionCycles = generateElectionCycles(profile);

    const [selectedDateRange, setSelectedDateRange] = useState({
        start: electionCycles[0].start,
        end: electionCycles[electionCycles.length - 1].end,
    });

    return (
        <div>
            <Header 
                city={profile.city} 
                profile={profile} />

            <ProfileSnapshot 
                profile={profile} />

            <ElectionCycleDropdown 
                electionCycles={electionCycles} 
                selectedDateRange={selectedDateRange} 
                setSelectedDateRange={setSelectedDateRange}/>

            <Highlights 
                profile={profile} 
                aggregated_data={aggregated_data} 
                contribution_data={contribution_data} 
                selectedDateRange={selectedDateRange}
                electionCycles={electionCycles}/>

            <ContributionPieChart
                profile={profile}
                contribution_data={contribution_data}
                profiles={profiles} 
                selectedDateRange={selectedDateRange}/>

            <span className='side-by-side'>
                <AggregatedDataTable 
                    profile={profile} 
                    contribution_data={contribution_data}
                    selectedDateRange={selectedDateRange} />

                <ContributionsBarChart 
                    profile={profile} 
                    contribution_data={contribution_data}
                    selectedDateRange={selectedDateRange} />
            </span>

            <TimelineChart 
                    profile={profile} 
                    contribution_data={contribution_data} />

            <IndividualContributionsTable 
                profile={profile} 
                contribution_data={contribution_data}
                selectedDateRange={selectedDateRange} />
        </div>
    );
}

export default Profile;
