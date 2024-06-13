import ProfileSnapshot from '../ProfileSnapshot';
import { getProfile, getProfiles } from '../Profiles'
import { useLoaderData } from "react-router-dom";
export async function loader({ params }) {
    const data = await getProfile(params.profileId);
    const id = params.profileId
    const profiles = await getProfiles()
    const profile = profiles.find(p => p.id === id);

    return { data, profile,  id};
}

function Profile() {
    const res = useLoaderData();
    const contribution_data = res.data;
    const profile = res.profile;
  
    // Count the number of records with an amount less than 100
    const grassroots_count = contribution_data ? contribution_data.filter(item => item["Amount:"] < 100).length : 0
    // Calculate the percentage
    const grassroots_percentage = Math.round((grassroots_count / contribution_data.length) * 100);
    return (
        <div className="section">
            <ProfileSnapshot profile = {profile} />

            <div className="section" id="highlights">
                <h2>Highlights</h2>
                <div className="box-container">
                    <div className="box-wrapper">
                        <div className="box green">{grassroots_percentage}%</div>
                        <div className="box-title">Small Donor Support<br/>(Contributions Less than $100)</div>
                    </div>
                    <div className="box-wrapper">
                        <div className="box red" id="BigDonorSupport"></div>
                        <div className="box-title">Big Donor Support<br/>(Contributions of $1000 or More)</div>
                    </div>
                    <div className="box-wrapper">
                        <div className="box red" id="ExternalSupport"></div>
                        <div className="box-title">External Support (Non-Dallas Contributions)</div>
                    </div>
                    <div className="box-wrapper">
                        <div className="box red" id="AboveLimitSupport"></div>
                        <div className="box-title">Above-Limit Support ($1,000 limit for individuals; $2,500 limit for PACs)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
  
  export default Profile;
  
  
  