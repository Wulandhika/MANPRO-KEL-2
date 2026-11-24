// ==================================================
// FINDIT AI - COSINE SIMILARITY
// ==================================================

const {
    createTFIDFVectors
} = require("./tfidf");

const dotProduct = (vectorA, vectorB) => {
    let result = 0;

    for (const [word, value] of vectorA) {
        result += value * (vectorB.get(word) || 0);
    }

    return result;
};

const vectorMagnitude = (vector) => {
    let total = 0;

    for (const value of vector.values()) {
        total += value * value;
    }

    return Math.sqrt(total);
};

const cosineSimilarity = (vectorA, vectorB) => {
    if (
        !(vectorA instanceof Map) ||
        !(vectorB instanceof Map)
    ) {
        return 0;
    }

    const magnitudeA = vectorMagnitude(vectorA);
    const magnitudeB = vectorMagnitude(vectorB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    const similarity =
        dotProduct(vectorA, vectorB) /
        (magnitudeA * magnitudeB);

    return Math.max(
        0,
        Math.min(1, similarity)
    );
};

const calculateTextSimilarity = (textA, textB) => {
    const [vectorA, vectorB] =
        createTFIDFVectors([textA, textB]);

    return cosineSimilarity(vectorA, vectorB);
};

module.exports = {
    dotProduct,
    vectorMagnitude,
    cosineSimilarity,
    calculateTextSimilarity
};