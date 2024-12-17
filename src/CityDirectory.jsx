import React from 'react';

const CityDirectory = ({ city_profiles }) => {
    return (
        <div>
            <h3>Directory</h3>
            <div id="city-profiles-directory">
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
};

export default CityDirectory;
