// Weather service using Tomorrow.io API
// Per-trail forecasts with localStorage caching to handle rate limits.
// Supports selecting a target date for forecast scoring.
// In production (Vercel), calls go through /api/weather serverless proxy.
// In local dev, calls go directly to Tomorrow.io.

const TOMORROW_API_KEY = "jUIEcZ3o8wywLElcMFVzvgNgnc2SYU46";
const CACHE_KEY = "mtb_weather_cache";
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

const isLocalDev = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

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
        // localStorage full or unavailable — ignore
    }
}

// ─── API ──────────────────────────────────────────────────────────

async function fetchTomorrowWeather(trail) {
    let url;
    if (isLocalDev) {
        // Local dev: call Tomorrow.io directly
        url = `https://api.tomorrow.io/v4/weather/forecast?location=${trail.lat},${trail.lng}&apikey=${TOMORROW_API_KEY}`;
    } else {
        // Production: use serverless proxy (API key stays server-side)
        url = `/api/weather?lat=${trail.lat}&lng=${trail.lng}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text.slice(0, 120)}`);
    }
    return res.json();
}

// ─── Parser ───────────────────────────────────────────────────────

/**
 * Parse Tomorrow.io response into weather data for a given target date.
 * @param {Object} data - Raw API response
 * @param {Date} targetDate - The date we want the forecast for (morning ride)
 */
function parseWeatherData(data, targetDate) {
    const now = new Date();
    const hourlyEntries = data?.timelines?.hourly || [];
    const dailyEntries = data?.timelines?.daily || [];

    // --- TARGET MORNING: 7 AM Israel time (IST = UTC+2) → 05:00 UTC ---
    const targetMorning = new Date(targetDate);
    targetMorning.setUTCHours(5, 0, 0, 0);

    // --- RAINFALL: accumulate rain in the 48h window BEFORE the target morning ---
    const hourlyData = [];
    let totalRain = 0;

    for (const entry of hourlyEntries) {
        const entryTime = new Date(entry.time);
        const rain = entry.values?.rainAccumulation ?? 0;
        const hoursBeforeTarget = (targetMorning - entryTime) / (1000 * 60 * 60);

        // Rain in the 48h window leading up to target morning
        if (hoursBeforeTarget >= -1 && hoursBeforeTarget <= 48) {
            totalRain += rain;
        }

        hourlyData.push({ time: entry.time, rain });
    }

    // Find matching daily entry for the target date
    const targetDateStr = targetDate.toISOString().slice(0, 10);
    const matchingDaily = dailyEntries.find((d) =>
        d.time.startsWith(targetDateStr)
    );

    // Also check the day before for rain accumulation
    const dayBefore = new Date(targetDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const dayBeforeStr = dayBefore.toISOString().slice(0, 10);
    const matchingDayBefore = dailyEntries.find((d) =>
        d.time.startsWith(dayBeforeStr)
    );

    // Use daily rain sums as fallback if they capture more
    const dailyRainSum =
        (matchingDaily?.values?.rainAccumulationSum ?? 0) +
        (matchingDayBefore?.values?.rainAccumulationSum ?? 0);
    if (dailyRainSum > totalRain) {
        totalRain = dailyRainSum;
    }

    // --- TARGET MORNING TEMPERATURE ---
    let targetMorningTemp = null;
    let targetMorningRainProb = 0;
    let bestDiff = Infinity;

    for (const entry of hourlyEntries) {
        const diff = Math.abs(new Date(entry.time) - targetMorning);
        if (diff < bestDiff && diff < 6 * 3600000) {
            bestDiff = diff;
            targetMorningTemp = Math.round(entry.values.temperature);
            targetMorningRainProb = entry.values.precipitationProbability ?? 0;
        }
    }

    // Fallback: daily summary for the target date
    if (targetMorningTemp === null && matchingDaily?.values) {
        const dv = matchingDaily.values;
        if (dv.temperatureMin != null && dv.temperatureAvg != null) {
            targetMorningTemp = Math.round((dv.temperatureMin + dv.temperatureAvg) / 2);
        }
    }

    // --- RAIN PROBABILITY (for target date) ---
    const targetDayStart = new Date(targetDate);
    targetDayStart.setUTCHours(0, 0, 0, 0);
    const targetDayEnd = new Date(targetDate);
    targetDayEnd.setUTCHours(23, 59, 59, 999);

    const forecastProbs = hourlyEntries
        .filter((e) => {
            const t = new Date(e.time);
            return t >= targetDayStart && t <= targetDayEnd;
        })
        .map((e) => e.values?.precipitationProbability ?? 0);

    const maxHourlyProb = forecastProbs.length > 0 ? Math.max(...forecastProbs) : 0;
    const dailyProbMax = matchingDaily?.values?.precipitationProbabilityMax ?? 0;
    const rainProbability = Math.max(maxHourlyProb, targetMorningRainProb, dailyProbMax);

    // --- CURRENT CONDITIONS (entry closest to now) ---
    let current = hourlyEntries[0];
    let currentDiff = Infinity;
    for (const entry of hourlyEntries) {
        const diff = Math.abs(new Date(entry.time) - now);
        if (diff < currentDiff) {
            currentDiff = diff;
            current = entry;
        }
    }

    const cv = current?.values || {};

    return {
        rainfall: {
            totalRain: Math.round(totalRain * 10) / 10,
            hourlyData: hourlyData.slice(0, 48),
        },
        current: {
            temperature: cv.temperature != null ? Math.round(cv.temperature) : null,
            humidity: cv.humidity != null ? Math.round(cv.humidity) : null,
            windSpeed: cv.windSpeed != null ? Math.round(cv.windSpeed * 10) / 10 : null,
        },
        forecast: {
            tomorrowMorningTemp: targetMorningTemp,
            rainProbability,
            description: getWeatherDescription(cv.weatherCode ?? 1000),
        },
    };
}

function getWeatherDescription(code) {
    const codes = {
        1000: "Clear", 1001: "Cloudy", 1100: "Mostly Clear",
        1101: "Partly Cloudy", 1102: "Mostly Cloudy",
        2000: "Fog", 2100: "Light Fog",
        4000: "Drizzle", 4001: "Rain", 4200: "Light Rain", 4201: "Heavy Rain",
        5000: "Snow", 5001: "Flurries", 5100: "Light Snow", 5101: "Heavy Snow",
        8000: "Thunderstorm",
    };
    return codes[code] || "Unknown";
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Fetch weather for all trails with per-location calls.
 * Groups nearby trails (~5 km) to share one API call.
 * Falls back to cached data when rate-limited.
 *
 * @param {Array} trails - List of trail objects
 * @param {Date} targetDate - The date to score for (morning ride)
 */
export async function fetchAllTrailsWeather(trails, targetDate) {
    const cache = loadCache();
    const results = {};
    let freshCount = 0;
    let cachedCount = 0;

    // Group trails by ~5 km grid
    const groups = {};
    for (const trail of trails) {
        const key = `${(Math.round(trail.lat * 20) / 20).toFixed(2)},${(Math.round(trail.lng * 20) / 20).toFixed(2)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(trail);
    }

    const groupEntries = Object.entries(groups);
    const batchSize = 3;

    for (let i = 0; i < groupEntries.length; i += batchSize) {
        const batch = groupEntries.slice(i, i + batchSize);

        const batchResults = await Promise.all(
            batch.map(async ([key, group]) => {
                const representative = group[0];
                try {
                    const data = await fetchTomorrowWeather(representative);
                    const weather = parseWeatherData(data, targetDate);
                    weather._ts = Date.now();
                    // Cache the RAW api response so we can re-parse for different dates
                    cache[key] = { raw: data, _ts: Date.now() };
                    freshCount++;
                    return { key, group, weather, source: "api" };
                } catch (err) {
                    // API failed — try re-parsing cached raw data for the target date
                    if (cache[key]?.raw) {
                        cachedCount++;
                        const weather = parseWeatherData(cache[key].raw, targetDate);
                        console.warn(
                            `[Weather] ${representative.name}: using cached data (${err.message})`
                        );
                        return { key, group, weather, source: "cache" };
                    }
                    console.warn(
                        `[Weather] ${representative.name}: no data available (${err.message})`
                    );
                    return {
                        key,
                        group,
                        weather: {
                            rainfall: { totalRain: 0, hourlyData: [] },
                            current: { temperature: null, humidity: null, windSpeed: null },
                            forecast: {
                                tomorrowMorningTemp: null,
                                rainProbability: 0,
                                description: "Unavailable",
                            },
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

        if (i + batchSize < groupEntries.length) {
            await new Promise((r) => setTimeout(r, 1200));
        }
    }

    saveCache(cache);

    console.log(
        `[Weather] Done: ${freshCount} fresh, ${cachedCount} cached, ${Object.keys(results).length - freshCount - cachedCount
        } unavailable. Target: ${targetDate.toLocaleDateString()}`
    );

    return results;
}

/**
 * Re-score cached weather data for a new target date WITHOUT making API calls.
 * Returns null if no cache is available.
 */
export function rescoreCachedWeather(trails, targetDate) {
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
            const weather = parseWeatherData(cache[key].raw, targetDate);
            for (const trail of group) {
                results[trail.id] = weather;
            }
            found++;
        }
    }

    if (found === 0) return null;

    console.log(
        `[Weather] Re-scored ${found} groups from cache for ${targetDate.toLocaleDateString()}`
    );
    return results;
}
