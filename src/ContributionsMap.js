import React, { useEffect, useState } from 'react';


function ContributionsMap({profile}) {
    // State to keep track of the selected profile
    const [selectedMap, setSelectedMap] = useState(profile.path_to_maps[0]);

    // Handler for when the select value changes
    const handleMapChange = (event) => {
        setSelectedMap(event.target.value);
    };


  useEffect(() => {
    if (profile.path_to_maps && profile.path_to_maps.length > 0) {
      setSelectedMap(profile.path_to_maps[0]);
    }
  }, [profile.path_to_maps]);

    return (
        <div className="section" id="donor-map">
        <h2>
            Contributions Across Dallas
        </h2>
        <h4>
            <i>District {profile.district} is highlighted in green.</i>
        </h4>
        <label htmlFor="map-cycleFilter">Filter by Election Cycle: </label>
        <select id="map-cycleFilter" value={selectedMap} onChange={handleMapChange}>
            {profile.path_to_maps.map((src, index) => (
            <option key={index} value={src}>
                {src.split("/").at(-1).split(".").at(0)}
            </option>
            ))}
        </select>
        <img src={selectedMap} alt={selectedMap} />
        </div>
    );
  }
  
  export default ContributionsMap;
  
  
  