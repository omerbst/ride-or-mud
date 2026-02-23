import { useState } from 'react';
import {
    Mountain,
    MapPin,
    Clock,
    Ruler,
    Droplets,
    Thermometer,
    ChevronDown,
    ChevronUp,
    CloudRain,
    AlertTriangle,
} from 'lucide-react';
import { getScoreColor, getStatusLabel } from '../services/scoringEngine';

export default function TrailCard({ trail, scoreData, weatherData, dateLabel }) {
    const [expanded, setExpanded] = useState(false);
    const [showHourly, setShowHourly] = useState(false);
    const color = getScoreColor(scoreData.score);
    const status = getStatusLabel(scoreData.score);

    return (
        <div className={`trail-card score-${color}`}>
            {/* Header: name + score badge */}
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
                <span className="meta-tag">
                    <Mountain size={12} />
                    Rock: {trail.rock_type}
                </span>
            </div>

            {/* Description */}
            <div className="trail-description">{trail.description}</div>

            {/* Spacer to push weather + button to bottom */}
            <div style={{ flex: 1 }} />

            {/* Weather Summary */}
            <div className="weather-summary">
                <div className="weather-item">
                    <Droplets size={16} />
                    <span className="weather-value">
                        {scoreData.p48} mm
                    </span>
                    <span className="weather-label">Past 4d Rain</span>
                </div>
                <div
                    className="weather-item weather-item-clickable"
                    onClick={(e) => { e.stopPropagation(); setShowHourly(!showHourly); }}
                    title="Click for hourly forecast"
                >
                    <Thermometer size={16} />
                    <span className="weather-value">
                        {scoreData.temp9am != null ? `${Math.round(scoreData.temp9am)}°C` : '—'}
                    </span>
                    <span className="weather-label">{dateLabel || 'Target'} 9AM</span>
                </div>
                <div className="weather-item">
                    <CloudRain size={16} />
                    <span className="weather-value">
                        {scoreData.rainProbability != null ? `${scoreData.rainProbability}%` : '—'}
                    </span>
                    <span className="weather-label">Rain Prob</span>
                </div>
            </div>

            {/* Slippery Rocks Warning */}
            {scoreData.slipPenalty > 0 && (
                <div className="slip-warning">
                    <AlertTriangle size={14} />
                    <span>Slippery {scoreData.rockType} rocks when wet (−{scoreData.slipPenalty} pts)</span>
                </div>
            )}

            {/* Hourly Temperature Forecast (toggled by clicking temp) */}
            {showHourly && scoreData.hourlyTemps && scoreData.hourlyTemps.length > 0 && (
                <div className="hourly-temps">
                    <div className="hourly-temps-header">
                        Hourly Temperature — {dateLabel}
                    </div>
                    <div className="hourly-temps-grid">
                        {scoreData.hourlyTemps.map((h, i) => {
                            const hour = new Date(h.time).getHours();
                            const is9am = hour === 9;
                            return (
                                <div
                                    key={i}
                                    className={`hourly-temp-cell${is9am ? ' hourly-temp-highlight' : ''}`}
                                >
                                    <div className="hourly-temp-hour">
                                        {String(hour).padStart(2, '0')}:00
                                    </div>
                                    <div className="hourly-temp-value">
                                        {Math.round(h.temp)}°
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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

            {/* Expandable Details */}
            {expanded && (
                <div style={{ marginTop: '0.75rem' }}>
                    {/* Daily rainfall breakdown */}
                    {weatherData.dailyRainfall && weatherData.dailyRainfall.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-text-secondary)',
                                marginBottom: '0.5rem',
                                fontWeight: 500,
                            }}>
                                Daily Rainfall (mm)
                            </div>
                            <div className="daily-rainfall-grid">
                                {weatherData.dailyRainfall.map((d, i) => {
                                    const isTarget = d.date === weatherData.targetDate?.date;
                                    const dayLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('en-IL', { weekday: 'short' });
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                textAlign: 'center',
                                                padding: '0.35rem 0.25rem',
                                                borderRadius: '6px',
                                                background: isTarget
                                                    ? 'rgba(59, 130, 246, 0.15)'
                                                    : 'rgba(255,255,255,0.03)',
                                                border: isTarget
                                                    ? '1px solid rgba(59, 130, 246, 0.3)'
                                                    : '1px solid transparent',
                                            }}
                                        >
                                            <div style={{
                                                fontSize: '0.6rem',
                                                color: isTarget ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
                                                marginBottom: 2,
                                            }}>
                                                {dayLabel}
                                            </div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                color: d.rain > 0
                                                    ? 'var(--color-accent-blue)'
                                                    : 'var(--color-text-secondary)',
                                            }}>
                                                {d.rain.toFixed(1)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Today's conditions */}
                    {weatherData.current && (
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--color-text-secondary)',
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '6px',
                        }}>
                            <strong>Today:</strong>{' '}
                            Max {weatherData.current.tempMax != null ? `${Math.round(weatherData.current.tempMax)}°C` : '—'},{' '}
                            Rain Prob {weatherData.current.rainProbability ?? '—'}%,{' '}
                            Precip {weatherData.current.rainSum?.toFixed(1) ?? '0.0'} mm
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
