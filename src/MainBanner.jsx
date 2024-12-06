
// src/components/CityCard.js
import React from 'react';
import { NavLink } from "react-router-dom";

const MainBanner = () => {
    return (
        <div className="main-banner">
            <h1>Texas Campaign Finance Directory</h1>

            <NavLink to={`/`} className='home-button'>
              <img alt="home icon" className="home-button-icon" src="/org-icon.png"></img>
            </NavLink>
        </div>

    );
};

export default MainBanner;
