import ProfileSnapshot from '../ProfileSnapshot';
import { getProfile, getProfiles } from '../Profiles'
import TimelineChart from '../TimelineChart';
import { useLoaderData } from "react-router-dom";
import '../index.css';
import Highlights from '../Highlights';
import ContributionsMap from '../ContributionsMap';

export async function loader({ params }) {
    const data = await getProfile(params.profileId);
    const id = params.profileId
    const profiles = await getProfiles()
    const profile = profiles.find(p => p.id === id);

    return { data, profile,  id};
}

function Profile() {
    const res = useLoaderData();
    let contribution_data = res.data;
    let profile = res.profile;

    return (
        <div>
            <ProfileSnapshot profile = {profile} />
            <Highlights contribution_data={contribution_data} />
            <ContributionsMap profile={profile} />

            <TimelineChart contribution_data={contribution_data} />



        </div>
    );
}
  
  export default Profile;
  
  
  