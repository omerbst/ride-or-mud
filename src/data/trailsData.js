// מאגר שבילים מקור: רשימות סינגלים של קק"ל (kkl.org.il)
// נתוני קרקע מ-SoilGrids (ISRIC) API — אחוזי חרסית/חול/סילט בעומק 0-5 ס"מ
// מדד בוץ נגזר מתכולת חרסית: >40% = גבוה מאוד, 30-40% = גבוה, 20-30% = בינוני, <20% = נמוך

export const HOME_LOCATION = {
    name: "תל מונד",
    lat: 32.2569,
    lng: 34.9194,
};

// מהירות נסיעה ממוצעת להערכת זמן נסיעה (ללא פקקים, בוקר מוקדם)
export const AVG_SPEED_KMH = 80;
export const ROAD_FACTOR = 1.3; // מתחשב במסלולים לא ישרים
export const MAX_DRIVE_MINUTES = 75;

export const trails = [
    // ============= מתחם בן שמן =============
    {
        id: "hadid-ben-shemen",
        name: "חדיד (ירוק) - בן שמן",
        lat: 31.968,
        lng: 34.945,
        length_km: 11.0,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 32.8% clay, 25.2% sand, 42.1% silt
        mud_index: "גבוה",
        rock_type: "גיר",
        kkl_area: "מרכז",
        description: "טכני וסלעי, מתמודד עם גשם בצורה יוצאת דופן.",
        region: "שפלה",
    },
    // ============= מרכז =============
    {
        id: "ayalon-canada",
        name: "פארק אילון-קנדה",
        lat: 31.842,
        lng: 34.995,
        length_km: 15.0,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 32.9% clay, 27.9% sand, 39.3% silt
        mud_index: "גבוה",
        rock_type: "גיר",
        kkl_area: "מרכז",
        description: "בעיקר סלעי, אך חלקים חרסיתיים עלולים להחליק.",
        region: "שפלה",
    },
    {
        id: "yaar-hakdoshim",
        name: "יער הקדושים",
        lat: 31.748,
        lng: 35.055,
        length_km: 14.0,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 31.0% clay, 30.1% sand, 38.8% silt
        mud_index: "גבוה",
        rock_type: "גיר",
        kkl_area: "מרכז",
        description: "הרי ירושלים, קרקע גירית מנקזת היטב גם בחורף.",
        region: "הרי ירושלים",
    },
    {
        id: "nahal-alexander",
        name: "נחל אלכסנדר",
        lat: 32.22045,
        lng: 34.98246,
        length_km: 20.0,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 39.8% clay, 21.3% sand, 38.9% silt
        mud_index: "גבוה",
        rock_type: "גיר",
        kkl_area: "מרכז",
        description: "לולאות מודולריות ליד כוכב יאיר עם פריחה ונופים פנורמיים. 270 מ׳ טיפוס.",
        region: "שרון",
    },
    {
        id: "zacharia",
        name: "זכריה",
        lat: 31.715,
        lng: 34.943,
        length_km: 13.5,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 32.9% clay, 28.1% sand, 38.9% silt
        mud_index: "גבוה",
        rock_type: "גיר",
        kkl_area: "מרכז",
        description: "סינגל זרימה ביער ישעי עם טיפוסים הדרגתיים ונופי עמק. 250 מ׳ טיפוס.",
        region: "שפלה",
    },
    // ============= צפון =============
    {
        id: "alon-hagalil",
        name: "אלון הגליל",
        lat: 32.706,
        lng: 35.255,
        length_km: 18.0,
        difficulty: "בינוני",
        soil_type: "חרסית כבדה", // 43.7% clay, 19.9% sand, 36.4% silt
        mud_index: "גבוה מאוד",
        rock_type: "גיר",
        kkl_area: "צפון",
        description: "סינגל אייקוני בגליל, גיר מנוקז היטב.",
        region: "גליל",
    },
    {
        id: "hazorea",
        name: "הזורע",
        lat: 32.605,
        lng: 35.120,
        length_km: 15.0,
        difficulty: "בינוני",
        soil_type: "חרסית כבדה", // 43.3% clay, 20.3% sand, 36.4% silt
        mud_index: "גבוה מאוד",
        rock_type: "בזלת",
        kkl_area: "צפון",
        description: "שביל נופי בעמק יזרעאל, שטח בזלת וגיר מעורב.",
        region: "עמק יזרעאל",
    },
    {
        id: "yatir",
        name: "יער יתיר",
        lat: 31.344,
        lng: 35.098,
        length_km: 20.0,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 31.3% clay, 28.0% sand, 40.7% silt
        mud_index: "גבוה",
        rock_type: "אבן חול",
        kkl_area: "דרום",
        description: "היער הנטוע הגדול בישראל, שולי מדבר. תמיד רכיב.",
        region: "צפון הנגב",
    },
    {
        id: "sheluha-carmel",
        name: "שלוחה - הר הכרמל",
        lat: 32.652,
        lng: 34.974,
        length_km: 20.4,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 39.1% clay, 22.3% sand, 38.6% silt
        mud_index: "גבוה",
        rock_type: "גיר",
        kkl_area: "צפון",
        description: "מסלול מעגלי ביער הכרמל עם קטעים טכניים וירידות מרגשות. 530 מ׳ טיפוס.",
        region: "כרמל",
    },
    // ============= דרום =============
    {
        id: "gvaram",
        name: "גבר'עם",
        lat: 31.524,
        lng: 34.575,
        length_km: 12.0,
        difficulty: "בסיסי",
        soil_type: "חרסית/סילט", // 31.4% clay, 30.5% sand, 38.1% silt
        mud_index: "גבוה",
        rock_type: "אבן חול",
        kkl_area: "דרום",
        description: "שטח חולי, ניקוז מצוין, כמעט אף פעם לא בוצי.",
        region: "צפון הנגב",
    },
    {
        id: "beeri",
        name: "יער בארי",
        lat: 31.430,
        lng: 34.488,
        length_km: 23.0,
        difficulty: "בינוני",
        soil_type: "לס", // 30.1% clay, 33.9% sand, 36.1% silt
        mud_index: "בינוני",
        rock_type: "אבן חול",
        kkl_area: "דרום",
        description: "שבילי נגב חוליים ליד קיבוץ בארי.",
        region: "צפון הנגב",
    },
    {
        id: "sugar-arava",
        name: "שביל הסוכר (ערבה)",
        lat: 29.855,
        lng: 35.050,
        length_km: 42.0,
        difficulty: "קשה",
        soil_type: "לס חולי", // 25.6% clay, 39.5% sand, 34.9% silt
        mud_index: "בינוני",
        rock_type: "אבן חול",
        kkl_area: "דרום",
        description: "סינגל מדברי, תמיד רכיב אלא אם יש שיטפון.",
        region: "ערבה",
    },
    {
        id: "sharsheret",
        name: "פארק שרשרת - גרר",
        lat: 31.370,
        lng: 34.500,
        length_km: 14.5,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 31.7% clay, 34.1% sand, 34.2% silt
        mud_index: "גבוה",
        rock_type: "אבן חול",
        kkl_area: "דרום",
        description: "שבילים חוליים דרך ערוצי גרר.",
        region: "צפון הנגב",
    },
    {
        id: "rafa",
        name: "סינגל רפה",
        lat: 31.283,
        lng: 34.352,
        length_km: 18.0,
        difficulty: "בינוני",
        soil_type: "לס חולי", // 26.1% clay, 42.5% sand, 31.4% silt
        mud_index: "בינוני",
        rock_type: "אבן חול",
        kkl_area: "דרום",
        description: "שבילי חול בשולי המדבר במערב הנגב.",
        region: "מערב הנגב",
    },
    {
        id: "lahav",
        name: "יער להב",
        lat: 31.379,
        lng: 34.857,
        length_km: 22.0,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 30.5% clay, 30.6% sand, 38.9% silt
        mud_index: "גבוה",
        rock_type: "גיר",
        kkl_area: "דרום",
        description: "יער רמות הנגב עם שטח גירי סלעי.",
        region: "צפון הנגב",
    },
    {
        id: "rimmon-lahav",
        name: "רימון - יער להב",
        lat: 31.362,
        lng: 34.860,
        length_km: 8.0,
        difficulty: "בינוני",
        soil_type: "לס", // 29.7% clay, 32.3% sand, 38.0% silt
        mud_index: "בינוני",
        rock_type: "גיר",
        kkl_area: "דרום",
        description: "סינגל יער עם חורבות ביזנטיות של ח׳רבת רימון. 130 מ׳ טיפוס.",
        region: "צפון הנגב",
    },
    {
        id: "ein-rafe",
        name: "עין ראפה",
        lat: 31.791,
        lng: 35.098,
        length_km: 14.0,
        difficulty: "בינוני",
        soil_type: "חרסית/סילט", // 33.0% clay, 30.8% sand, 36.2% silt
        mud_index: "גבוה",
        rock_type: "גיר",
        kkl_area: "מרכז",
        description: "סינגל בהרי ירושלים לאורך נחל כסלון עם צמחייה מגוונת. 400 מ׳ טיפוס.",
        region: "הרי ירושלים",
    },
    {
        id: "birya",
        name: "יער בירייה",
        lat: 33.002,
        lng: 35.509,
        length_km: 16.0,
        difficulty: "קשה",
        soil_type: "חרסית כבדה", // 45.2% clay, 21.3% sand, 33.5% silt
        mud_index: "גבוה מאוד",
        rock_type: "גיר",
        kkl_area: "צפון",
        description: "גליל עליון, סלעי וטכני. שביל חורף מצוין.",
        region: "גליל",
    },
];

// סיווג סוג קרקע ללוגיקת בוץ
export const SOIL_CATEGORIES = {
    "חרסית כבדה": "heavy_clay",
    "חרסית/סילט": "clay_silt",
    "לס": "loam",
    "לס חולי": "sandy_loam",
    "חול/לס": "sand",
    "חול": "sand",
    "מדבר": "desert",
};
