import React from 'react';
import './ProfileSnapshot.css';


function ProfileSnapshot({ profile }) {
  return (
    <div className="profileSnapshot">
          <h1>{profile.name}</h1>
          <img className="profile-headshot" src={`${process.env.PUBLIC_URL}${profile.path_to_headshot_photo}`} alt={`${profile.name} headshot`} />
          <h3 className='profile-district-header'>Council District {profile.district}</h3>
          <span className='row-span'>
            <p id="first-election-wrapper">First Election <strong>{profile.first_election}</strong> </p>
            <p id="next-election-wrapper"> Next Election <strong>{profile.next_election}</strong></p>
          </span>
    </div>
  );
}

export default ProfileSnapshot;