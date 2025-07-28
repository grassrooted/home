import React, { useMemo } from 'react';
import './StackedBarChartDonorSummary.css';

function StackedBarChartDonorSummary({ cityProfileData, selectedDateRange }) {
    const pacData = useMemo(() => {
        return cityProfileData.map(profile => {
            const filteredData = selectedDateRange === 'all'
                ? profile.contributions
                : profile.contributions.filter(record => {
                    const date = new Date(record[profile.contribution_fields.Transaction_Date]);
                    return date >= selectedDateRange.start && date <= selectedDateRange.end;
                });

            let totalPAC = 0;
            filteredData.forEach(record => {
                const donorName = record[profile.contribution_fields.Donor]?.toLowerCase();
                const amount = record[profile.contribution_fields.Amount];
                if (donorName?.includes('pac') || donorName?.includes('committee')) {
                    totalPAC += amount;
                }
            });

            return {
                name: profile.name,
                pacAmount: totalPAC,
                headshot: `${process.env.PUBLIC_URL}${profile.path_to_headshot_photo}` || null
            };
        }).sort((a, b) => b.pacAmount - a.pacAmount);
    }, [cityProfileData, selectedDateRange]);

    const maxPAC = useMemo(() => Math.max(...pacData.map(p => p.pacAmount), 0), [pacData]);

    return (
        <div className="vertical-pac-chart-container">
            <div className="vertical-line">
                {Array.from({ length: 6 }).map((_, i) => {
                    const val = Math.round((i / 5) * maxPAC);
                    return (
                        <div key={i} className="tick" style={{ bottom: `${(i / 5) * 100}%` }}>
                            <div className="tick-label">${val.toLocaleString()}</div>
                        </div>
                    );
                })}
                {pacData.map((profile, idx) => {
                    const position = (profile.pacAmount / maxPAC) * 100;
                    const isRight = idx % 2 === 0;
                    return (
                        <div
                            key={profile.name}
                            className={`profile-marker ${isRight ? 'right' : 'left'}`}
                            style={{ bottom: `${position}%` }}
                        >
                            <img
                                src={profile.headshot || '/placeholder.png'}
                                alt={profile.name}
                                className="headshot"
                            />
                            <div className="profile-label">
                                <span className="name" style={{color: "black"}}>{profile.name}</span>
                                <span className="amount">${profile.pacAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default StackedBarChartDonorSummary;
