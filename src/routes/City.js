import '../index.css';
import { useParams } from "react-router"
import { useLoaderData } from "react-router-dom";


function City() {
    const { cityId } = useParams()
    const { profiles, cities } = useLoaderData();

    const city_config = cities.find(city => city.id === cityId);

    let city_profiles = profiles.filter(p => p.city === city_config.name);

    return (
        <div>
            <h1>{city_config.name}</h1>

            <h3>Directory</h3>
            <div id="city-profiles-stream">
                {city_profiles.length ? (
                    <ul>
                    {city_profiles.map((profile) => (
                        <li className="profile-item" key={profile.id}>
                            {profile.name}
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p>
                    <i>No profiles</i>
                    </p>
                    )}
            </div>
        </div>
    );
}
  
  export default City;
  
  
  