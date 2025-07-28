import React from 'react';
import "./Header.css";

function Header({ city, profile }) {
  return (
    <div id="header">
        <h1 id="city-header-name">
            {city}
        </h1>
        <span className='row-span'>
          <a
            id="data-source-btn"
            href={profile.data_source}
            target="_blank"
            rel="noopener noreferrer"
          >
            Data Source
          </a>


          <a 
            id="district-locator-btn" 
            href={profile.find_my_district}
          > 
            
            Find My District  </a>
        </span>

    </div>
  );
}

export default Header;


