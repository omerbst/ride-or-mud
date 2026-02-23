// Trail database sourced from KKL (kkl.org.il) singletrack listings
// Soil data from SoilGrids (ISRIC) API — clay/sand/silt % at 0-5cm depth
// mud_index derived from clay content: >40% = Very High, 30-40% = High, 20-30% = Medium, <20% = Low

export const HOME_LOCATION = {
    name: "Tel Mond",
    lat: 32.2569,
    lng: 34.9194,
};

// Average driving speed for drive-time estimation (no traffic, early morning)
export const AVG_SPEED_KMH = 80;
export const ROAD_FACTOR = 1.3; // accounts for non-straight routes
export const MAX_DRIVE_MINUTES = 75;

export const trails = [
    // ============= Ben Shemen Complex =============
    {
        id: "hadid-ben-shemen",
        name: "Hadid (Green) - Ben Shemen",
        lat: 31.968,
        lng: 34.945,
        length_km: 11.0,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 32.8% clay, 25.2% sand, 42.1% silt
        mud_index: "High",
        rock_type: "Limestone",
        kkl_area: "Center",
        description: "Technical and rocky, handles rain exceptionally well.",
        region: "Shfela",
    },
    // ============= Central =============
    {
        id: "ayalon-canada",
        name: "Ayalon-Canada Park",
        lat: 31.842,
        lng: 34.995,
        length_km: 15.0,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 32.9% clay, 27.9% sand, 39.3% silt
        mud_index: "High",
        rock_type: "Limestone",
        kkl_area: "Center",
        description: "Mostly rocky, but some clay sections can be slippery.",
        region: "Shfela",
    },
    {
        id: "yaar-hakdoshim",
        name: "Yaar HaKdoshim (Martyrs' Forest)",
        lat: 31.748,
        lng: 35.055,
        length_km: 14.0,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 31.0% clay, 30.1% sand, 38.8% silt
        mud_index: "High",
        rock_type: "Limestone",
        kkl_area: "Center",
        description: "Jerusalem hills, chalky soil drains well even in winter.",
        region: "Jerusalem Hills",
    },
    {
        id: "nahal-alexander",
        name: "Nahal Alexander",
        lat: 32.22045,
        lng: 34.98246,
        length_km: 20.0,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 39.8% clay, 21.3% sand, 38.9% silt
        mud_index: "High",
        rock_type: "Limestone",
        kkl_area: "Center",
        description: "Modular loops near Kochav Yair with wildflowers and panoramic views. 270m elevation gain.",
        region: "Sharon",
    },
    {
        id: "zacharia",
        name: "Zacharia",
        lat: 31.715,
        lng: 34.943,
        length_km: 13.5,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 32.9% clay, 28.1% sand, 38.9% silt
        mud_index: "High",
        rock_type: "Limestone",
        kkl_area: "Center",
        description: "Flow singletrack through Yeshei Forest with long gradual climbs and scenic valley views. 250m elevation gain.",
        region: "Shfela",
    },
    // ============= North =============
    {
        id: "alon-hagalil",
        name: "Alon HaGalil",
        lat: 32.706,
        lng: 35.255,
        length_km: 18.0,
        difficulty: "Medium",
        soil_type: "Heavy Clay", // 43.7% clay, 19.9% sand, 36.4% silt
        mud_index: "Very High",
        rock_type: "Limestone",
        kkl_area: "North",
        description: "Iconic Galilee singletrack, well-drained limestone.",
        region: "Galilee",
    },
    {
        id: "hazorea",
        name: "Hazorea",
        lat: 32.605,
        lng: 35.120,
        length_km: 15.0,
        difficulty: "Medium",
        soil_type: "Heavy Clay", // 43.3% clay, 20.3% sand, 36.4% silt
        mud_index: "Very High",
        rock_type: "Basalt",
        kkl_area: "North",
        description: "Scenic Jezreel Valley trail, mixed basalt and chalk terrain.",
        region: "Jezreel Valley",
    },
    {
        id: "yatir",
        name: "Yatir Forest",
        lat: 31.344,
        lng: 35.098,
        length_km: 20.0,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 31.3% clay, 28.0% sand, 40.7% silt
        mud_index: "High",
        rock_type: "Sandstone",
        kkl_area: "South",
        description: "Largest planted forest in Israel, desert edge. Always rideable.",
        region: "Negev North",
    },
    {
        id: "sheluha-carmel",
        name: "Sheluha - Mount Carmel",
        lat: 32.652,
        lng: 34.974,
        length_km: 20.4,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 39.1% clay, 22.3% sand, 38.6% silt
        mud_index: "High",
        rock_type: "Limestone",
        kkl_area: "North",
        description: "Circular Carmel forest route with technical sections and thrilling descents. 530m elevation gain.",
        region: "Carmel",
    },
    // ============= South =============
    {
        id: "gvaram",
        name: "Gvar'am",
        lat: 31.524,
        lng: 34.575,
        length_km: 12.0,
        difficulty: "Basic",
        soil_type: "Clay/Silt", // 31.4% clay, 30.5% sand, 38.1% silt
        mud_index: "High",
        rock_type: "Sandstone",
        kkl_area: "South",
        description: "Sandy terrain, excellent drainage, rarely muddy.",
        region: "Negev North",
    },
    {
        id: "beeri",
        name: "Be'eri Forest",
        lat: 31.430,
        lng: 34.488,
        length_km: 23.0,
        difficulty: "Medium",
        soil_type: "Loam", // 30.1% clay, 33.9% sand, 36.1% silt
        mud_index: "Medium",
        rock_type: "Sandstone",
        kkl_area: "South",
        description: "Sandy negev trails near Kibbutz Be'eri.",
        region: "Negev North",
    },
    {
        id: "sugar-arava",
        name: "Sugar Trail (Arava)",
        lat: 29.855,
        lng: 35.050,
        length_km: 42.0,
        difficulty: "Hard",
        soil_type: "Sandy Loam", // 25.6% clay, 39.5% sand, 34.9% silt
        mud_index: "Medium",
        rock_type: "Sandstone",
        kkl_area: "South",
        description: "Desert singletrack, always rideable unless flash flood.",
        region: "Arava",
    },
    {
        id: "sharsheret",
        name: "Sharsheret Park - Gerar",
        lat: 31.370,
        lng: 34.500,
        length_km: 14.5,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 31.7% clay, 34.1% sand, 34.2% silt
        mud_index: "High",
        rock_type: "Sandstone",
        kkl_area: "South",
        description: "Sandy tracks through Gerar ravines.",
        region: "Negev North",
    },
    {
        id: "rafa",
        name: "Rafa Singletrack",
        lat: 31.283,
        lng: 34.352,
        length_km: 18.0,
        difficulty: "Medium",
        soil_type: "Sandy Loam", // 26.1% clay, 42.5% sand, 31.4% silt
        mud_index: "Medium",
        rock_type: "Sandstone",
        kkl_area: "South",
        description: "Desert-edge sand trails in the western Negev.",
        region: "Negev West",
    },
    {
        id: "lahav",
        name: "Lahav Forest",
        lat: 31.379,
        lng: 34.857,
        length_km: 22.0,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 30.5% clay, 30.6% sand, 38.9% silt
        mud_index: "High",
        rock_type: "Limestone",
        kkl_area: "South",
        description: "Negev highland forest with rocky chalk terrain.",
        region: "Negev North",
    },
    {
        id: "rimmon-lahav",
        name: "Rimmon - Lahav Forest",
        lat: 31.362,
        lng: 34.860,
        length_km: 8.0,
        difficulty: "Medium",
        soil_type: "Loam", // 29.7% clay, 32.3% sand, 38.0% silt
        mud_index: "Medium",
        rock_type: "Limestone",
        kkl_area: "South",
        description: "Forest singletrack with Byzantine ruins of Khirbet Rimmon. 130m elevation gain.",
        region: "Negev North",
    },
    {
        id: "ein-rafe",
        name: "Ein Rafe",
        lat: 31.791,
        lng: 35.098,
        length_km: 14.0,
        difficulty: "Medium",
        soil_type: "Clay/Silt", // 33.0% clay, 30.8% sand, 36.2% silt
        mud_index: "High",
        rock_type: "Limestone",
        kkl_area: "Center",
        description: "Jerusalem Hills singletrack along Nahal Kislom with diverse vegetation and 400m elevation gain.",
        region: "Jerusalem Hills",
    },
    {
        id: "birya",
        name: "Birya Forest",
        lat: 33.002,
        lng: 35.509,
        length_km: 16.0,
        difficulty: "Hard",
        soil_type: "Heavy Clay", // 45.2% clay, 21.3% sand, 33.5% silt
        mud_index: "Very High",
        rock_type: "Limestone",
        kkl_area: "North",
        description: "Upper Galilee, rocky and technical. Good winter trail.",
        region: "Galilee",
    },
];

// Soil type classification for mud logic
export const SOIL_CATEGORIES = {
    "Heavy Clay": "heavy_clay",
    "Clay/Silt": "clay_silt",
    "Loam": "loam",
    "Sandy Loam": "sandy_loam",
    "Sand/Loess": "sand",
    "Sand": "sand",
    "Desert": "desert",
};
