import '../index.css';
import { useParams } from "react-router"
import { useLoaderData } from "react-router-dom";
import ProfileStream from '../ProfileStream';
import Header from '../Header';
import CompareHighlights from '../CompareHighlights';
import { getCities, getCityProfiles } from "../Cities";
import { getProfiles } from '../Profiles';


export async function loader({params}) {
    const city_profile_data = await getCityProfiles(params.cityId);
    const profiles = await getProfiles();
    const cities = await getCities();

    return { city_profile_data, profiles, cities };
}

function City() {
    const { cityId } = useParams()
    const { profiles, cities, city_profile_data } = useLoaderData();

    console.log(city_profile_data)

    const city_config = cities.find(city => city.id === cityId);

    let city_profiles = profiles.filter(p => p.city === city_config.name);

    return (
        <div>
            <Header city={city_config.name} profile={city_config} />

            <CompareHighlights city_profile_data={city_profile_data}/>

            <ProfileStream cityId={cityId} city_profiles={city_profiles}/>

        </div>
    );
}
  
  export default City;
  
  
  