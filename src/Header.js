import React from 'react';
import "./Header.css";

function Header({ profile }) {
  return (
    <div className="section" id="header">
        <h1>
            {profile.city} Election Financials
        </h1>
        <button><a href={profile.data_source}>Data Source</a></button>
        <button><a href={profile.find_my_district}> Find My District  </a></button>
    </div>
  );
}

export default Header;


