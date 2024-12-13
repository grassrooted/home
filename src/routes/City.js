import '../index.css';
import { useParams } from "react-router"
import { useLoaderData } from "react-router-dom";
import ProfileStream from '../ProfileStream';
import Header from '../Header';

function City() {
    const { cityId } = useParams()
    const { profiles, cities } = useLoaderData();

    const city_config = cities.find(city => city.id === cityId);

    let city_profiles = profiles.filter(p => p.city === city_config.name);

    return (
        <div>
            <Header city={city_config.name} profile={city_config} />

            <ProfileStream cityId={cityId} city_profiles={city_profiles}/>

        </div>
    );
}
  
  export default City;
  
  
  