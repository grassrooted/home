import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ profiles }) {
    const [query, setQuery] = useState('');
    const [filteredProfiles, setFilteredProfiles] = useState([]);

    const handleInputChange = (event) => {
        const searchText = event.target.value;
        setQuery(searchText);

        if (searchText.trim() === '') {
            setFilteredProfiles([]);
            return;
        }

        const matches = profiles.filter((profile) =>
            profile.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredProfiles(matches);
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search for a candidate..."
                className="search-input"
            />

            {filteredProfiles.length > 0 && (
                <ul className="search-results">
                    {filteredProfiles.map((profile) => (
                        <li key={profile.id} className="search-result-item">
                            <a href={`${process.env.PUBLIC_URL}/#/cities/${profile.city}/profiles/${profile.id}`}>
                                <img
                                    src={`${process.env.PUBLIC_URL}${profile.path_to_headshot_photo}`}
                                    alt={`${profile.name} headshot`}
                                    className="search-profile-headshot"
                                />
                                <span className="profile-name">{profile.name}</span>
                                <span className="profile-city">({profile.city})</span>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;