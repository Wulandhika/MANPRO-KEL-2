// ==================================================
// FINDIT AI - TF-IDF
// ==================================================

const { tokenize } = require("./preprocessing");

const calculateTF = (tokens) => {
    const frequencies = new Map();

    if (!tokens.length) {
        return frequencies;
    }

    tokens.forEach((word) => {
        frequencies.set(
            word,
            (frequencies.get(word) || 0) + 1
        );
    });

    for (const [word, count] of frequencies) {
        frequencies.set(
            word,
            count / tokens.length
        );
    }

    return frequencies;
};

const calculateIDF = (documents) => {
    const documentFrequency = new Map();
    const totalDocuments = documents.length;

    documents.forEach((tokens) => {
        const uniqueWords = new Set(tokens);

        uniqueWords.forEach((word) => {
            documentFrequency.set(
                word,
                (documentFrequency.get(word) || 0) + 1
            );
        });
    });

    const idf = new Map();

    for (const [word, frequency] of documentFrequency) {
        const weight =
            Math.log(
                (totalDocuments + 1) /
                (frequency + 1)
            ) + 1;

        idf.set(word, weight);
    }

    return idf;
};

const createTFIDFVector = (tokens, idf) => {
    const tf = calculateTF(tokens);
    const vector = new Map();

    for (const [word, frequency] of tf) {
        vector.set(
            word,
            frequency * (idf.get(word) || 0)
        );
    }

    return vector;
};

const createTFIDFVectors = (texts = []) => {
    if (!Array.isArray(texts)) {
        return [];
    }

    const documents = texts.map(tokenize);
    const idf = calculateIDF(documents);

    return documents.map((tokens) =>
        createTFIDFVector(tokens, idf)
    );
};

module.exports = {
    calculateTF,
    calculateIDF,
    createTFIDFVector,
    createTFIDFVectors
};