import React from 'react';
import "./Header.css";

function Header({ city, profile }) {
  return (
    <div id="header">
        <h1>
            {city} Election Financials
        </h1>
        <span className='row-span'>
          <button id="data-source-btn"><a href={profile.data_source}>Data Source</a></button>
          <button id="district-locator-btn"><a href={profile.find_my_district}> Find My District  </a></button>
        </span>

    </div>
  );
}

export default Header;


