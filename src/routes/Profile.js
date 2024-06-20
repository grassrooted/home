import ProfileSnapshot from '../ProfileSnapshot';
import { getProfile, getProfiles } from '../Profiles'
import TimelineChart from '../TimelineChart';
import ContributionsBarChart  from '../ContributionsBarChart';
import { useLoaderData } from "react-router-dom";
import '../index.css';
import Highlights from '../Highlights';
import ContributionsMap from '../ContributionsMap';
import IndividualContributionsTable from '../IndividualContributionsTable';
import AggregatedDataTable from '../AggregatedDataTable';
import Header from '../Header';

export async function loader({ params }) {
    const data = await getProfile(params.profileId);
    const id = params.profileId
    const profiles = await getProfiles()
    const profile = profiles.find(p => p.id === id);

    return { data, profile,  id};
}

const aggregateDataByName = (data) => {
    return data.reduce((acc, contribution) => {
        const normalizedName = contribution.Name.toLowerCase();
        if (!acc[normalizedName]) {
            acc[normalizedName] = {
                Amount: 0,
                Campaign: contribution["Cand/Committee:"],
                Name: contribution.Name, // Keep the original name for display
                Address: contribution.Address,
                children: [] // Initialize the children array for transactions
            };
        }
        acc[normalizedName].Amount += contribution["Amount:"];
        acc[normalizedName].children.push({
            ContactType: contribution["Contact Type:"],
            ReportId: contribution.ReportId,
            Amount: contribution["Amount:"],
            Campaign: contribution["Cand/Committee:"],
            TransactionDate: contribution["Transaction Date:"],
            Latitude: contribution.Latitude,
            Longitude: contribution.Longitude,
            Name: contribution.Name, // Keep the original name for display
            Address: contribution.Address
        });
        return acc;
    }, {});
};

function Profile() {
    const res = useLoaderData();
    let contribution_data = res.data;
    let profile = res.profile;

    let aggregated_data = aggregateDataByName(contribution_data);

    const [month, day] = profile.election_date.split("-");

    // Create date objects for the day after the election day for each relevant year
    const getDateRanges = (year_start, year_end) => {
        let electionDate = new Date(`${year_end}-${month}-${day}`);
        const end_date = new Date(electionDate)
        end_date.setDate(electionDate.getDate() + 1);

        electionDate = new Date(`${year_start}-${month}-${day}`);
        const start_date = new Date(electionDate);
        start_date.setDate(electionDate.getDate() + 2);
        return [start_date, end_date]
    };

    const dateRanges = {
      '2017-2019': getDateRanges(2017, 2019),
      '2019-2021': getDateRanges(2019, 2021),
      '2021-2023': getDateRanges(2021, 2023),
      '2023-2025': getDateRanges(2023, 2025),
    };

    return (
        <div>
            <Header/>
            <ProfileSnapshot profile={profile} />
            <Highlights profile={profile} aggregated_data={aggregated_data} contribution_data={contribution_data} />
            <ContributionsMap profile={profile} />
            <TimelineChart contribution_data={contribution_data} />
            <ContributionsBarChart dateRanges={dateRanges} contribution_data={contribution_data}/>
            <AggregatedDataTable dateRanges={dateRanges} contribution_data={contribution_data} />
            <IndividualContributionsTable dateRanges={dateRanges} contribution_data={contribution_data}/>
        </div>
    );
}
  
  export default Profile;
  
  
  