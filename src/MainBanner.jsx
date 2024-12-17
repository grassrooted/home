import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import './MainBanner.css';

function MainBanner({ cities, profiles }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false); // State for hamburger menu
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const handleCityClick = (cityId) => {
        navigate(`/cities/${cityId}`);
        setDropdownOpen(false); // Close dropdown after selection
        setMenuOpen(false); // Close hamburger menu
    };

    return (
        <div className={`main-banner ${menuOpen ? 'responsive' : ''}`}>
            <NavLink to="/" className="home-button">
                <img alt="home icon" className="home-button-icon" src="/logo.png" />
            </NavLink>

            {/* Hamburger Icon */}
            <div className="hamburger-icon" onClick={toggleMenu}>
                <i class="fa fa-bars"></i>

            </div>

            {/* Main Navigation */}
            <nav className={`main-menu ${menuOpen ? 'open' : ''}`}>
                <span id="pages-bar">
                    <NavLink to="/" className="menu-item" onClick={() => setMenuOpen(false)}>
                        Home
                    </NavLink>
                    <div className="menu-item cities-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
                        <span onMouseOver={toggleDropdown} onClick={toggleDropdown}>Cities</span>
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
                    <NavLink to="/about" className="menu-item" onClick={() => setMenuOpen(false)}>
                        About
                    </NavLink>
                </span>


                <SearchBar profiles={profiles} />
            </nav>

        </div>
    );
}

export default MainBanner;
