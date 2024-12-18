import React from 'react';
import './ProfileSnapshot.css';


function ProfileSnapshot({ profile }) {
  return (
    <div className="profileSnapshot">
          <h1>{profile.name}</h1>
          <img className="profile-headshot" src={profile.path_to_headshot_photo} alt={`${profile.name} headshot`} />
          <h3 className='profile-district-header'>Council District {profile.district}</h3>
          <span className='row-span'>
            <p id="first-election-wrapper">First Election <h3>{profile.first_election}</h3> </p>
            <p id="next-election-wrapper"> Next Election <h3>{profile.next_election}</h3></p>
          </span>
    </div>
  );
}

export default ProfileSnapshot;