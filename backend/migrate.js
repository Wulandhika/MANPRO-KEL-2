const pool = require("./config/db");

async function migrate() {
  try {
    console.log("Starting database compatibility setup...");

    // 1. Users table compatibility
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      UPDATE users SET name = nama WHERE name IS NULL;

      CREATE OR REPLACE FUNCTION sync_user_name() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.name IS NOT NULL AND (NEW.nama IS NULL OR NEW.nama = '') THEN
          NEW.nama := NEW.name;
        ELSIF NEW.nama IS NOT NULL AND (NEW.name IS NULL OR NEW.name = '') THEN
          NEW.name := NEW.nama;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_sync_user_name ON users;
      CREATE TRIGGER trg_sync_user_name
      BEFORE INSERT OR UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION sync_user_name();
    `);

    // 2. Items table compatibility
    await pool.query(`
      ALTER TABLE items ADD COLUMN IF NOT EXISTS item_name VARCHAR(255);
      ALTER TABLE items ADD COLUMN IF NOT EXISTS category VARCHAR(100);
      ALTER TABLE items ADD COLUMN IF NOT EXISTS color VARCHAR(100);
      ALTER TABLE items ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
      ALTER TABLE items ADD COLUMN IF NOT EXISTS location VARCHAR(255);
      ALTER TABLE items ADD COLUMN IF NOT EXISTS storage_location VARCHAR(255);
      ALTER TABLE items ADD COLUMN IF NOT EXISTS found_date DATE;
      ALTER TABLE items ADD COLUMN IF NOT EXISTS found_time TIME;
      ALTER TABLE items ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE items ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'available';
      ALTER TABLE items ADD COLUMN IF NOT EXISTS created_by INTEGER;

      UPDATE items SET
        item_name = COALESCE(item_name, nama_barang),
        category = COALESCE(category, 'Umum'),
        color = COALESCE(color, warna),
        brand = COALESCE(brand, merek),
        location = COALESCE(location, lokasi),
        storage_location = COALESCE(storage_location, 'Gudang Pusat'),
        description = COALESCE(description, deskripsi),
        status = CASE WHEN status_barang = 'Aktif' THEN 'available' ELSE COALESCE(status, 'available') END,
        created_by = COALESCE(created_by, user_id),
        found_date = COALESCE(found_date, waktu_kejadian::date),
        found_time = COALESCE(found_time, waktu_kejadian::time)
      WHERE item_name IS NULL;

      CREATE OR REPLACE FUNCTION sync_items_data() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.item_name IS NOT NULL AND (NEW.nama_barang IS NULL OR NEW.nama_barang = '') THEN
          NEW.nama_barang := NEW.item_name;
        ELSIF NEW.nama_barang IS NOT NULL AND (NEW.item_name IS NULL OR NEW.item_name = '') THEN
          NEW.item_name := NEW.nama_barang;
        END IF;
        IF NEW.color IS NOT NULL AND (NEW.warna IS NULL OR NEW.warna = '') THEN
          NEW.warna := NEW.color;
        ELSIF NEW.warna IS NOT NULL AND (NEW.color IS NULL OR NEW.color = '') THEN
          NEW.color := NEW.warna;
        END IF;
        IF NEW.brand IS NOT NULL AND (NEW.merek IS NULL OR NEW.merek = '') THEN
          NEW.merek := NEW.brand;
        ELSIF NEW.merek IS NOT NULL AND (NEW.brand IS NULL OR NEW.brand = '') THEN
          NEW.brand := NEW.merek;
        END IF;
        IF NEW.location IS NOT NULL AND (NEW.lokasi IS NULL OR NEW.lokasi = '') THEN
          NEW.lokasi := NEW.location;
        ELSIF NEW.lokasi IS NOT NULL AND (NEW.location IS NULL OR NEW.location = '') THEN
          NEW.location := NEW.lokasi;
        END IF;
        IF NEW.description IS NOT NULL AND (NEW.deskripsi IS NULL OR NEW.deskripsi = '') THEN
          NEW.deskripsi := NEW.description;
        ELSIF NEW.deskripsi IS NOT NULL AND (NEW.description IS NULL OR NEW.description = '') THEN
          NEW.description := NEW.deskripsi;
        END IF;
        IF NEW.tipe_laporan IS NULL THEN
          NEW.tipe_laporan := 'Ditemukan';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_sync_items_data ON items;
      CREATE TRIGGER trg_sync_items_data
      BEFORE INSERT OR UPDATE ON items
      FOR EACH ROW EXECUTE FUNCTION sync_items_data();
    `);

    // 3. Reports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        category VARCHAR(100),
        item_name VARCHAR(255),
        color VARCHAR(100),
        brand VARCHAR(100),
        location VARCHAR(255),
        lost_date DATE,
        time_range VARCHAR(100),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Claims table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        item_id INTEGER,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Recommendations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        report_id INTEGER,
        item_id INTEGER,
        similarity_score DOUBLE PRECISION,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Migration completed successfully! All tables and columns are ready.");
    await pool.end();
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
