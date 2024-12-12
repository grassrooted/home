
// src/components/CityCard.js
import React from 'react';
import { NavLink } from "react-router-dom";
import SearchBar from './SearchBar';
function MainBanner({ profiles }) {

    return (
        <div className="main-banner">
            <h3>Texas Election Audits</h3>

            <SearchBar profiles={profiles}/>

            <NavLink to={`/`} className='home-button'>
              <img alt="home icon" className="home-button-icon" src="/org-icon.png"></img>
            </NavLink>
        </div>

    );
};

export default MainBanner;
