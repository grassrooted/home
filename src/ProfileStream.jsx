import React from 'react';
import ProfileSnapshot from "./ProfileSnapshot";
import { NavLink } from "react-router-dom";

const ProfileStream = ({ cityId, cityProfileData }) => {
    return (
        <div id="profile-stream">
            {cityProfileData.map((profile) => (
                <NavLink
                    key={profile.id} 
                    to={`/cities/${cityId}/profiles/${profile.id}`}
                    className={({ isActive, isPending }) =>
                        isActive
                            ? "active"
                            : isPending
                            ? "pending"
                            : ""
                        } >
                    <ProfileSnapshot 
                        profile={profile} />
                </NavLink>
            ))}
        </div>
    );
};

export default ProfileStream;
