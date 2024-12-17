import React from 'react';
import "./ElectionCycleDropdown.css";

function ElectionCycleDropdown({ electionCycles, selectedDateRange, setSelectedDateRange }) {
    const handleDateRangeChange = (event) => {
        const cycleIndex = parseInt(event.target.value, 10);
        if (cycleIndex === -1) {
            setSelectedDateRange({
                start: electionCycles[0].start,
                end: electionCycles[electionCycles.length - 1].end,
            });
        } else {
            const selectedCycle = electionCycles[cycleIndex];
            setSelectedDateRange(selectedCycle);
        }
    };

    const selectedIndex = electionCycles.findIndex(
        (cycle) =>
            cycle.start.getTime() === selectedDateRange.start.getTime() &&
            cycle.end.getTime() === selectedDateRange.end.getTime()
    );

    return (
        <div className="dropdown-container">
            <label htmlFor="date-range">Filter By Election Cycle</label>
            <select 
                id="date-range" 
                className="dropdown" 
                onChange={handleDateRangeChange} 
                value={selectedIndex === -1 ? -1 : selectedIndex}
            >
                <option value={-1}>All Data</option>
                {electionCycles.map((cycle, index) => (
                    <option key={index} value={index}>
                        {cycle.start.toLocaleDateString()} thru {cycle.end.toLocaleDateString()}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default ElectionCycleDropdown;
