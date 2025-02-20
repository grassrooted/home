import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from "react-router-dom";
import ProfileSnapshot from '../ProfileSnapshot';
import { getProfile, getProfiles } from '../Profiles';
import TimelineChart from '../TimelineChart';
import ContributionsBarChart from '../ContributionsBarChart';
import MembershipList from '../MembershipList';
import Highlights from '../Highlights';
import IndividualContributionsTable from '../IndividualContributionsTable';
import AggregatedDataTable from '../AggregatedDataTable';
import AggregatedExpendituresTable from '../AggregatedExpendituresTable';
import Header from '../Header';
import ContributionPieChart from '../ContributionPieChart';
import ElectionCycleDropdown from '../ElectionCycleDropdown';
import '../index.css';
import ExpendituresCategoryPieChart from '../ExpendituresCategoryPieChart';
import FoodExpenditureAnalysis from '../FoodExpenditureAnalysis';
import DonationList from '../DonationList';
import DonorVolunteerLineGraph from '../DonorVolunteerLineGraph';

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
    let year = parseInt(first_election, 10) - election_cycle_years;
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
    const { profileId } = useParams();
    const [profile, setProfile] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedProfile = await getProfile(profileId);
                const fetchedProfiles = await getProfiles();
                setProfile(fetchedProfile);
                setProfiles(fetchedProfiles);
            } catch (err) {
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profileId]);

    const aggregatedData = useMemo(() => {
        return profile ? aggregateDataByName(profile.contributions, profile) : {};
    }, [profile]);

    const electionCycles = useMemo(() => {
        return profile ? generateElectionCycles(profile) : [];
    }, [profile]);

    const [selectedDateRange, setSelectedDateRange] = useState(null);

    useEffect(() => {
        if (electionCycles.length > 0) {
            setSelectedDateRange({
                start: electionCycles[0].start,
                end: electionCycles[electionCycles.length - 1].end,
            });
        }
    }, [electionCycles]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!profile || !electionCycles.length || !selectedDateRange) return <div>Preparing data...</div>;

    return (
        <div>
            <ElectionCycleDropdown 
                electionCycles={electionCycles} 
                selectedDateRange={selectedDateRange} 
                setSelectedDateRange={setSelectedDateRange} />

            <Header 
                city={profile.city} 
                profile={profile} />

            <ProfileSnapshot 
                profile={profile} />


            <Highlights 
                profile={profile}
                aggregated_data={aggregatedData}
                contribution_data={profile.contributions}
                selectedDateRange={selectedDateRange}/>

            <TimelineChart 
                profile={profile}
                contribution_data={profile.contributions}
                expenditure_data={profile.expenditures}/>

            <span className='side-by-side' id="text-data-box">
                <MembershipList 
                    expenditure_data={profile.expenditures}/>
                    
                <FoodExpenditureAnalysis
                    expenditure_data={profile.expenditures} />

                <DonationList
                    expenditure_data={profile.expenditures} />
            </span>


            <span className='side-by-side'>
                <AggregatedDataTable 
                    profile={profile} 
                    contribution_data={profile.contributions}
                    selectedDateRange={selectedDateRange} />

                <AggregatedExpendituresTable
                    profile={profile}
                    expenditure_data={profile.expenditures}
                    selectedDateRange={selectedDateRange}/>
            </span>
            
            <DonorVolunteerLineGraph
                expenditure_data={profile.expenditures} />

            <span className='side-by-side'>
                <ContributionPieChart
                    profile={profile}
                    contribution_data={profile.contributions}
                    profiles={profiles} 
                    selectedDateRange={selectedDateRange} />

                <ExpendituresCategoryPieChart
                    profile={profile}
                    records={profile.expenditures} />
            </span>
            <IndividualContributionsTable 
                profile={profile} 
                contribution_data={profile.contributions}
                selectedDateRange={selectedDateRange} />
        </div>
    );
}

export default Profile;
