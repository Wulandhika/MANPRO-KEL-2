// ==================================================
// FINDIT AI - UNIT TESTING
// ==================================================

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    normalizeText,
    preprocessText
} = require("./preprocessing");

const {
    calculateTextSimilarity
} = require("./cosineSimilarity");

const {
    calculateMatchScore,
    calculateDateSimilarity,
    MATCH_THRESHOLD,
    WEIGHTS
} = require("./weightedScoring");

const {
    rankItems,
    findMatches,
    getBestMatch,
    generateRecommendations
} = require("./matchingEngine");

const {
    lostReport,
    foundItems
} = require("./dummyData");

// TEST 1
test("Normalisasi teks", () => {
    assert.equal(
        normalizeText("  DOMPET HITAM!!!  "),
        "dompet hitam"
    );
});

// TEST 2
test("Menghapus stop words", () => {
    assert.equal(
        preprocessText("Saya kehilangan dompet di perpustakaan"),
        "dompet perpustakaan"
    );
});

// TEST 3
test("Normalisasi sinonim bahasa Indonesia", () => {
    assert.equal(
        preprocessText("HP black"),
        "handphone hitam"
    );
});

// TEST 4
test("Teks sama memiliki kemiripan mendekati 1", () => {
    const similarity = calculateTextSimilarity(
        "dompet hitam",
        "dompet hitam"
    );

    assert.ok(
        Math.abs(similarity - 1) < 0.000001
    );
});

// TEST 5
test("Teks berbeda memiliki kemiripan nol", () => {
    assert.equal(
        calculateTextSimilarity(
            "dompet hitam",
            "laptop putih"
        ),
        0
    );
});

// TEST 6
test("Teks kosong menghasilkan nilai nol", () => {
    assert.equal(
        calculateTextSimilarity("", ""),
        0
    );
});

// TEST 7
test("Total bobot harus 100", () => {
    const total = Object.values(WEIGHTS)
        .reduce((sum, value) => sum + value, 0);

    assert.equal(total, 100);
});

// TEST 8
test("Barang identik menghasilkan skor 100", () => {
    const score = calculateMatchScore(
        lostReport,
        foundItems[0]
    );

    assert.equal(score, 100);
});

// TEST 9
test("Barang berbeda tidak melewati threshold", () => {
    const score = calculateMatchScore(
        lostReport,
        foundItems[4]
    );

    assert.ok(score < MATCH_THRESHOLD);
});

// TEST 10
test("Skor seluruh barang berada pada rentang 0-100", () => {
    foundItems.forEach((item) => {
        const score = calculateMatchScore(
            lostReport,
            item
        );

        assert.ok(score >= 0 && score <= 100);
    });
});

// TEST 11
test("Rekomendasi diurutkan berdasarkan skor tertinggi", () => {
    const matches = rankItems(
        lostReport,
        foundItems
    );

    for (let i = 1; i < matches.length; i++) {
        assert.ok(
            matches[i - 1].match_score >=
            matches[i].match_score
        );
    }
});

// TEST 12
test("Barang yang benar berada di urutan pertama", () => {
    const bestMatch = getBestMatch(
        lostReport,
        foundItems
    );

    assert.equal(bestMatch.id, 101);
});

// TEST 13
test("Rekomendasi memenuhi batas minimum skor", () => {
    const matches = findMatches(
        lostReport,
        foundItems
    );

    matches.forEach((item) => {
        assert.ok(
            item.match_score >= MATCH_THRESHOLD
        );
    });
});

// TEST 14
test("Maksimal lima rekomendasi", () => {
    const result = generateRecommendations(
        lostReport,
        foundItems
    );

    assert.ok(
        result.recommendations.length <= 5
    );
});

// TEST 15
test("Input barang kosong tidak menyebabkan error", () => {
    assert.deepEqual(
        findMatches(lostReport, []),
        []
    );
});

// TEST 16
test("Input tidak valid tidak menyebabkan error", () => {
    assert.deepEqual(
        findMatches(null, foundItems),
        []
    );
});

// TEST 17
test("Tanggal tidak valid menghasilkan skor nol", () => {
    assert.equal(
        calculateDateSimilarity(
            "tanggal salah",
            "2026-11-20"
        ),
        0
    );
});

// TEST 18
test("Atribut kosong tidak menghasilkan kecocokan palsu", () => {
    assert.equal(
        calculateMatchScore({}, {}),
        0
    );
});

// TEST 19
test("Sinonim memiliki kemiripan tinggi", () => {
    const score = calculateTextSimilarity(
        "HP black",
        "Handphone hitam"
    );

    assert.ok(score > 0.99);
});

// TEST 20
test("Threshold tidak valid ditolak", () => {
    assert.throws(() => {
        findMatches(
            lostReport,
            foundItems,
            { threshold: 120 }
        );
    });
});

console.log("\n====================================");
console.log("HASIL SIMULASI AI MATCHING FINDIT");
console.log("====================================\n");

const results = rankItems(
    lostReport,
    foundItems
);

console.table(
    results.map((item) => ({
        ID: item.id,
        Barang: item.item_name,
        Skor: `${item.match_score}%`,
        Level: item.match_level
    }))
);

console.log(
    "\nRekomendasi terbaik:",
    getBestMatch(lostReport, foundItems)?.item_name
);