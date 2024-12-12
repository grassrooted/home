import '../index.css';
import { useParams } from "react-router"
import { useLoaderData } from "react-router-dom";
import ProfileStream from '../ProfileStream';

function City() {
    const { cityId } = useParams()
    const { profiles, cities } = useLoaderData();

    const city_config = cities.find(city => city.id === cityId);

    let city_profiles = profiles.filter(p => p.city === city_config.name);

    return (
        <div>
            <h1 className="city-title">{city_config.name}</h1>

            <ProfileStream cityId={cityId} city_profiles={city_profiles}/>

        </div>
    );
}
  
  export default City;
  
  
  