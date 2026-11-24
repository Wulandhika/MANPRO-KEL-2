
const pool = require("../config/db");

const {
    generateRecommendations
} = require("./aiService");

// ==================================================
// FINDIT - AI MATCHING SERVICE
// Integrasi AI dengan PostgreSQL
// ==================================================

const prepareDate = (value) => {
    if (value instanceof Date) {
        if (!Number.isFinite(value.getTime())) {
            return null;
        }

        const year = value.getFullYear();
        const month = String(
            value.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            value.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return value;
};

// ==================================================
// MEMPROSES REKOMENDASI LAPORAN
// ==================================================

const processReportMatching = async (report) => {
    if (!report || !report.id || !report.user_id) {
        throw new Error("Data laporan tidak valid");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Memastikan laporan masih tersedia dan
        // mengunci laporan selama proses matching
        const reportResult = await client.query(
            `SELECT *
             FROM reports
             WHERE id = $1
             AND user_id = $2
             FOR UPDATE`,
            [report.id, report.user_id]
        );

        const currentReport = reportResult.rows[0];

        if (!currentReport) {
            throw new Error("Laporan tidak ditemukan");
        }

        // Mengambil seluruh barang temuan yang tersedia.
        // Tidak menggunakan pagination katalog frontend.
        const itemResult = await client.query(
            `SELECT
                id,
                item_name,
                category,
                color,
                brand,
                location,
                storage_location,
                found_date,
                found_time,
                description,
                status
             FROM items
             WHERE status = 'available'
             AND found_date >= $1
             ORDER BY id ASC FOR SHARE`,
            [currentReport.lost_date]
        );

        const normalizedReport = {
            ...currentReport,
            lost_date: prepareDate(
                currentReport.lost_date
            )
        };

        const candidates = itemResult.rows.map(
            (item) => ({
                ...item,
                found_date: prepareDate(
                    item.found_date
                )
            })
        );

        // Menjalankan algoritma AI
        const result = generateRecommendations(
            normalizedReport,
            candidates
        );

        // Menghapus hasil pencocokan lama supaya
        // rekomendasi tidak mengalami duplikasi
        await client.query(
            `DELETE FROM recommendations
             WHERE report_id = $1
             AND user_id = $2`,
            [
                currentReport.id,
                currentReport.user_id
            ]
        );

        const savedRecommendations = [];

        // Menyimpan maksimal lima rekomendasi terbaik
        for (const match of result.recommendations) {
            const saved = await client.query(
                `INSERT INTO recommendations (
                    user_id,
                    report_id,
                    item_id,
                    similarity_score
                )
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [
                    currentReport.user_id,
                    currentReport.id,
                    match.id,
                    match.match_score
                ]
            );

            const recommendation = saved.rows[0];

            savedRecommendations.push({
                recommendation_id: recommendation.id,
                report_id: currentReport.id,
                item_id: match.id,
                item_name: match.item_name,
                category: match.category,
                color: match.color,
                brand: match.brand,
                location: match.location,
                storage_location: match.storage_location,
                found_date: match.found_date,
                found_time: match.found_time,
                similarity_score: match.match_score,
                match_score: match.match_score,
                match_level: match.match_level,
                match_coverage: match.match_coverage
            });
        }

        await client.query("COMMIT");

        console.log(
            `[AI MATCHING] Report #${currentReport.id} | ` +
            `${candidates.length} kandidat | ` +
            `${savedRecommendations.length} rekomendasi`
        );

        return {
            success: true,
            status: "completed",
            report_id: currentReport.id,
            algorithm: result.algorithm,
            threshold: result.threshold,
            total_candidates: candidates.length,
            total_matches: savedRecommendations.length,
            recommendations: savedRecommendations
        };

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "[AI MATCHING ERROR]",
            error.message
        );

        throw error;

    } finally {
        client.release();
    }
};

// ==================================================
// EXPORT
// ==================================================

const refreshAllMatching = async () => {
    const result = await pool.query(`
        SELECT id, user_id
        FROM reports
        WHERE status = 'pending'
        ORDER BY id ASC
    `);

    let processed = 0;
    let failed = 0;
    let totalMatches = 0;

    for (const report of result.rows) {
        try {
            const matching = await processReportMatching(report);

            processed++;
            totalMatches += matching.total_matches;
        } catch (error) {
            failed++;

            console.error(
                "[AUTO MATCHING ERROR]",
                report.id,
                error.message
            );
        }
    }

    return {
        success: failed === 0,
        status: failed === 0 ? "completed" : "partial",
        processed_reports: processed,
        failed_reports: failed,
        total_matches: totalMatches
    };
};

module.exports = {
    processReportMatching,
    refreshAllMatching
};

