import '../index.css';
import { Outlet } from "react-router-dom";
import { getProfilesForComparison, getProfiles } from '../Profiles';
import { useLoaderData } from "react-router-dom";


export async function loader() {
    const data = await getProfilesForComparison();
    const profiles = await getProfiles();
    return { data, profiles };
}

function Compare() {
    const res = useLoaderData();
    const all_data = res.data;
    const profiles = res.profiles;
    console.log(profiles)
    return (
        <div>
            <Outlet />
        </div>
    );
}
  
  export default Compare;
  
  
  