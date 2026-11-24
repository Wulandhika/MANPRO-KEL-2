// ==================================================
// FINDIT AI - MATCHING ENGINE
// ==================================================

const {
    MATCH_THRESHOLD,
    calculateMatchDetails,
    calculateMatchScore,
    getMatchLevel,
    isMatch
} = require("./weightedScoring");

const rankItems = (report, items = []) => {
    if (
        !report ||
        typeof report !== "object" ||
        !Array.isArray(items)
    ) {
        return [];
    }

    return items
        .filter((item) => {
            return item &&
                typeof item === "object" &&
                !Array.isArray(item);
        })
        .map((item) => {
            const result =
                calculateMatchDetails(report, item);

            return {
                ...item,
                match_score: result.score,
                similarity_score: result.score,
                match_level: getMatchLevel(
                    result.score
                ),
                match_coverage: result.coverage,
                match_details: result.breakdown
            };
        })
        .sort((a, b) =>
            b.match_score - a.match_score
        );
};

const findMatches = (
    report,
    items = [],
    options = {}
) => {
    const threshold =
        options.threshold ?? MATCH_THRESHOLD;

    const limit =
        options.limit ?? Infinity;

    if (
        !Number.isFinite(threshold) ||
        threshold < 0 ||
        threshold > 100
    ) {
        throw new Error(
            "Threshold harus antara 0 dan 100"
        );
    }

    if (
        limit !== Infinity &&
        (!Number.isInteger(limit) || limit < 1)
    ) {
        throw new Error(
            "Limit harus berupa bilangan bulat positif"
        );
    }

    return rankItems(report, items)
        .filter((item) =>
            item.match_score >= threshold
        )
        .slice(0, limit);
};

const getBestMatch = (report, items = []) => {
    const matches = findMatches(
        report,
        items,
        { limit: 1 }
    );

    return matches[0] || null;
};

const generateRecommendations = (
    report,
    items = []
) => {
    const matches = findMatches(
        report,
        items,
        { limit: 5 }
    );

    return {
        success: true,
        report_id: report?.id ?? null,
        algorithm: "TF-IDF + Cosine Similarity + Weighted Scoring",
        threshold: MATCH_THRESHOLD,
        total_candidates: Array.isArray(items)
            ? items.length
            : 0,
        total_matches: matches.length,
        recommendations: matches
    };
};

module.exports = {
    MATCH_THRESHOLD,
    rankItems,
    findMatches,
    getBestMatch,
    generateRecommendations,
    calculateMatchScore,
    getMatchLevel,
    isMatch
};