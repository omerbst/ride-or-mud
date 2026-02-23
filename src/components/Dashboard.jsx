import { Frown } from 'lucide-react';
import TrailCard from './TrailCard';

export default function Dashboard({ trails, scores, weather, dateLabel }) {
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

    return (
        <div className="dashboard-grid">
            {sortedTrails.map((trail) => (
                <TrailCard
                    key={trail.id}
                    trail={trail}
                    scoreData={scores[trail.id]}
                    weatherData={weather[trail.id]}
                    dateLabel={dateLabel}
                />
            ))}
        </div>
    );
}

