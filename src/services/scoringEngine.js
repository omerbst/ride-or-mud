import {
    HOME_LOCATION,
    AVG_SPEED_KMH,
    ROAD_FACTOR,
    MAX_DRIVE_MINUTES,
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
 * Mud Factor mapping from mud_index string to multiplier.
 *
 * The Mud Score formula: S = 100 - (P48 × M)
 * where P48 = sum of precipitation (mm) from last 2 days
 * and M = mud factor based on trail soil sensitivity
 */
const MUD_FACTORS = {
    "נמוך מאוד": 2,
    "נמוך": 4,
    "בינוני": 8,
    "גבוה": 15,
    "גבוה מאוד": 25,
};

/**
 * Rock slip penalty by rock type.
 * Wet limestone/chalk is extremely slippery and dangerous for MTB.
 * Penalty scales linearly with rain up to 5mm (fully wet rocks).
 */
const ROCK_SLIP_PENALTY = {
    "גיר": 30,
    "בזלת": 10,
    "אבן חול": 0,
    "מעורב": 20,
};

/**
 * Calculate the Match Score for a trail.
 *
 * Formula: S = 100 - (P48 × M) - SlipPenalty
 *   P48 = precipitation sum from past 4 days (mm)
 *   M   = Mud Factor from mud_index
 *   SlipPenalty = RockPenalty × min(P48, 5) / 5
 *     (scales linearly with rain up to 5mm — beyond that rocks are fully wet)
 *
 * Status thresholds:
 *   Green (Epic Ride):   S > 80
 *   Yellow (Tacky/Risky): 40 < S ≤ 80
 *   Red (Muddy/Avoid):    S ≤ 40
 */
export function calculateMatchScore(trail, weatherData) {
    const mudFactor = MUD_FACTORS[trail.mud_index] ?? 8; // default Medium
    const p48 = weatherData.p48 || 0;

    // Rock slip penalty — scales with rain up to 5mm
    const rockPenalty = ROCK_SLIP_PENALTY[trail.rock_type] ?? 0;
    const slipPenalty = Math.round(rockPenalty * Math.min(p48, 5) / 5);

    // Core formula
    const raw = 100 - (p48 * mudFactor) - slipPenalty;
    const score = Math.round(Math.max(0, Math.min(100, raw)));

    return {
        score,
        p48: Math.round(p48 * 10) / 10,
        mudFactor,
        mudIndex: trail.mud_index,
        rockType: trail.rock_type,
        slipPenalty,
        driveMinutes: estimateDriveMinutes(trail),
        tempMax: weatherData.targetDate?.tempMax,
        temp9am: weatherData.targetDate?.temp9am,
        rainProbability: weatherData.targetDate?.rainProbability,
        hourlyTemps: weatherData.targetDate?.hourlyTemps || [],
    };
}

/**
 * Get color classification for a score
 * Green (Epic Ride):   S > 80
 * Yellow (Tacky/Risky): 40 < S ≤ 80
 * Red (Muddy/Avoid):    S ≤ 40
 */
export function getScoreColor(score) {
    if (score > 80) return "green";
    if (score > 40) return "yellow";
    return "red";
}

/**
 * Get human-readable riding status
 */
export function getStatusLabel(score) {
    if (score > 80) return "רכיבה אפית 🤙";
    if (score > 60) return "טוב לרכיבה";
    if (score > 40) return "דביק / מסוכן";
    if (score > 20) return "בוצי — לא מומלץ";
    return "להימנע — בוץ מלא 🚫";
}
