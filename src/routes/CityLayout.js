import '../index.css';
import React from 'react';
import { Outlet, useOutletContext, useParams } from "react-router-dom";

function CityLayout() {
    const { cityId } = useParams(); // Get the current cityId from the URL params
    const { cities } = useOutletContext(); // Get context from the parent route (Root component)

    // Find the current city based on the cityId
    const city_config = cities?.find(city => city.id === cityId) || {};

    // Pass the filtered city and profiles to child routes via context
    const contextValue = { city_config };

    return (
        <div>
            {/* Pass context to child routes */}
            <Outlet context={contextValue} />
        </div>
    );
}

export default CityLayout;
