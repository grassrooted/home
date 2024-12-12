import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import './MainBanner.css';

function MainBanner({ cities, profiles }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleCityClick = (cityId) => {
        navigate(`/cities/${cityId}`);
        setDropdownOpen(false); // Close dropdown after selection
    };

    return (
        <div className="main-banner">
            <NavLink to="/" className="home-button">
                <img alt="home icon" className="home-button-icon" src="/logo.png" />
            </NavLink>

            <nav className="main-menu">
                <NavLink to="/" className="menu-item">
                    Home
                </NavLink>
                <div className="menu-item cities-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
                    <span onClick={toggleDropdown}>Cities</span>
                    {dropdownOpen && (
                        <ul className="dropdown-menu">
                            {cities.map((city) => (
                                <li
                                    key={city.name}
                                    className="dropdown-item"
                                    onClick={() => handleCityClick(city.id)}
                                >
                                    {city.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <NavLink to="/about" className="menu-item">
                    About
                </NavLink>
            </nav>
            <SearchBar profiles={profiles}/>
        </div>

    );
};

export default MainBanner;
