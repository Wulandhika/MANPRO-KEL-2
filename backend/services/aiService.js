// ==================================================
// FINDIT - AI MATCHING SERVICE
// ==================================================

// Text preprocessing
const {
    normalizeText,
    normalizeWord,
    tokenize,
    preprocessText,
    extractUniqueWords
} = require("../ai/preprocessing");

// TF-IDF
const {
    createTFIDFVectors
} = require("../ai/tfidf");

// Cosine Similarity
const {
    cosineSimilarity,
    calculateTextSimilarity
} = require("../ai/cosineSimilarity");

// Weighted Scoring
const {
    WEIGHTS,
    MATCH_THRESHOLD,
    calculateExactSimilarity,
    calculateDateSimilarity,
    calculateMatchDetails,
    calculateMatchScore,
    getMatchLevel,
    isMatch
} = require("../ai/weightedScoring");

// Matching Engine
const {
    rankItems,
    findMatches,
    getBestMatch,
    generateRecommendations
} = require("../ai/matchingEngine");

// ==================================================
// EXPORT AI SERVICE
// ==================================================

module.exports = {
    MATCH_THRESHOLD,
    WEIGHTS,

    // Preprocessing
    normalizeText,
    normalizeWord,
    tokenize,
    preprocessText,
    extractUniqueWords,

    // Text similarity
    createTFIDFVectors,
    cosineSimilarity,
    calculateTextSimilarity,
    calculateExactSimilarity,
    calculateDateSimilarity,

    // Matching score
    calculateMatchDetails,
    calculateMatchScore,
    getMatchLevel,
    isMatch,

    // Recommendations
    rankItems,
    findMatches,
    getBestMatch,
    generateRecommendations
};