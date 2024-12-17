import React from 'react';
import './CityCard.css';

const CityCard = ({ name, coverPhoto }) => {
    return (
        <div
            className="city-card"
            style={{
                backgroundImage: `url(${coverPhoto})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="city-overlay">
                <h1>{name}</h1>
            </div>
        </div>
    );
};

export default CityCard;
