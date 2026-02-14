import { useState } from 'react';
import {
    Mountain,
    MapPin,
    Clock,
    Ruler,
    Droplets,
    Thermometer,
    Wind,
    ChevronDown,
    ChevronUp,
    CloudRain,
} from 'lucide-react';
import { getScoreColor, getStatusLabel } from '../services/scoringEngine';
import RainfallChart from './RainfallChart';

export default function TrailCard({ trail, scoreData, weatherData, dateLabel }) {
    const [expanded, setExpanded] = useState(false);
    const color = getScoreColor(scoreData.score);
    const status = getStatusLabel(scoreData.score);

    const displayTemp =
        weatherData.forecast.tomorrowMorningTemp ??
        weatherData.current?.temperature ??
        null;
    const tempLabel =
        weatherData.forecast.tomorrowMorningTemp != null
            ? `${dateLabel || 'Target'} AM`
            : 'Now';

    return (
        <div className={`trail-card score-${color}`}>
            {/* Clickable header with name and score */}
            <div className="trail-card-header">
                <div>
                    <div className="trail-name">{trail.name}</div>
                    <div className="trail-region">
                        <MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                        {trail.region} • {trail.kkl_area}
                    </div>
                </div>
                <div className={`score-badge ${color}`}>
                    <span className="score-number">{scoreData.score}</span>
                    <span className="score-label">Score</span>
                </div>
            </div>

            {/* Status label */}
            <div className={`trail-status ${color}`}>{status}</div>

            {/* Meta tags */}
            <div className="trail-meta">
                <span className="meta-tag">
                    <Mountain size={12} />
                    {trail.soil_type}
                </span>
                <span className="meta-tag">
                    <Ruler size={12} />
                    {trail.length_km} km
                </span>
                <span className="meta-tag">
                    <Clock size={12} />
                    {scoreData.driveMinutes} min drive
                </span>
                <span className="meta-tag">
                    <Droplets size={12} />
                    Mud: {trail.mud_index}
                </span>
            </div>

            {/* Description */}
            <div className="trail-description">{trail.description}</div>

            {/* Weather Summary */}
            <div className="weather-summary">
                <div className="weather-item">
                    <Droplets size={16} />
                    <span className="weather-value">
                        {weatherData.rainfall.totalRain.toFixed(1)} mm
                    </span>
                    <span className="weather-label">48h Rain</span>
                </div>
                <div className="weather-item">
                    <Thermometer size={16} />
                    <span className="weather-value">
                        {displayTemp != null ? `${displayTemp}°C` : '—'}
                    </span>
                    <span className="weather-label">{tempLabel}</span>
                </div>
                <div className="weather-item">
                    <CloudRain size={16} />
                    <span className="weather-value">
                        {weatherData.forecast.rainProbability}%
                    </span>
                    <span className="weather-label">Rain Prob</span>
                </div>
            </div>

            {/* Score Breakdown Bars */}
            <div style={{ marginTop: '0.5rem' }}>
                <div className="score-breakdown">
                    <div className="breakdown-bar">
                        <div
                            className="breakdown-fill mud"
                            style={{ width: `${scoreData.mud}%` }}
                        />
                    </div>
                    <div className="breakdown-bar">
                        <div
                            className="breakdown-fill weather"
                            style={{ width: `${scoreData.weather}%` }}
                        />
                    </div>
                    <div className="breakdown-bar">
                        <div
                            className="breakdown-fill dist"
                            style={{ width: `${scoreData.distance}%` }}
                        />
                    </div>
                </div>
                <div className="breakdown-labels">
                    <span className="breakdown-label">
                        <span className="breakdown-dot mud" /> Mud {scoreData.mud}
                    </span>
                    <span className="breakdown-label">
                        <span className="breakdown-dot weather" /> Weather {scoreData.weather}
                    </span>
                    <span className="breakdown-label">
                        <span className="breakdown-dot dist" /> Dist {scoreData.distance}
                    </span>
                </div>
            </div>

            {/* Expand/Collapse button */}
            <button
                className="expand-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
            >
                {expanded ? (
                    <>
                        <ChevronUp size={14} /> Hide Details
                    </>
                ) : (
                    <>
                        <ChevronDown size={14} /> Show Details
                    </>
                )}
            </button>

            {/* Expandable Details Section */}
            {expanded && (
                <div style={{ marginTop: '0.75rem' }}>
                    {/* Current conditions */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        <div>
                            <Thermometer size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            Now: {weatherData.current?.temperature != null ? `${weatherData.current.temperature}°C` : '—'}
                        </div>
                        <div>
                            <Droplets size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            Humidity: {weatherData.current?.humidity ?? '—'}%
                        </div>
                        <div>
                            <Wind size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            Wind: {weatherData.current?.windSpeed ?? '—'} m/s
                        </div>
                    </div>

                    {/* Rainfall chart */}
                    {weatherData.rainfall.hourlyData.length > 0 ? (
                        <RainfallChart
                            hourlyData={weatherData.rainfall.hourlyData}
                            totalRain={weatherData.rainfall.totalRain}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '1rem' }}>
                            No hourly rainfall data available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
