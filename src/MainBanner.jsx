
// src/components/CityCard.js
import React from 'react';
import { NavLink } from "react-router-dom";
import SearchBar from './SearchBar';
import './MainBanner.css';
function MainBanner({ profiles }) {

    return (
        <div className="main-banner">
            <NavLink to={`/`} className='home-button'>
              <img alt="home icon" className="home-button-icon" src="/logo.png"></img>
            </NavLink>

            <SearchBar profiles={profiles}/>

        </div>

    );
};

export default MainBanner;
