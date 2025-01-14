import '../index.css';
import { useParams } from "react-router"
import { useLoaderData } from "react-router-dom";
import ProfileStream from '../ProfileStream';
import Header from '../Header';
import CompareHighlights from '../CompareHighlights';
import { getCities, getCityProfiles } from "../Cities";
import { getProfiles } from '../Profiles';
import StackedBarChartDonorSummary from '../StackedBarChartDonorSummary';
import React, { useState } from 'react';
import ElectionCycleDropdown from '../ElectionCycleDropdown';
import IndividualContributionsTable from '../IndividualContributionsTable';

export async function loader({params}) {
    const city_profile_data = await getCityProfiles(params.cityId);
    const profiles = await getProfiles();
    const cities = await getCities();

    return { city_profile_data, profiles, cities };
}

const generateElectionCycles = (profiles) => {
    const earliestFirstElection = Math.min(
        ...profiles.map(profile => parseInt(profile.first_election, 10))
    );
    const latestNextElection = Math.max(
        ...profiles.map(profile => parseInt(profile.next_election, 10))
    );

    const smallestCycleYears = Math.min(
        ...profiles.map(profile => profile.election_cycle_years)
    );

    const electionCycles = [];
    let year = earliestFirstElection - smallestCycleYears;
    const [month, day] = profiles[0].election_date.split('-').map(Number);
    const election_cycle_years = profiles[0].election_cycle_years

    while (year < latestNextElection) {
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

function City() {
    const { cityId } = useParams()
    const { profiles, cities, city_profile_data } = useLoaderData();

    console.log(city_profile_data)

    const electionCycles = generateElectionCycles(city_profile_data);
    const [selectedDateRange, setSelectedDateRange] = useState({
        start: electionCycles[0].start,
        end: electionCycles[electionCycles.length - 1].end,
    });

    console.log(electionCycles)

    const city_config = cities.find(city => city.id === cityId);

    let city_profiles = profiles.filter(p => p.city === city_config.name);

    const allContributions = city_profile_data.flatMap((profile) => {
        return profile.contributions.map((contribution) => ({
            profileName: profile.name,
            ...contribution,
        }));
    });

    return (
        <div>
            <Header 
                city={city_config.name} 
                profile={city_config} />

            <ElectionCycleDropdown 
                electionCycles={electionCycles} 
                selectedDateRange={selectedDateRange} 
                setSelectedDateRange={setSelectedDateRange}/>

            <CompareHighlights 
                city_profile_data={city_profile_data}
                selectedDateRange={selectedDateRange} />

            <StackedBarChartDonorSummary 
                cityProfileData={city_profile_data} 
                selectedDateRange={selectedDateRange} />

            <IndividualContributionsTable
                profile={city_profile_data[0]} 
                contribution_data={allContributions}
                selectedDateRange={selectedDateRange} />


            <ProfileStream 
                cityId={cityId} 
                city_profiles={city_profiles}/>

        </div>
    );
}
  
  export default City;
  
  
  