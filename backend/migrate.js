
const pool = require("./config/db");

async function migrate() {
    let client;

    try {
        client = await pool.connect();

        console.log("====================================");
        console.log("DATABASE MIGRATION FINDIT");
        console.log("====================================");

        await client.query("BEGIN");

        // ====================================
        // 1. TABEL USERS
        // ====================================

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),

                CONSTRAINT users_role_check
                    CHECK (role IN ('user', 'admin'))
            );
        `);

        await client.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS is_active
            BOOLEAN NOT NULL DEFAULT TRUE;
        `);

        await client.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS nim_nip VARCHAR(30);

            CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nim_nip
            ON users(nim_nip)
            WHERE nim_nip IS NOT NULL;
        `);

        console.log("[OK] Tabel users");

        // ====================================
        // 2. TABEL ITEMS
        // ====================================

        await client.query(`
            CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                item_name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                color VARCHAR(100),
                brand VARCHAR(100),
                location VARCHAR(255) NOT NULL,
                storage_location VARCHAR(255),
                found_date DATE NOT NULL,
                found_time TIME,
                description TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'available',
                created_by INTEGER REFERENCES users(id)
                    ON DELETE SET NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        console.log("[OK] Tabel items");

        // ====================================
        // 3. TABEL REPORTS
        // ====================================

        await client.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
                category VARCHAR(100) NOT NULL,
                item_name VARCHAR(255) NOT NULL,
                color VARCHAR(100),
                brand VARCHAR(100),
                location VARCHAR(255) NOT NULL,
                lost_date DATE NOT NULL,
                time_range VARCHAR(100),
                description TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

                CONSTRAINT reports_id_user_unique
                    UNIQUE (id, user_id)
            );
        `);

        console.log("[OK] Tabel reports");

        // ====================================
        // 4. TABEL CLAIMS
        // ====================================

        await client.query(`
            CREATE TABLE IF NOT EXISTS claims (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
                item_id INTEGER NOT NULL
                    REFERENCES items(id) ON DELETE RESTRICT,
                description TEXT NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

                CONSTRAINT claims_status_check
                    CHECK (
                        status IN (
                            'pending',
                            'approved',
                            'rejected',
                            'cancelled'
                        )
                    )
            );
        `);

        console.log("[OK] Tabel claims");

        // ====================================
        // 5. TABEL NOTIFICATIONS
        // ====================================

        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) NOT NULL DEFAULT 'system',
                is_read BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        console.log("[OK] Tabel notifications");

        // ====================================
        // 6. TABEL RECOMMENDATIONS
        // ====================================

        await client.query(`
            CREATE TABLE IF NOT EXISTS recommendations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
                report_id INTEGER NOT NULL,
                item_id INTEGER NOT NULL
                    REFERENCES items(id) ON DELETE CASCADE,
                similarity_score DOUBLE PRECISION NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),

                CONSTRAINT recommendations_report_fk
                    FOREIGN KEY (report_id, user_id)
                    REFERENCES reports(id, user_id)
                    ON DELETE CASCADE,

                CONSTRAINT recommendations_score_check
                    CHECK (
                        similarity_score >= 0
                        AND similarity_score <= 100
                    ),

                CONSTRAINT recommendations_unique
                    UNIQUE (report_id, item_id)
            );
        `);

        console.log("[OK] Tabel recommendations");

        // ====================================
        // 7. INDEX DATABASE
        // ====================================

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_items_category
                ON items(category);

            CREATE INDEX IF NOT EXISTS idx_items_status
                ON items(status);

            CREATE INDEX IF NOT EXISTS idx_items_found_date
                ON items(found_date);

            CREATE INDEX IF NOT EXISTS idx_items_matching
                ON items(status, found_date);

            CREATE INDEX IF NOT EXISTS idx_items_created_by
                ON items(created_by);

            CREATE INDEX IF NOT EXISTS idx_reports_user_id
                ON reports(user_id);

            CREATE INDEX IF NOT EXISTS idx_reports_status
                ON reports(status);

            CREATE INDEX IF NOT EXISTS idx_claims_user_id
                ON claims(user_id);

            CREATE INDEX IF NOT EXISTS idx_claims_item_id
                ON claims(item_id);

            CREATE INDEX IF NOT EXISTS idx_claims_status
                ON claims(status);

            CREATE INDEX IF NOT EXISTS idx_notifications_user_id
                ON notifications(user_id, created_at DESC);

            CREATE INDEX IF NOT EXISTS idx_notifications_unread
                ON notifications(user_id)
                WHERE is_read = FALSE;

            CREATE INDEX IF NOT EXISTS idx_recommendations_user_id
                ON recommendations(user_id, similarity_score DESC);

            CREATE INDEX IF NOT EXISTS idx_recommendations_item_id
                ON recommendations(item_id);

            CREATE INDEX IF NOT EXISTS idx_recommendations_report_id
                ON recommendations(report_id);

            CREATE UNIQUE INDEX IF NOT EXISTS idx_claims_pending_unique
                ON claims(user_id, item_id)
                WHERE status = 'pending';
        `);

        console.log("[OK] Index database");

        // ====================================
        // 8. AUTOMATIC UPDATE TIMESTAMP
        // ====================================

        await client.query(`
            CREATE OR REPLACE FUNCTION update_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at := NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trg_items_updated_at
                ON items;

            CREATE TRIGGER trg_items_updated_at
                BEFORE UPDATE ON items
                FOR EACH ROW
                EXECUTE FUNCTION update_timestamp();

            DROP TRIGGER IF EXISTS trg_reports_updated_at
                ON reports;

            CREATE TRIGGER trg_reports_updated_at
                BEFORE UPDATE ON reports
                FOR EACH ROW
                EXECUTE FUNCTION update_timestamp();

            DROP TRIGGER IF EXISTS trg_claims_updated_at
                ON claims;

            CREATE TRIGGER trg_claims_updated_at
                BEFORE UPDATE ON claims
                FOR EACH ROW
                EXECUTE FUNCTION update_timestamp();
        `);

        console.log("[OK] Trigger updated_at");

        // ====================================
        // 9. CEK TABEL DATABASE
        // ====================================

        const result = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        await client.query("COMMIT");

        console.log("");
        console.log("====================================");
        console.log("MIGRATION DATABASE BERHASIL");
        console.log("====================================");
        console.log("Database FindIt siap digunakan.");
        console.log("Total tabel:", result.rowCount);

        console.table(result.rows);

    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError.message
                );
            }
        }

        console.error("");
        console.error("MIGRATION DATABASE GAGAL");
        console.error("Error:", error.message);

        process.exitCode = 1;

    } finally {
        if (client) {
            client.release();
        }

        await pool.end();
    }
}

migrate();


