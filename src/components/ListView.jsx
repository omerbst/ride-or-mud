import { useState, useEffect, useRef } from 'react';
import {
    MapPin,
    Clock,
    Droplets,
    ChevronRight,
    Frown,
} from 'lucide-react';
import { getScoreColor, getStatusLabel } from '../services/scoringEngine';
import TrailCard from './TrailCard';

export default function ListView({ trails, scores, weather, dateLabel, selectedTrailId, onTrailViewed }) {
    const [expandedId, setExpandedId] = useState(null);
    const rowRefs = useRef({});

    // When a trail is selected via search, expand it and scroll to it
    useEffect(() => {
        if (selectedTrailId) {
            setExpandedId(selectedTrailId);
            // Small delay to let the DOM update before scrolling
            setTimeout(() => {
                const el = rowRefs.current[selectedTrailId];
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                // Notify parent that we've handled the selection
                if (onTrailViewed) onTrailViewed();
            }, 100);
        }
    }, [selectedTrailId, onTrailViewed]);

    // Only show trails that have score data, sorted by score descending
    const sortedTrails = trails
        .filter((t) => scores[t.id] && weather[t.id])
        .sort((a, b) => {
            const sa = scores[a.id]?.score ?? 0;
            const sb = scores[b.id]?.score ?? 0;
            return sb - sa;
        });

    if (sortedTrails.length === 0) {
        return (
            <div className="empty-state">
                <Frown />
                <h3>No trails in range</h3>
                <p>No trails found within 75-minute drive from Tel Mond.</p>
            </div>
        );
    }

    const toggleRow = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="list-view">
            {/* Column headers */}
            <div className="list-header">
                <span className="list-col list-col-score">Score</span>
                <span className="list-col list-col-name">Trail</span>
                <span className="list-col list-col-region">Region</span>
                <span className="list-col list-col-drive">Drive</span>
                <span className="list-col list-col-mud">Mud</span>
                <span className="list-col list-col-rain">Rain 4d</span>
                <span className="list-col list-col-status">Status</span>
                <span className="list-col list-col-chevron"></span>
            </div>

            {sortedTrails.map((trail) => {
                const scoreData = scores[trail.id];
                const color = getScoreColor(scoreData.score);
                const status = getStatusLabel(scoreData.score);
                const isExpanded = expandedId === trail.id;

                return (
                    <div
                        key={trail.id}
                        ref={(el) => { rowRefs.current[trail.id] = el; }}
                        className={`list-row-wrapper ${isExpanded ? 'expanded' : ''}`}
                    >
                        <div
                            className={`list-row score-border-${color}`}
                            onClick={() => toggleRow(trail.id)}
                        >
                            {/* Score */}
                            <span className={`list-col list-col-score`}>
                                <span className={`list-score-badge ${color}`}>{scoreData.score}</span>
                            </span>

                            {/* Trail name */}
                            <span className="list-col list-col-name">
                                <span className="list-trail-name">{trail.name}</span>
                            </span>

                            {/* Region */}
                            <span className="list-col list-col-region">
                                <MapPin size={11} />
                                {trail.region}
                            </span>

                            {/* Drive time */}
                            <span className="list-col list-col-drive">
                                <Clock size={11} />
                                {scoreData.driveMinutes} min
                            </span>

                            {/* Mud index */}
                            <span className="list-col list-col-mud">
                                <Droplets size={11} />
                                {trail.mud_index}
                            </span>

                            {/* Rain 4d */}
                            <span className="list-col list-col-rain">
                                {scoreData.p48} mm
                            </span>

                            {/* Status */}
                            <span className={`list-col list-col-status list-status-${color}`}>
                                {status}
                            </span>

                            {/* Expand chevron */}
                            <span className={`list-col list-col-chevron ${isExpanded ? 'rotated' : ''}`}>
                                <ChevronRight size={16} />
                            </span>
                        </div>

                        {/* Expanded card */}
                        {isExpanded && (
                            <div className="list-row-expanded">
                                <TrailCard
                                    trail={trail}
                                    scoreData={scoreData}
                                    weatherData={weather[trail.id]}
                                    dateLabel={dateLabel}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
