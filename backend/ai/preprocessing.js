// ==================================================
// FINDIT AI - TEXT PREPROCESSING
// ==================================================

const STOP_WORDS = new Set([
    "yang", "dan", "di", "ke", "dari", "dengan",
    "ada", "ini", "itu", "pada", "sebuah", "barang",
    "saya", "aku", "kami", "kita", "tersebut",
    "untuk", "oleh", "saat", "ketika", "telah",
    "sudah", "juga", "atau", "adalah", "merupakan",
    "sekitar", "milik", "berada", "suatu",
    "kehilangan", "hilang", "ditemukan", "menemukan"
]);

const SYNONYMS = {
    smartphone: "handphone",
    ponsel: "handphone",
    hp: "handphone",
    cellphone: "handphone",
    notebook: "laptop",
    wallet: "dompet",
    backpack: "ransel",
    headset: "headphone",
    black: "hitam",
    white: "putih",
    blue: "biru",
    red: "merah",
    green: "hijau",
    yellow: "kuning",
    brown: "cokelat",
    coklat: "cokelat",
    grey: "abuabu",
    gray: "abuabu",
    library: "perpustakaan",
    parkiran: "parkir",
    bermerek: "merek",
    berwarna: "warna",
    goresan: "gores",
    tergores: "gores"
};

const normalizeText = (value) => {
    return String(value ?? "")
        .normalize("NFKC")
        .toLowerCase()
        .replace(/abu[\s-]+abu/g, "abuabu")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const normalizeWord = (word) => {
    return SYNONYMS[word] || word;
};

const tokenize = (text) => {
    const normalized = normalizeText(text);

    if (!normalized) {
        return [];
    }

    return normalized
        .split(" ")
        .map(normalizeWord)
        .filter((word) => {
            return word.length > 0 &&
                !STOP_WORDS.has(word);
        });
};

const preprocessText = (text) => {
    return tokenize(text).join(" ");
};

const extractUniqueWords = (text) => {
    return [...new Set(tokenize(text))];
};

module.exports = {
    STOP_WORDS,
    SYNONYMS,
    normalizeText,
    normalizeWord,
    tokenize,
    preprocessText,
    extractUniqueWords
};