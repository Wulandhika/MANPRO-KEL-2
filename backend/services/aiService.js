// ==========================================
// FINDIT AI MATCHING SERVICE
// ==========================================

const MATCH_THRESHOLD = 60;

// Normalisasi teks
const normalizeText = (value) => {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
};

// Memecah teks menjadi kata
const tokenize = (text) => {
    const normalized = normalizeText(text);

    if (!normalized) {
        return [];
    }

    const stopWords = new Set([
        "yang", "dan", "di", "ke",
        "dari", "dengan", "ada",
        "ini", "itu", "pada",
        "sebuah", "barang"
    ]);

    return normalized
        .split(" ")
        .filter((word) => !stopWords.has(word));
};

// Menghitung kemiripan menggunakan Jaccard
const calculateTextSimilarity = (textA, textB) => {
    const wordsA = new Set(tokenize(textA));
    const wordsB = new Set(tokenize(textB));

    if (!wordsA.size || !wordsB.size) {
        return 0;
    }

    const intersection = [...wordsA].filter(
        (word) => wordsB.has(word)
    );

    const union = new Set([
        ...wordsA,
        ...wordsB
    ]);

    return intersection.length / union.size;
};

// Menghitung kesamaan atribut
const calculateExactSimilarity = (valueA, valueB) => {
    const a = normalizeText(valueA);
    const b = normalizeText(valueB);

    if (!a || !b) {
        return 0;
    }

    return a === b ? 1 : 0;
};

// Menghitung skor kemiripan barang
const calculateMatchScore = (report, item) => {
    if (!report || !item) {
        return 0;
    }

    const nameScore = calculateTextSimilarity(
        report.item_name || report.name || report.title,
        item.item_name || item.name || item.title
    );

    const categoryScore = calculateExactSimilarity(
        report.category_id ?? report.category,
        item.category_id ?? item.category
    );

    const descriptionScore = calculateTextSimilarity(
        report.description,
        item.description
    );

    const locationScore = calculateTextSimilarity(
        report.location,
        item.location
    );

    const colorScore = calculateExactSimilarity(
        report.color,
        item.color
    );

    const totalScore =
        nameScore * 30 +
        categoryScore * 25 +
        descriptionScore * 25 +
        locationScore * 10 +
        colorScore * 10;

    return Math.round(totalScore);
};

// Menentukan tingkat kecocokan
const getMatchLevel = (score) => {
    if (score >= 85) {
        return "very_high";
    }

    if (score >= 70) {
        return "high";
    }

    if (score >= MATCH_THRESHOLD) {
        return "medium";
    }

    return "low";
};

// Memeriksa kecocokan barang
const isMatch = (report, item) => {
    return calculateMatchScore(
        report,
        item
    ) >= MATCH_THRESHOLD;
};

// Menghasilkan rekomendasi barang
const findMatches = (report, items = []) => {
    if (!report || !Array.isArray(items)) {
        return [];
    }

    return items
        .filter((item) => item && typeof item === "object")
        .map((item) => {
            const score = calculateMatchScore(
                report,
                item
            );

            return {
                ...item,
                match_score: score,
                match_level: getMatchLevel(score)
            };
        })
        .filter(
            (item) =>
                item.match_score >= MATCH_THRESHOLD
        )
        .sort(
            (a, b) =>
                b.match_score - a.match_score
        );
};

// ==========================================
// EXPORT SERVICE
// ==========================================

module.exports = {
    MATCH_THRESHOLD,
    normalizeText,
    tokenize,
    calculateTextSimilarity,
    calculateExactSimilarity,
    calculateMatchScore,
    getMatchLevel,
    isMatch,
    findMatches
};