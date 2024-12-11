import React from 'react';
import './ProfileSnapshot.css';


function ProfileSnapshot({ profile }) {
  return (
    <div className="profileSnapshot">
          <h1>{profile.name}</h1>
          <img className="profile-headshot" src={profile.path_to_headshot_photo} alt={`${profile.name} headshot`} />
          <h3 className='profile-district-header'>Council District {profile.district}</h3>
          <p>First Election: {profile.first_election} | Next Election: {profile.next_election}</p>
    </div>
  );
}

export default ProfileSnapshot;