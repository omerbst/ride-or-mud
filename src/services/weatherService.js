// Weather service using Open-Meteo API (no API key required)
// Fetches daily forecast + past 4 days of rainfall per trail location.
// Also fetches hourly temperature for the target date.
// Uses localStorage caching to reduce redundant API calls.

const CACHE_KEY = "mtb_weather_cache";
const CACHE_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// ─── Cache helpers ────────────────────────────────────────────────

function loadCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return {};
        const cache = JSON.parse(raw);
        const now = Date.now();
        for (const key of Object.keys(cache)) {
            if (now - (cache[key]._ts || 0) > CACHE_MAX_AGE_MS) {
                delete cache[key];
            }
        }
        return cache;
    } catch {
        return {};
    }
}

function saveCache(cache) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
        // localStorage full — ignore
    }
}

// ─── API ──────────────────────────────────────────────────────────

/**
 * Fetch weather from Open-Meteo for a trail location.
 * Gets daily data: temperature max, precipitation probability, precipitation sum.
 * Gets hourly data: temperature for target-day display.
 * past_days=4 gives us 3-4 days of historical rainfall.
 * forecast_days=6 gives us up to 5 days of forecast.
 */
async function fetchOpenMeteo(trail) {
    const params = new URLSearchParams({
        latitude: trail.lat,
        longitude: trail.lng,
        daily: "temperature_2m_max,precipitation_probability_max,precipitation_sum",
        hourly: "temperature_2m",
        past_days: "4",
        forecast_days: "6",
        timezone: "auto",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Open-Meteo ${res.status}: ${text.slice(0, 120)}`);
    }

    return res.json();
}

// ─── Parser ───────────────────────────────────────────────────────

/**
 * Parse Open-Meteo response into the shape our scoring engine expects.
 *
 * With past_days=4, the first 4 entries are historical.
 * Hourly data includes temperature_2m for extracting 9am temp and full-day forecast.
 *
 * @param {Object} data - Raw Open-Meteo response
 * @param {string} targetDateStr - YYYY-MM-DD date string for the target ride date
 */
function parseWeatherData(data, targetDateStr) {
    const daily = data?.daily;
    if (!daily?.time) {
        throw new Error("Invalid Open-Meteo response: missing daily data");
    }

    const dates = daily.time;
    const temps = daily.temperature_2m_max || [];
    const rainProbs = daily.precipitation_probability_max || [];
    const rainSums = daily.precipitation_sum || [];

    // Find the target date index
    const targetIdx = dates.indexOf(targetDateStr);

    // Calculate P48: sum of precipitation from the 3-4 days before the target date
    let p48 = 0;
    for (let offset = 1; offset <= 4; offset++) {
        if (targetIdx >= offset) p48 += rainSums[targetIdx - offset] || 0;
    }

    // Find today's index for current conditions
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayIdx = dates.indexOf(todayStr);

    // Extract hourly temperature data for the target date
    const hourly = data?.hourly;
    let temp9am = null;
    let hourlyTemps = [];

    if (hourly?.time && hourly?.temperature_2m) {
        const targetPrefix = targetDateStr; // "YYYY-MM-DD"
        hourlyTemps = hourly.time
            .map((t, i) => ({ time: t, temp: hourly.temperature_2m[i] }))
            .filter((h) => h.time.startsWith(targetPrefix));

        // 9am = index with hour 09:00
        const at9am = hourlyTemps.find((h) => h.time.endsWith("T09:00"));
        if (at9am) temp9am = at9am.temp;
    }

    return {
        // Rainfall data for scoring
        p48: Math.round(p48 * 10) / 10,
        dailyRainfall: dates.map((date, i) => ({
            date,
            rain: rainSums[i] || 0,
        })),

        // Target date weather
        targetDate: {
            date: targetDateStr,
            tempMax: targetIdx >= 0 ? temps[targetIdx] : null,
            temp9am,
            rainProbability: targetIdx >= 0 ? rainProbs[targetIdx] : null,
            rainSum: targetIdx >= 0 ? rainSums[targetIdx] : null,
            hourlyTemps,
        },

        // Today's current conditions (for display)
        current: {
            tempMax: todayIdx >= 0 ? temps[todayIdx] : null,
            rainProbability: todayIdx >= 0 ? rainProbs[todayIdx] : null,
            rainSum: todayIdx >= 0 ? rainSums[todayIdx] : null,
        },
    };
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Fetch weather for all trails using Open-Meteo.
 * Groups nearby trails (~5km) to share one API call.
 * Falls back to cached data on error.
 *
 * @param {Array} trails - List of trail objects
 * @param {string} targetDateStr - YYYY-MM-DD target date
 */
export async function fetchAllTrailsWeather(trails, targetDateStr) {
    const cache = loadCache();
    const results = {};
    let freshCount = 0;
    let cachedCount = 0;

    // Group trails by ~5km grid
    const groups = {};
    for (const trail of trails) {
        const key = `${(Math.round(trail.lat * 20) / 20).toFixed(2)},${(Math.round(trail.lng * 20) / 20).toFixed(2)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(trail);
    }

    const groupEntries = Object.entries(groups);
    const batchSize = 5; // Open-Meteo is generous with rate limits

    for (let i = 0; i < groupEntries.length; i += batchSize) {
        const batch = groupEntries.slice(i, i + batchSize);

        const batchResults = await Promise.all(
            batch.map(async ([key, group]) => {
                const representative = group[0];
                try {
                    const data = await fetchOpenMeteo(representative);
                    const weather = parseWeatherData(data, targetDateStr);
                    weather._ts = Date.now();
                    // Cache raw response for re-parsing with different dates
                    cache[key] = { raw: data, _ts: Date.now() };
                    freshCount++;
                    return { key, group, weather, source: "api" };
                } catch (err) {
                    // Try cache
                    if (cache[key]?.raw) {
                        cachedCount++;
                        try {
                            const weather = parseWeatherData(cache[key].raw, targetDateStr);
                            console.warn(`[Weather] ${representative.name}: using cached data`);
                            return { key, group, weather, source: "cache" };
                        } catch {
                            // Cache data couldn't be parsed
                        }
                    }
                    console.warn(`[Weather] ${representative.name}: no data (${err.message})`);
                    return {
                        key, group,
                        weather: {
                            p48: 0,
                            dailyRainfall: [],
                            targetDate: { date: targetDateStr, tempMax: null, temp9am: null, rainProbability: null, rainSum: null, hourlyTemps: [] },
                            current: { tempMax: null, rainProbability: null, rainSum: null },
                        },
                        source: "fallback",
                    };
                }
            })
        );

        for (const { group, weather } of batchResults) {
            for (const trail of group) {
                results[trail.id] = weather;
            }
        }

        // Small delay between batches (Open-Meteo allows ~600 req/min)
        if (i + batchSize < groupEntries.length) {
            await new Promise((r) => setTimeout(r, 300));
        }
    }

    saveCache(cache);
    console.log(`[Weather] Done: ${freshCount} fresh, ${cachedCount} cached (Open-Meteo)`);

    return results;
}

/**
 * Re-score cached weather data for a new target date WITHOUT API calls.
 */
export function rescoreCachedWeather(trails, targetDateStr) {
    const cache = loadCache();
    const results = {};
    let found = 0;

    const groups = {};
    for (const trail of trails) {
        const key = `${(Math.round(trail.lat * 20) / 20).toFixed(2)},${(Math.round(trail.lng * 20) / 20).toFixed(2)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(trail);
    }

    for (const [key, group] of Object.entries(groups)) {
        if (cache[key]?.raw) {
            try {
                const weather = parseWeatherData(cache[key].raw, targetDateStr);
                for (const trail of group) {
                    results[trail.id] = weather;
                }
                found++;
            } catch {
                // skip
            }
        }
    }

    if (found === 0) return null;
    console.log(`[Weather] Re-scored ${found} groups from cache for ${targetDateStr}`);
    return results;
}
