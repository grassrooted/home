import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import './MainBanner.css';

function MainBanner({ cities, profiles }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const dropdownRef = useRef(null);
    const menuRef = useRef(null);

    const toggleDropdown = () => setDropdownOpen((prev) => !prev);
    const toggleMenu = (e) => {
        e.stopPropagation();
        setMenuOpen((prev) => !prev);
    };

    const handleCityClick = (cityId) => {
        navigate(`/cities/${cityId}`);
        setDropdownOpen(false);
        setMenuOpen(false);
    };

    useEffect(() => {
        function handleOutsideClick(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }

            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    return (
        <div className={`main-banner ${menuOpen ? 'responsive' : ''}`}>
            <NavLink to="/home/" className="home-button">
                <img alt="home icon" className="home-button-icon" src="/home/logo.png" />
            </NavLink>

            <div className="hamburger-icon" onClick={toggleMenu}>
                <i className="fa fa-bars"></i>
            </div>

            <nav className={`main-menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
                <span id="pages-bar">
                    <NavLink to="/" className="menu-item" onClick={() => setMenuOpen(false)}>
                        Home
                    </NavLink>

                    <div
                        className="menu-item cities-dropdown"
                        ref={dropdownRef}
                        aria-haspopup="true"
                        aria-expanded={dropdownOpen}
                    >
                        <span
                            onClick={toggleDropdown}
                            role="button"
                            tabIndex="0"
                            onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
                        >
                            Cities
                        </span>
                        {dropdownOpen && (
                            <ul className="dropdown-menu" role="menu">
                                {cities.map((city) => (
                                    <li
                                        key={city.id}
                                        className="dropdown-item"
                                        role="menuitem"
                                        tabIndex="0"
                                        onClick={() => handleCityClick(city.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCityClick(city.id)}
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
