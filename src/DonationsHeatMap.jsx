import React, { useState, useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function DonationsHeatMap({ city_config, profile, contribution_data }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [errorCount, setErrorCount] = useState(0);

    // Compute bounds for the candidate's city
    const cityBounds = useMemo(() => [
        [city_config.city_bounds.west, city_config.city_bounds.south],
        [city_config.city_bounds.east, city_config.city_bounds.north]
    ], [city_config]);

    // Check if a geocode is within bounds
    const isInBounds = (geocode, bounds) => {
        return (
            geocode.lat <= bounds[1][1] &&
            geocode.lat >= bounds[0][1] &&
            geocode.lng <= bounds[1][0] &&
            geocode.lng >= bounds[0][0]
        );
    };

    // Process contribution data into Mapbox heatmap format
    const heatmapData = useMemo(() => {
        const features = [];
        let errors = 0;

        // Extract min and max amounts for normalization
        const amounts = contribution_data.map(record => parseFloat(record["Amount:"]) || 0).filter(amount => !isNaN(amount));
        const minAmount = Math.min(...amounts);
        const maxAmount = Math.max(...amounts);
        
        contribution_data.forEach((record) => {
            try {
                const latitude = parseFloat(record["Latitude:"]);
                const longitude = parseFloat(record["Longitude:"]);
                let amount = parseFloat(record["Amount:"]) || 0;

                if (
                    !isNaN(latitude) &&
                    !isNaN(longitude) &&
                    isInBounds({ lat: latitude, lng: longitude }, cityBounds)
                ) {
                    let normalized_weight = ((amount - minAmount) / (maxAmount - minAmount)) * 0.9 + 0.1;
                    features.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                        },
                        properties: {
                            weight: normalized_weight,
                        },
                    });
                } else {
                    errors++;
                }
            } catch {
                errors++;
            }
        });

        setErrorCount(errors);
        return {
            type: 'FeatureCollection',
            features,
        };
    }, [contribution_data, cityBounds]);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize the map
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            bounds: cityBounds,
            fitBoundsOptions: { padding: 20 },
        });

        mapRef.current = map;

        // Add heatmap layer when the map is loaded
        map.on('load', () => {
            map.addSource('heatmap', {
                type: 'geojson',
                data: heatmapData,
            });

            map.addLayer({
                id: 'heatmap-layer',
                type: 'heatmap',
                source: 'heatmap',
                paint: {
                    // Customize heatmap appearance
                    'heatmap-weight': ['get', 'weight'],
                    'heatmap-intensity': 1,
                    'heatmap-radius': 20,
                    'heatmap-opacity': 0.7,
                },
            });
        });

        return () => map.remove(); // Cleanup on component unmount
    }, [cityBounds, heatmapData]);

    return (
        <div className="section">
            <h1>Donations Heatmap</h1>
            <h4><i>Refers to all contribution data.</i></h4>
            <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />
            {errorCount > 0 && (
                <div className="error-popup" style={{ position: 'relative', top: 10, left: 10, backgroundColor: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                    <p>{errorCount} records could not be geocoded or were outside the city bounds.</p>
                </div>
            )}
        </div>
    );
}

export default DonationsHeatMap;
