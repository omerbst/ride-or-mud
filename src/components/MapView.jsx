import { useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    useMap,
} from 'react-leaflet';
import { getScoreColor, getStatusLabel } from '../services/scoringEngine';
import { HOME_LOCATION } from '../data/trailsData';
import 'leaflet/dist/leaflet.css';

const SCORE_COLORS = {
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
};

// Component to fit map bounds to trails
function FitBounds({ trails }) {
    const map = useMap();

    useEffect(() => {
        if (trails.length === 0) return;
        const bounds = trails.map((t) => [t.lat, t.lng]);
        // Include home location
        bounds.push([HOME_LOCATION.lat, HOME_LOCATION.lng]);
        map.fitBounds(bounds, { padding: [40, 40] });
    }, [trails, map]);

    return null;
}

export default function MapView({ trails, scores, weather }) {
    const center = [31.5, 34.9]; // Israel center

    return (
        <div className="map-container">
            <MapContainer
                center={center}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds trails={trails} />

                {/* Home location marker */}
                <CircleMarker
                    center={[HOME_LOCATION.lat, HOME_LOCATION.lng]}
                    radius={8}
                    fillColor="#3b82f6"
                    fillOpacity={0.9}
                    color="#fff"
                    weight={2}
                >
                    <Popup>
                        <div className="popup-title">🏠 {HOME_LOCATION.name}</div>
                        <div className="popup-details">Your home base</div>
                    </Popup>
                </CircleMarker>

                {/* Trail markers */}
                {trails.map((trail) => {
                    const scoreData = scores[trail.id];
                    const weatherData = weather[trail.id];
                    if (!scoreData) return null;

                    const color = getScoreColor(scoreData.score);
                    const status = getStatusLabel(scoreData.score);

                    return (
                        <CircleMarker
                            key={trail.id}
                            center={[trail.lat, trail.lng]}
                            radius={12}
                            fillColor={SCORE_COLORS[color]}
                            fillOpacity={0.85}
                            color="#fff"
                            weight={2}
                        >
                            <Popup>
                                <div className="popup-title">{trail.name}</div>
                                <div className="popup-score" style={{ color: SCORE_COLORS[color] }}>
                                    {scoreData.score}
                                </div>
                                <div className="popup-status" style={{ color: SCORE_COLORS[color] }}>
                                    {status}
                                </div>
                                <div className="popup-details">
                                    <strong>Soil:</strong> {trail.soil_type} ({trail.mud_index})<br />
                                    <strong>48h Rain:</strong> {scoreData.p48} mm (×{scoreData.mudFactor})<br />
                                    <strong>Drive:</strong> {scoreData.driveMinutes} min<br />
                                    <strong>Length:</strong> {trail.length_km} km ({trail.difficulty})
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
