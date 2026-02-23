import { useState, useEffect, useCallback } from 'react';
import {
  Bike,
  LayoutDashboard,
  Map,
  MapPin,
  Clock,
  CloudRain,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { trails, HOME_LOCATION } from './data/trailsData';
import { fetchAllTrailsWeather, rescoreCachedWeather } from './services/weatherService';
import {
  calculateMatchScore,
  isWithinDriveRange,
} from './services/scoringEngine';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import './index.css';

// Helper: format Date to YYYY-MM-DD for input[type="date"] (local timezone)
function toDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: max selectable date (5 days from now — Open-Meteo forecast limit)
function getMaxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return toDateStr(d);
}

// Helper: nice label for selected date
function getDateLabel(dateStr) {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return target.toLocaleDateString('en-IL', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function App() {
  // Default target: tomorrow
  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toDateStr(d);
  })();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState({});
  const [scores, setScores] = useState({});
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [targetDateStr, setTargetDateStr] = useState(defaultDate);
  const [dateLabel, setDateLabel] = useState(getDateLabel(defaultDate));

  // Full data load — API calls
  const loadData = useCallback(async (dateStr) => {
    setLoading(true);
    setError(null);

    const useDateStr = dateStr || targetDateStr;

    try {
      const inRange = trails.filter(isWithinDriveRange);
      setFilteredTrails(inRange);

      const weather = await fetchAllTrailsWeather(inRange, useDateStr);
      setWeatherData(weather);

      const newScores = {};
      for (const trail of inRange) {
        if (weather[trail.id]) {
          newScores[trail.id] = calculateMatchScore(trail, weather[trail.id]);
        }
      }
      setScores(newScores);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
    }

    setLoading(false);
  }, [targetDateStr]);

  // Date change handler — try cache first, then API
  const handleDateChange = useCallback((newDateStr) => {
    setTargetDateStr(newDateStr);
    setDateLabel(getDateLabel(newDateStr));

    const inRange = trails.filter(isWithinDriveRange);

    // Try cache first (instant, no API calls)
    const cached = rescoreCachedWeather(inRange, newDateStr);
    if (cached) {
      setWeatherData(cached);
      const newScores = {};
      for (const trail of inRange) {
        if (cached[trail.id]) {
          newScores[trail.id] = calculateMatchScore(trail, cached[trail.id]);
        }
      }
      setScores(newScores);
      setFilteredTrails(inRange);
    } else {
      loadData(newDateStr);
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, []);

  // Count trails by score color
  const greenCount = Object.values(scores).filter((s) => s.score > 80).length;
  const yellowCount = Object.values(scores).filter(
    (s) => s.score > 40 && s.score <= 80
  ).length;
  const redCount = Object.values(scores).filter((s) => s.score <= 40).length;

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <Bike size={28} />
            <div>
              <h1>Ride or Mud</h1>
              <div className="subtitle">MTB TRAIL RECOMMENDER — ISRAEL <span className="version-tag">v1.3</span></div>
            </div>
          </div>

          <div className="header-actions">
            {/* Date Picker */}
            <div className="date-picker-wrapper">
              <Calendar size={14} />
              <input
                type="date"
                className="date-picker-input"
                value={targetDateStr}
                min={toDateStr(new Date())}
                max={getMaxDate()}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              <span className="date-label-chip">{dateLabel}</span>
            </div>

            <div className="tab-nav">
              <button
                className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={16} />
                <span className="tab-btn-label">Dashboard</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                onClick={() => setActiveTab('map')}
              >
                <Map size={16} />
                <span className="tab-btn-label">Map</span>
              </button>
            </div>

            <button
              className="settings-btn"
              onClick={() => loadData()}
              disabled={loading}
              title="Refresh weather data"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span className="refresh-text">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      {!loading && (
        <div className="status-bar">
          <div className="status-chip">
            <MapPin size={14} />
            {HOME_LOCATION.name}
          </div>
          <div className="status-chip">
            <Clock size={14} />
            {filteredTrails.length} trails within 75 min
          </div>
          <div className="status-chip">
            <Calendar size={14} />
            Forecast: {dateLabel}
          </div>
          <div className="status-chip">
            <CloudRain size={14} />
            Open-Meteo
          </div>
          <div className="status-chip">
            🟢 {greenCount} &nbsp; 🟡 {yellowCount} &nbsp; 🔴 {redCount}
          </div>
          {lastUpdated && (
            <div className="status-chip">
              Updated {lastUpdated.toLocaleDateString('en-IL', { day: '2-digit', month: '2-digit' })} {lastUpdated.toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <div className="loading-text">
              Fetching weather data from Open-Meteo...
            </div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>⚠️ {error}</h3>
            <button onClick={() => loadData()} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        ) : activeTab === 'dashboard' ? (
          <Dashboard
            trails={filteredTrails}
            scores={scores}
            weather={weatherData}
            dateLabel={dateLabel}
          />
        ) : (
          <MapView
            trails={filteredTrails}
            scores={scores}
            weather={weatherData}
          />
        )}
      </main>
    </>
  );
}
