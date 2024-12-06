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
import MainBanner from '../MainBanner';
import Footer from '../Footer';

export async function loader({ params }) {
    const data = await getProfile(params.profileId);
    console.log(data)
    const id = params.profileId;
    const profiles = await getProfiles();
    const profile = profiles.find(p => p.id === id);

    return { data, profile,  id};
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

function Profile() {
    const res = useLoaderData();
    let contribution_data = res.data;
    let profile = res.profile;

    let aggregated_data = aggregateDataByName(contribution_data, profile);
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
            <MainBanner />
            <Header 
                profile={profile}/>

            <ProfileSnapshot 
                profile={profile} />

            <Highlights 
                profile={profile} 
                aggregated_data={aggregated_data} 
                contribution_data={contribution_data} />

            {profile.path_to_maps ? <ContributionsMap profile={profile} /> : <br></br>}

            <TimelineChart 
                profile={profile} 
                contribution_data={contribution_data} />

            <ContributionsBarChart 
                profile={profile} 
                dateRanges={dateRanges} 
                contribution_data={contribution_data}/>

            <AggregatedDataTable 
                profile={profile} 
                dateRanges={dateRanges} 
                contribution_data={contribution_data} />

            <IndividualContributionsTable 
                profile={profile} 
                dateRanges={dateRanges} 
                contribution_data={contribution_data}/>
            <Footer />
        </div>
    );
}
  
  export default Profile;
  
  
  