// src/components/CityCard.js
import React from 'react';
import ProfileSnapshot from "./ProfileSnapshot";

const ProfileStream = ({ city_profiles }) => {
    return (
        <div id="profile-stream">
            {city_profiles.map((profile) => (
                <ProfileSnapshot key={profile.id} profile={profile} />
            ))}
        </div>
    );
};

export default ProfileStream;
