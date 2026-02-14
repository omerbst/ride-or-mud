import {
    HOME_LOCATION,
    AVG_SPEED_KMH,
    ROAD_FACTOR,
    MAX_DRIVE_MINUTES,
    SOIL_CATEGORIES,
} from "../data/trailsData";

/**
 * Haversine distance in km between two coordinates
 */
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estimate drive time from home to trail in minutes
 */
export function estimateDriveMinutes(trail) {
    const straightLine = haversineKm(
        HOME_LOCATION.lat,
        HOME_LOCATION.lng,
        trail.lat,
        trail.lng
    );
    const roadDistance = straightLine * ROAD_FACTOR;
    return Math.round((roadDistance / AVG_SPEED_KMH) * 60);
}

/**
 * Check if trail is within max drive time
 */
export function isWithinDriveRange(trail) {
    return estimateDriveMinutes(trail) <= MAX_DRIVE_MINUTES;
}

/**
 * Calculate mud score penalty based on soil type and rainfall
 * Returns 0-100 where 100 = no mud issues
 */
function mudScore(soilType, totalRainMm) {
    const category = SOIL_CATEGORIES[soilType] || "mixed";

    switch (category) {
        case "chalk":
        case "rock":
            // Chalk/Limestone: excellent drainage, rideable even after moderate rain
            if (totalRainMm <= 5) return 100;
            if (totalRainMm <= 15) return 85;
            if (totalRainMm <= 25) return 65;
            return 40;

        case "terra_rossa":
            // Terra Rossa: decent drainage but can get slippery
            if (totalRainMm <= 3) return 95;
            if (totalRainMm <= 8) return 70;
            if (totalRainMm <= 15) return 40;
            return 15;

        case "clay":
            // Clay/Hamra: terrible after rain, UNRIDEABLE if > 5mm
            if (totalRainMm <= 1) return 90;
            if (totalRainMm <= 5) return 45;
            if (totalRainMm <= 10) return 10;
            return 0;

        case "sand":
            // Sand/Loess: drains very fast, rarely an issue
            if (totalRainMm <= 10) return 100;
            if (totalRainMm <= 25) return 85;
            return 65;

        case "desert":
            // Desert: always ride unless active flooding
            if (totalRainMm <= 20) return 100;
            if (totalRainMm <= 40) return 75;
            return 30; // flash flood territory

        case "mixed":
        default:
            // Mixed terrain: moderate sensitivity
            if (totalRainMm <= 3) return 95;
            if (totalRainMm <= 10) return 65;
            if (totalRainMm <= 20) return 35;
            return 10;
    }
}

/**
 * Calculate weather score based on forecast conditions
 */
function weatherScore(forecast) {
    let score = 100;

    // Rain probability penalty
    if (forecast.rainProbability) {
        score -= forecast.rainProbability * 0.5; // max -50
    }

    // Temperature - uncomfortable below 5 or above 38
    if (forecast.tomorrowMorningTemp !== null) {
        const t = forecast.tomorrowMorningTemp;
        if (t < 5) score -= (5 - t) * 5;
        if (t > 38) score -= (t - 38) * 5;
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * Distance score - closer = better
 */
function distanceScore(trail) {
    const mins = estimateDriveMinutes(trail);
    if (mins <= 20) return 100;
    if (mins <= 40) return 90;
    if (mins <= 60) return 75;
    return Math.max(50, 100 - mins);
}

/**
 * Calculate the overall Match Score (0-100) for a trail
 */
export function calculateMatchScore(trail, weatherData) {
    const mud = mudScore(trail.soil_type, weatherData.rainfall.totalRain);
    const weather = weatherScore(weatherData.forecast);
    const distance = distanceScore(trail);

    // Weighted combination:
    // Mud is king (50%), Weather (30%), Distance (20%)
    const raw = mud * 0.5 + weather * 0.3 + distance * 0.2;
    const score = Math.round(Math.max(0, Math.min(100, raw)));

    return {
        score,
        mud: Math.round(mud),
        weather: Math.round(weather),
        distance: Math.round(distance),
        driveMinutes: estimateDriveMinutes(trail),
    };
}

/**
 * Get color classification for a score
 */
export function getScoreColor(score) {
    if (score >= 70) return "green";
    if (score >= 40) return "yellow";
    return "red";
}

/**
 * Get human-readable riding status
 */
export function getStatusLabel(score) {
    if (score >= 80) return "Perfect Conditions";
    if (score >= 70) return "Good to Ride";
    if (score >= 55) return "Rideable, Expect Mud";
    if (score >= 40) return "Risky / Tacky";
    if (score >= 20) return "Not Recommended";
    return "Don't Go — Muddy";
}
