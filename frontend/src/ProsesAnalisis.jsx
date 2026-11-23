
import { useEffect, useMemo, useState } from "react";
import "./ProsesAnalisis.css";

// ========================================
// FUNGSI BANTU
// ========================================

function Icon({ name }) {
  return (
    <span
      className="material-symbols-outlined"
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

function normal(text) {
  return String(text ?? "").trim().toLowerCase();
}

function tanggalIndonesia(value) {
  if (!value) return "-";

  const tanggal = new Date(value);

  if (Number.isNaN(tanggal.getTime())) {
    return "-";
  }

  return tanggal.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ikonKategori(kategori = "") {
  const teks = normal(kategori);

  if (/botol|tumbler/.test(teks)) {
    return "water_bottle";
  }

  if (/kunci/.test(teks)) {
    return "key";
  }

  if (/tas/.test(teks)) {
    return "backpack";
  }

  if (/dompet/.test(teks)) {
    return "wallet";
  }

  if (/elektronik|laptop|tablet/.test(teks)) {
    return "devices";
  }

  if (/pakaian|jaket/.test(teks)) {
    return "checkroom";
  }

  if (/dokumen/.test(teks)) {
    return "badge";
  }

  return "inventory_2";
}

// Sama dengan simulasi skor di App.jsx.
// Ini belum menggunakan AI/NLP backend.

function skorKemiripan(a, b) {
  let skor = 0;

  if (normal(a.kategori) === normal(b.kategori)) {
    skor += 35;
  }

  if (
    a.merek &&
    b.merek &&
    normal(a.merek) === normal(b.merek)
  ) {
    skor += 20;
  }

  if (
    a.warna &&
    b.warna &&
    normal(a.warna) === normal(b.warna)
  ) {
    skor += 20;
  }

  if (normal(a.lokasi) === normal(b.lokasi)) {
    skor += 5;
  }

  function kata(text) {
    return new Set(
      normal(text)
        .split(/[^\p{L}\p{N}]+/u)
        .filter((x) => x.length > 2)
    );
  }

  const kataA = kata(`${a.nama} ${a.ciri}`);
  const kataB = kata(`${b.nama} ${b.ciri}`);

  const sama = [...kataA].filter((x) =>
    kataB.has(x)
  ).length;

  skor += Math.min(20, sama * 4);

  return Math.min(100, skor);
}

// ========================================
// KOMPONEN TAHAP PROSES
// ========================================

function Tahap({
  nomor,
  judul,
  deskripsi,
  selesai,
  aktif,
  terakhir = false,
}) {
  return (
    <div className="pa-step">
      <div className="pa-step-indicator">
        <div
          className={`pa-step-circle ${
            selesai
              ? "pa-step-done"
              : aktif
                ? "pa-step-active"
                : "pa-step-pending"
          }`}
        >
          {selesai ? (
            <Icon name="check" />
          ) : aktif ? (
            <span className="pa-mini-spinner" />
          ) : (
            nomor
          )}
        </div>

        {!terakhir && (
          <div
            className={`pa-step-line ${
              selesai ? "pa-line-done" : ""
            }`}
          />
        )}
      </div>

      <div className="pa-step-content">
        <div className="pa-step-heading">
          <h3 className={aktif ? "pa-blue-text" : ""}>
            {judul}
          </h3>

          {selesai ? (
            <span className="pa-step-badge pa-badge-done">
              Selesai
            </span>
          ) : aktif ? (
            <span className="pa-step-badge pa-badge-active">
              <span className="pa-small-dot" />
              Sedang berlangsung...
            </span>
          ) : (
            <span className="pa-step-badge pa-badge-wait">
              Menunggu
            </span>
          )}
        </div>

        <p>{deskripsi}</p>
      </div>
    </div>
  );
}

// ========================================
// HALAMAN PROSES ANALISIS
// ========================================

export default function ProsesAnalisis({
  laporan = null,
  barang = [],
  pengguna = null,
  pergi = () => {},
  keluar = () => {},
}) {
  const [selesai, setSelesai] = useState(false);
  const [menuBuka, setMenuBuka] = useState(false);

  // Animasi demonstrasi proses pencocokan.
  // Bukan request ke server AI.
  useEffect(() => {
    setSelesai(false);

    if (!laporan) return;

    const timer = setTimeout(() => {
      setSelesai(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [laporan?.id]);

  // Menghitung rekomendasi berdasarkan data
  // laporan yang tersedia di browser.
  const rekomendasi = useMemo(() => {
    if (!laporan) return [];

    return barang
      .filter((item) => {
        if (item.id === laporan.id) return false;
        if (item.tipe === laporan.tipe) return false;

        return ["Hilang", "Ditemukan"].includes(
          item.status
        );
      })
      .map((item) => ({
        ...item,
        skor: skorKemiripan(laporan, item),
      }))
      .filter((item) => item.skor >= 20)
      .sort((a, b) => b.skor - a.skor)
      .slice(0, 5);
  }, [laporan, barang]);

  // ======================================
  // LAPORAN TIDAK DITEMUKAN
  // ======================================

  if (!laporan) {
    return (
      <div className="pa-page">
        <main className="pa-error-page">
          <Icon name="error_outline" />
          <h2>Laporan tidak ditemukan</h2>

          <p>
            Data laporan mungkin belum tersimpan
            atau alamat halaman tidak sesuai.
          </p>

          <button
            className="pa-primary-button"
            onClick={() => pergi("laporan-saya")}
          >
            Lihat Laporan Saya
          </button>
        </main>
      </div>
    );
  }

  // ======================================
  // HAK AKSES LAPORAN
  // ======================================

  if (
    !pengguna ||
    (
      pengguna.role !== "admin" &&
      laporan.pelapor !== pengguna.email
    )
  ) {
    return (
      <div className="pa-page">
        <main className="pa-error-page">
          <Icon name="lock" />
          <h2>Login diperlukan</h2>

          <p>
            Masuk menggunakan akun pemilik
            laporan untuk melihat prosesnya.
          </p>

          <button
            className="pa-primary-button"
            onClick={() => pergi("masuk")}
          >
            Masuk
          </button>
        </main>
      </div>
    );
  }

  // ======================================
  // INFORMASI LAPORAN
  // ======================================

  const idLaporan = `#LPR-${String(laporan.id)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-8)
    .toUpperCase()}`;

  const hasilAda = rekomendasi.length > 0;

  return (
    <div className="pa-page">

      {/* ===================================
          NAVBAR
      =================================== */}

      <header className="pa-header">
        <div className="pa-navbar">

          <button
            className="pa-brand"
            onClick={() => pergi("beranda")}
          >
            <span className="pa-brand-icon">
              <Icon name="search" />
            </span>

            <span>
              <strong>FindIt</strong>
              <small>SISTEM KAMPUS</small>
            </span>
          </button>

          <nav className="pa-links">
            <button
              onClick={() => pergi("beranda")}
            >
              Beranda
            </button>

            <button
              onClick={() => pergi("cari")}
            >
              Cari Barang
            </button>

            <button
              className="pa-nav-active"
              onClick={() => pergi("lapor-hilang")}
            >
              Lapor Hilang
            </button>

            <button
              onClick={() => pergi("laporan-saya")}
            >
              Laporan Saya
            </button>
          </nav>

          <div className="pa-profile">
            <button
              className="pa-profile-button"
              onClick={() => setMenuBuka(!menuBuka)}
              aria-expanded={menuBuka}
            >
              <span className="pa-avatar">
                <Icon name="person" />
              </span>

              <span className="pa-profile-name">
                {pengguna.nama || "Pengguna"}
              </span>

              <Icon name="expand_more" />
            </button>

            {menuBuka && (
              <div className="pa-profile-menu">
                <button
                  onClick={() => pergi("profil-saya")}
                >
                  <Icon name="account_circle" />
                  Profil Saya
                </button>

                <button onClick={keluar}>
                  <Icon name="logout" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===================================
          KONTEN UTAMA
      =================================== */}

      <main className="pa-main">
        <div className="pa-content">

          {/* ID LAPORAN */}

          <div className="pa-report-id">
            <Icon name="check_circle" />
            <span>
              ID Laporan: <strong>{idLaporan}</strong>
            </span>
          </div>

          {/* KARTU PROSES */}

          <section className="pa-card">

            {/* ICON PROSES */}

            <div className="pa-animation">
              <div
                className={`pa-icon-outer ${
                  selesai ? "pa-icon-finished" : ""
                }`}
              >
                {!selesai && (
                  <div className="pa-spin-ring" />
                )}

                <Icon
                  name={
                    selesai
                      ? "task_alt"
                      : "search_check"
                  }
                />
              </div>
            </div>

            {/* JUDUL */}

            <div className="pa-heading">
              <h1>
                {selesai
                  ? "Pencocokan Barang Selesai"
                  : "Sedang Mencari Kecocokan Barang"}
              </h1>

              <p>
                {selesai
                  ? hasilAda
                    ? `Ditemukan ${rekomendasi.length} rekomendasi barang dengan ciri yang serupa.`
                    : "Belum ditemukan laporan barang dengan ciri yang cukup mirip."
                  : "Laporanmu telah tersimpan. FindIt sedang melakukan simulasi pencocokan ciri dengan data barang yang tersedia."}
              </p>
            </div>

            {/* RINGKASAN LAPORAN */}

            <div className="pa-summary">
              <div className="pa-summary-header">
                <span>RINGKASAN LAPORAN</span>

                <span className="pa-category">
                  {laporan.kategori || "Lainnya"}
                </span>
              </div>

              <div className="pa-summary-body">
                <div className="pa-item-icon">
                  <Icon
                    name={ikonKategori(
                      laporan.kategori
                    )}
                  />
                </div>

                <div className="pa-item-info">
                  <h2>{laporan.nama}</h2>

                  <div className="pa-meta">
                    <span>
                      <Icon name="location_on" />
                      {laporan.lokasi}
                    </span>

                    <span>
                      <Icon name="calendar_today" />
                      {tanggalIndonesia(
                        laporan.waktu
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAHAP ANALISIS */}

            <div className="pa-steps">

              <Tahap
                nomor={1}
                judul="Laporan tersimpan"
                deskripsi="Data laporan telah tercatat di penyimpanan demo FindIt."
                selesai={true}
              />

              <Tahap
                nomor={2}
                judul="Menganalisis ciri-ciri barang"
                deskripsi="Memeriksa jenis, warna, merek, dan tanda khusus yang dicantumkan."
                selesai={true}
              />

              <Tahap
                nomor={3}
                judul="Mencocokkan dengan barang temuan"
                deskripsi={
                  selesai
                    ? hasilAda
                      ? `${rekomendasi.length} rekomendasi dengan skor kemiripan yang memenuhi batas ditemukan.`
                      : "Belum ada laporan pembanding yang memenuhi batas kemiripan."
                    : "Membandingkan laporan dengan barang yang tercatat dalam data demo FindIt."
                }
                selesai={selesai}
                aktif={!selesai}
                terakhir={true}
              />

            </div>

            {/* INFO PROSES */}

            <div className="pa-info-box">
              <Icon name="info" />

              <p>
                {selesai ? (
                  <>
                    Proses pencocokan lokal selesai.
                    Hasil dapat dilihat di halaman
                    rekomendasi atau menu{" "}
                    <strong>Laporan Saya</strong>.
                  </>
                ) : (
                  <>
                    Halaman ini menampilkan simulasi
                    proses analisis. Pencocokan yang
                    berjalan saat ini menggunakan
                    aturan sederhana di frontend,
                    belum terhubung ke AI backend.
                  </>
                )}
              </p>
            </div>

            {/* TOMBOL AKSI */}

            <div className="pa-actions">

              {selesai && hasilAda && (
                <button
                  className="pa-primary-button"
                  onClick={() =>
                    pergi(
                      `rekomendasi/${laporan.id}`
                    )
                  }
                >
                  <Icon name="auto_awesome" />
                  Lihat Rekomendasi ({rekomendasi.length})
                </button>
              )}

              <button
                className="pa-secondary-button"
                onClick={() => pergi("laporan-saya")}
              >
                <Icon name="folder_shared" />
                Lihat di Laporan Saya
              </button>

              <button
                className="pa-text-button"
                onClick={() => pergi("beranda")}
              >
                Kembali ke Beranda
              </button>

            </div>

          </section>

        </div>
      </main>

      {/* ===================================
          FOOTER
      =================================== */}

      <footer className="pa-footer">
        <div className="pa-footer-inner">
          <span>
            <span className="pa-footer-logo">
              <Icon name="search" />
            </span>
            © 2026 FindIt
          </span>

          <div>
            <button
              onClick={() => pergi("bantuan-klaim")}
            >
              Bantuan
            </button>

            <button
              onClick={() => pergi("privasi")}
            >
              Kebijakan Privasi
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
