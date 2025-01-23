import React, { useEffect, useState, useMemo } from 'react';
import '../index.css';
import { useOutletContext, useParams } from "react-router-dom";
import ProfileStream from '../ProfileStream';
import Header from '../Header';
import OutOfCityBarChart from '../OutOfCityBarChart';
import { getCityProfiles } from "../Cities";
import StackedBarChartDonorSummary from '../StackedBarChartDonorSummary';
import ElectionCycleDropdown from '../ElectionCycleDropdown';
import IndividualContributionsTable from '../IndividualContributionsTable';
import CumulativeContributionsTimeline from '../CumulativeContributionsTimeline';

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
    const election_cycle_years = profiles[0].election_cycle_years;

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
    const { cityId } = useParams();
    const { city_config } = useOutletContext();

    const [cityProfileData, setCityProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState(null);

    // Fetch city profile data
    useEffect(() => {
        const fetchCityData = async () => {
            try {
                const data = await getCityProfiles(cityId);
                setCityProfileData(data);
            } catch (err) {
                setError("Failed to load city profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchCityData();
    }, [cityId]);

    // Generate election cycles using useMemo
    const electionCycles = useMemo(() => {
        return cityProfileData ? generateElectionCycles(cityProfileData) : [];
    }, [cityProfileData]);

    // Set selected date range once election cycles are available
    useEffect(() => {
        if (electionCycles.length > 0) {
            setSelectedDateRange({
                start: electionCycles[0].start,
                end: electionCycles[electionCycles.length - 1].end,
            });
        }
    }, [electionCycles]);

    // Flatten contributions
    const allContributions = useMemo(() => {
        return cityProfileData
            ? cityProfileData.flatMap(profile =>
                  profile.contributions.map(contribution => ({
                      profileName: profile.name,
                      ...contribution,
                  }))
              )
            : [];
    }, [cityProfileData]);

    // Handle loading and error states
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!electionCycles.length || !selectedDateRange) {
        return <div>Preparing data...</div>;
    }
    return (
        <div>
            <ElectionCycleDropdown
                electionCycles={electionCycles}
                selectedDateRange={selectedDateRange}
                setSelectedDateRange={setSelectedDateRange}
            />
            <Header city={city_config.name} profile={city_config} />
            <StackedBarChartDonorSummary cityProfileData={cityProfileData} selectedDateRange={selectedDateRange} />
            <CumulativeContributionsTimeline cityProfileData={cityProfileData} selectedDateRange={selectedDateRange} />
            <ProfileStream cityId={cityId} cityProfileData={cityProfileData} />
            <IndividualContributionsTable
                profile={cityProfileData?.[0]}
                contribution_data={allContributions}
                selectedDateRange={selectedDateRange}
            />
        </div>
    );
}

export default City;
