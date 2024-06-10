import React from 'react';
import './ProfileSnapshot.css'

function ProfileSnapshot({ name, firstElection, nextElection, district, city, headshotPath }) {
  return (
    <div className="profileSnapshot">
        <h1>{name}</h1>
        <img src={headshotPath} alt={`${name} headshot`} />
        <h3>City Council - District {district}</h3>
        <h4>{city}, Tx</h4>
        <p>First Election: {firstElection} | Next Election: {nextElection}</p>
    </div>
  );
}

export default ProfileSnapshot;