import React, { useEffect, useState, useMemo } from 'react';
import '../index.css';
import { useOutletContext, useParams } from "react-router-dom";
import ProfileStream from '../ProfileStream';
import Header from '../Header';
import { getCityProfiles } from "../Cities";
import StackedBarChartDonorSummary from '../StackedBarChartDonorSummary';
import ElectionCycleDropdown from '../ElectionCycleDropdown';
import IndividualContributionsTable from '../IndividualContributionsTable';
import CumulativeContributionsTimeline from '../CumulativeContributionsTimeline';
import PACFundingBarChart from '../PACFundingBarChart';
import HeatmapMap from '../HeatmapMap';

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

const geocodedData2 = [
    { lat: 32.74, lng: -96.83, amount: 50 },
    { lat: 32.84, lng: -96.70, amount: 250 },
    { lat: 32.75, lng: -96.82, amount: 50 },
    { lat: 32.75, lng: -96.83, amount: 100 },
    { lat: 32.87, lng: -96.76, amount: 200 },
    { lat: 32.90, lng: -96.78, amount: 250 },
    { lat: 32.91, lng: -96.89, amount: 1000 },
    { lat: 32.78, lng: -96.83, amount: 250 },
  ];

const geocodedData3 = [
    { lat: 32.747, lng: -96.838, amount: 50 },
    { lat: 32.840, lng: -96.705, amount: 250 },
    { lat: 32.751, lng: -96.828, amount: 50 },
    { lat: 32.755, lng: -96.839, amount: 100 },
    { lat: 32.879, lng: -96.769, amount: 200 },
    { lat: 32.906, lng: -96.783, amount: 250 },
    { lat: 32.919, lng: -96.896, amount: 1000 },
    { lat: 32.786, lng: -96.834, amount: 250 },
  ];

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

            <HeatmapMap points={geocodedData2} />
            
            <span className='side-by-side'>
                <StackedBarChartDonorSummary cityProfileData={cityProfileData} selectedDateRange={selectedDateRange} />
                <CumulativeContributionsTimeline cityProfileData={cityProfileData} selectedDateRange={selectedDateRange} />
            </span>

            <PACFundingBarChart 
                allContributions={allContributions} />

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
