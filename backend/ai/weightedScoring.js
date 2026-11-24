// ==================================================
// FINDIT AI - WEIGHTED SCORING
// ==================================================

const {
    preprocessText
} = require("./preprocessing");

const {
    calculateTextSimilarity
} = require("./cosineSimilarity");

const MATCH_THRESHOLD = 60;

const WEIGHTS = Object.freeze({
    name: 25,
    description: 25,
    category: 20,
    location: 10,
    color: 10,
    brand: 5,
    date: 5
});

const hasValue = (value) => {
    return value !== null &&
        value !== undefined &&
        String(value).trim() !== "";
};

const calculateExactSimilarity = (a, b) => {
    const first = preprocessText(a);
    const second = preprocessText(b);

    if (!first || !second) {
        return 0;
    }

    return first === second ? 1 : 0;
};

const calculateDateSimilarity = (
    lostDate,
    foundDate
) => {
    if (!hasValue(lostDate) || !hasValue(foundDate)) {
        return 0;
    }

    const first = new Date(lostDate).getTime();
    const second = new Date(foundDate).getTime();

    if (
        !Number.isFinite(first) ||
        !Number.isFinite(second)
    ) {
        return 0;
    }

    const difference =
        Math.abs(second - first) /
        (1000 * 60 * 60 * 24);

    if (difference === 0) return 1;
    if (difference <= 1) return 0.9;
    if (difference <= 3) return 0.7;
    if (difference <= 7) return 0.5;
    if (difference <= 14) return 0.3;

    return 0;
};

const getName = (data) =>
    data.item_name ?? data.name ?? data.title;

const getCategory = (data) =>
    data.category_id ?? data.category;

const getReportDate = (data) =>
    data.lost_date ??
    data.date ??
    data.report_date;

const getItemDate = (data) =>
    data.found_date ??
    data.date ??
    data.discovery_date;

const calculateMatchDetails = (report, item) => {
    if (!report || !item) {
        return {
            score: 0,
            breakdown: {},
            coverage: 0
        };
    }

    const attributes = [
        {
            key: "name",
            a: getName(report),
            b: getName(item),
            compare: calculateTextSimilarity
        },
        {
            key: "description",
            a: report.description,
            b: item.description,
            compare: calculateTextSimilarity
        },
        {
            key: "category",
            a: getCategory(report),
            b: getCategory(item),
            compare: calculateExactSimilarity
        },
        {
            key: "location",
            a: report.location,
            b: item.location,
            compare: calculateTextSimilarity
        },
        {
            key: "color",
            a: report.color,
            b: item.color,
            compare: calculateExactSimilarity
        },
        {
            key: "brand",
            a: report.brand,
            b: item.brand,
            compare: calculateExactSimilarity
        },
        {
            key: "date",
            a: getReportDate(report),
            b: getItemDate(item),
            compare: calculateDateSimilarity
        }
    ];

    const breakdown = {};
    let totalScore = 0;
    let coverage = 0;

    attributes.forEach((attribute) => {
        const weight = WEIGHTS[attribute.key];

        const available =
            hasValue(attribute.a) &&
            hasValue(attribute.b);

        const similarity = available
            ? attribute.compare(
                attribute.a,
                attribute.b
            )
            : 0;

        const weightedScore =
            similarity * weight;

        if (available) {
            coverage += weight;
        }

        totalScore += weightedScore;

        breakdown[attribute.key] = {
            available,
            similarity: Number(
                similarity.toFixed(4)
            ),
            weight,
            score: Number(
                weightedScore.toFixed(2)
            )
        };
    });

    return {
        score: Math.round(
            Math.min(100, Math.max(0, totalScore))
        ),
        coverage,
        breakdown
    };
};

const calculateMatchScore = (report, item) => {
    return calculateMatchDetails(report, item).score;
};

const getMatchLevel = (score) => {
    if (score >= 85) return "very_high";
    if (score >= 70) return "high";
    if (score >= MATCH_THRESHOLD) return "medium";

    return "low";
};

const isMatch = (report, item) => {
    return calculateMatchScore(report, item)
        >= MATCH_THRESHOLD;
};

module.exports = {
    WEIGHTS,
    MATCH_THRESHOLD,
    hasValue,
    calculateExactSimilarity,
    calculateDateSimilarity,
    calculateMatchDetails,
    calculateMatchScore,
    getMatchLevel,
    isMatch
};