import ProfileSnapshot from '../ProfileSnapshot';
import { getProfile, getProfiles } from '../Profiles';
import TimelineChart from '../TimelineChart';
import ContributionsBarChart from '../ContributionsBarChart';
import { useLoaderData } from "react-router-dom";
import '../index.css';
import Highlights from '../Highlights';
import ContributionsMap from '../ContributionsMap';
import IndividualContributionsTable from '../IndividualContributionsTable';
import AggregatedDataTable from '../AggregatedDataTable';
import Header from '../Header';
import ContributionPieChart from '../ContributionPieChart';
import { useState } from 'react';

export async function loader({ params }) {
    const data = await getProfile(params.profileId);
    const id = params.profileId;
    const profiles = await getProfiles();
    const profile = profiles.find(p => p.id === id);

    return { data, profile, id, profiles };
}

const aggregateDataByName = (data, profile) => {
    return data.reduce((acc, contribution) => {
        const normalizedName = contribution[profile.contribution_fields.Donor].toLowerCase();
        if (!acc[normalizedName]) {
            acc[normalizedName] = {
                Amount: 0,
                Campaign: contribution[profile.contribution_fields.Recipient],
                Name: contribution[normalizedName], // Keep the original name for display
                Address: contribution[profile.contribution_fields.Address],
                children: [] // Initialize the children array for transactions
            };
        }
        acc[normalizedName].Amount += contribution[profile.contribution_fields.Amount];
        acc[normalizedName].children.push({
            Amount: contribution[profile.contribution_fields.Amount],
            Campaign: contribution[profile.contribution_fields.Recipient],
            TransactionDate: contribution[profile.contribution_fields.Transaction_Date],
            Latitude: contribution[profile.contribution_fields.Latitude],
            Longitude: contribution[[profile.contribution_fields.Longitude]],
            Name: contribution[profile.contribution_fields.Donor], // Keep the original name for display
            Address: contribution[profile.contribution_fields.Address]
        });
        return acc;
    }, {});
};

const generateElectionCycles = (profile) => {
    const { first_election, next_election, election_date, election_cycle_years } = profile;

    const electionCycles = [];
    let year = parseInt(first_election, 10);
    const nextElectionYear = parseInt(next_election, 10);
    const [month, day] = election_date.split('-').map(Number);

    while (year <= nextElectionYear) {
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
    const contribution_data = res.data;
    const profile = res.profile;
    const profiles = res.profiles;

    const aggregated_data = aggregateDataByName(contribution_data, profile);

    const electionCycles = generateElectionCycles(profile);

    // Default to the full range of election cycles
    const [selectedDateRange, setSelectedDateRange] = useState({
        start: electionCycles[0].start,
        end: electionCycles[electionCycles.length - 1].end,
    });

    const handleDateRangeChange = (event) => {
        const cycleIndex = parseInt(event.target.value, 10);
        if (cycleIndex === -1) {
            // "All Data" selected
            setSelectedDateRange({
                start: electionCycles[0].start,
                end: electionCycles[electionCycles.length - 1].end,
            });
        } else {
            const selectedCycle = electionCycles[cycleIndex];
            setSelectedDateRange(selectedCycle);
        }
    };

    return (
        <div>
            <Header city={profile.city} profile={profile} />

            <label>Filter by Election Cycle: </label>
            <select onChange={handleDateRangeChange} value={electionCycles.indexOf(selectedDateRange)}>
                <option value={-1}>All Data</option>
                {electionCycles.map((cycle, index) => (
                    <option key={index} value={index}>
                        {cycle.start.toDateString()} thru {cycle.end.toDateString()}
                    </option>
                ))}
            </select>

            <ProfileSnapshot profile={profile} />

            <Highlights 
                profile={profile} 
                aggregated_data={aggregated_data} 
                contribution_data={contribution_data} />

            {profile.path_to_maps ? <ContributionsMap profile={profile} /> : <br></br>}

            <ContributionPieChart
                profile={profile}
                contribution_data={contribution_data}
                profiles={profiles} 
                selectedDateRange={selectedDateRange}/>

            <TimelineChart 
                profile={profile} 
                contribution_data={contribution_data} />

            <ContributionsBarChart 
                profile={profile} 
                contribution_data={contribution_data}
                selectedDateRange={selectedDateRange} />

            <AggregatedDataTable 
                profile={profile} 
                contribution_data={contribution_data}
                selectedDateRange={selectedDateRange} />

            <IndividualContributionsTable 
                profile={profile} 
                contribution_data={contribution_data}
                selectedDateRange={selectedDateRange} />
        </div>
    );
}

export default Profile;
