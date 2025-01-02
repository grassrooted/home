import '../index.css';
import { getProfilesForComparison, getProfiles } from '../Profiles';
import { useLoaderData } from "react-router-dom";
import CompareHighlights from '../CompareHighlights';


export async function loader() {
    const data = await getProfilesForComparison();
    const profiles = await getProfiles();
    return { data, profiles };
}

function Compare() {
    const res = useLoaderData();
    const all_data = res.data;
    const profiles = res.profiles;
    return (
        <div>
            <CompareHighlights 
                data = {all_data}
                profiles={profiles} />
        </div>
    );
}
  
  export default Compare;
  
  
  