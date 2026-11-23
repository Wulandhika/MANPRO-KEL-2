
import { useEffect, useState } from "react";
import "./LaporHilang.css";

// ==========================================
// PILIHAN KATEGORI BARANG
// ==========================================

const KATEGORI = [
  ["Botol Minum", "Botol Minum / Tumbler"],
  ["Elektronik", "Elektronik & Gadget (Laptop, Tablet, Earbuds)"],
  ["Dompet", "Dompet & Uang"],
  ["Kunci", "Kunci Kendaraan / Kunci Kos"],
  ["Dokumen", "Identitas (KTM, KTP, SIM)"],
  ["Pakaian", "Pakaian, Jaket & Sepatu"],
  ["Tas", "Tas & Ransel"],
  ["Aksesori", "Aksesori & Perhiasan"],
  ["Lainnya", "Buku, Alat Tulis & Lainnya"],
];

// ==========================================
// PILIHAN LOKASI KAMPUS UMY
// ==========================================

const LOKASI = [
  "Perpustakaan UMY Lt. 2",
  "Perpustakaan UMY Lt. 1 / Ruang Baca",
  "Kantin Gedung AR Fachruddin A / Plaza Bintang",
  "Kantin Selasar Barat",
  "Gedung KH Ibrahim (Ruang Kuliah E6/E7)",
  "Gedung Siti Walidah",
  "Masjid Ahmad Dahlan UMY",
  "Sportorium UMY",
  "Plaza Bintang UMY",
  "Area Parkir Sepeda Motor Gerbang Utama",
  "Area Parkir Fasilkom / FT",
  "Lainnya di Lingkungan Kampus UMY",
];

// ==========================================
// RENTANG WAKTU KEHILANGAN
// ==========================================

const RENTANG = [
  {
    value: "pagi",
    label: "Pagi (08:00 - 11:30)",
    mulai: "08:00",
  },
  {
    value: "siang",
    label: "Siang (11:30 - 14:00)",
    mulai: "11:30",
  },
  {
    value: "sore",
    label: "Sore (14:00 - 17:30)",
    mulai: "14:00",
  },
  {
    value: "malam",
    label: "Malam (17:30 - 21:00)",
    mulai: "17:30",
  },
];

// ==========================================
// KOMPONEN ICON
// ==========================================

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

// ==========================================
// FORMAT TANGGAL LOKAL
// ==========================================

function tanggalLokal(date = new Date()) {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
}

// ==========================================
// VALIDASI DAN KOMPRESI FOTO
// ==========================================

function olahFoto(file) {
  if (!file) {
    return Promise.resolve("");
  }

  const formatDiizinkan = [
    "image/jpeg",
    "image/png",
  ];

  if (!formatDiizinkan.includes(file.type)) {
    return Promise.reject(
      new Error("Foto harus berformat JPG atau PNG.")
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return Promise.reject(
      new Error("Ukuran foto maksimal 5 MB.")
    );
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onerror = () => {
      URL.revokeObjectURL(url);

      reject(
        new Error("Foto tidak dapat dibaca.")
      );
    };

    image.onload = () => {
      try {
        const skala = Math.min(
          1,
          900 / Math.max(image.width, image.height)
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(
          1,
          Math.round(image.width * skala)
        );

        canvas.height = Math.max(
          1,
          Math.round(image.height * skala)
        );

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Browser tidak dapat memproses foto."
          );
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(
          canvas.toDataURL("image/jpeg", 0.7)
        );
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    image.src = url;
  });
}

// ==========================================
// HALAMAN LAPOR BARANG HILANG
// ==========================================

export default function LaporHilang({
  user = null,
  onNavigate = () => {},
  onLogout = () => {},
  onSave = () => {},
}) {
  const [form, setForm] = useState({
    kategori: "",
    nama: "",
    warna: "",
    merek: "",
    lokasi: "",
    tanggal: "",
    rentang: "",
    ciri: "",
  });

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [menuBuka, setMenuBuka] = useState(false);

  // Hapus URL preview ketika sudah tidak digunakan
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function ubah(key, value) {
    setForm((sebelumnya) => ({
      ...sebelumnya,
      [key]: value,
    }));

    if (error) setError("");
  }

  // ========================================
  // UPLOAD FOTO
  // ========================================

  function pilihFoto(file) {
    if (!file) return;

    if (
      ![
        "image/jpeg",
        "image/png",
      ].includes(file.type)
    ) {
      setError("Pilih foto JPG atau PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setFoto(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  // ========================================
  // SUBMIT LAPORAN
  // ========================================

  async function kirim(e) {
    e.preventDefault();

    if (!user) {
      onNavigate("masuk");
      return;
    }

    const nama = form.nama.trim();

    if (
      !nama ||
      !form.kategori ||
      !form.lokasi ||
      !form.tanggal ||
      !form.rentang
    ) {
      setError(
        "Lengkapi semua kolom yang bertanda bintang (*)."
      );
      return;
    }

    if (form.tanggal > tanggalLokal()) {
      setError(
        "Tanggal kehilangan tidak boleh di masa depan."
      );
      return;
    }

    const slot = RENTANG.find(
      (item) => item.value === form.rentang
    );

    if (!slot) {
      setError("Pilih perkiraan rentang waktu.");
      return;
    }

    setMenyimpan(true);
    setError("");

    try {
      const gambar = await olahFoto(foto);

      const laporan = {
        id: crypto.randomUUID(),
        tipe: "HILANG",
        nama: nama,
        kategori: form.kategori,
        warna: form.warna.trim(),
        merek: form.merek.trim(),
        lokasi: form.lokasi,

        // Tanggal dan waktu bersifat perkiraan
        tanggalKehilangan: form.tanggal,
        rentangWaktu: slot.label,
        waktu: `${form.tanggal}T${slot.mulai}`,
        waktuPerkiraan: true,

        ciri: form.ciri.trim(),
        gambar: gambar,
        tempat: "",
        pelapor: user.email,
        status: "Hilang",
      };

      // Simpan ke state laporan di App.jsx
      // Kemudian buka halaman rekomendasi
      await onSave(laporan);
    } catch (err) {
      setError(
        err?.message ||
        "Laporan gagal disimpan. Coba lagi."
      );
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div className="lh-page">

      {/* ===================================
          NAVBAR
      =================================== */}

      <header className="lh-header">
        <div className="lh-nav">

          <button
            className="lh-brand"
            onClick={() => onNavigate("beranda")}
          >
            <span className="lh-brand-icon">
              <Icon name="search" />
            </span>

            <span>
              <strong>FindIt</strong>
              <small>SISTEM KAMPUS</small>
            </span>
          </button>

          <nav
            className="lh-links"
            aria-label="Navigasi utama"
          >
            <button
              onClick={() => onNavigate("beranda")}
            >
              Beranda
            </button>

            <button
              onClick={() => onNavigate("cari")}
            >
              Cari Barang
            </button>

            <button
              className="lh-active"
              aria-current="page"
              type="button"
            >
              Lapor Hilang
            </button>

            <button
              onClick={() => onNavigate("laporan-saya")}
            >
              Laporan Saya
            </button>
          </nav>

          {user ? (
            <div className="lh-profile">

              <button
                className="lh-profile-button"
                onClick={() => setMenuBuka(!menuBuka)}
                aria-expanded={menuBuka}
              >
                <span className="lh-avatar">
                  <Icon name="person" />
                </span>

                <span>
                  {user.nama || "Pengguna"}
                </span>

                <Icon name="expand_more" />
              </button>

              {menuBuka && (
                <div className="lh-dropdown">
                  <button
                    onClick={() =>
                      onNavigate("profil-saya")
                    }
                  >
                    <Icon name="person" />
                    Profil Saya
                  </button>

                  <button onClick={onLogout}>
                    <Icon name="logout" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="lh-login"
              onClick={() => onNavigate("masuk")}
            >
              Masuk
            </button>
          )}
        </div>
      </header>

      {/* ===================================
          KONTEN UTAMA
      =================================== */}

      <main className="lh-main">

        {/* BREADCRUMB */}

        <div className="lh-breadcrumb">
          <button
            onClick={() => onNavigate("beranda")}
          >
            <Icon name="home" />
            Beranda
          </button>

          <Icon name="chevron_right" />

          <span>Pelaporan Barang Hilang</span>
        </div>

        <div className="lh-layout">

          {/* =============================
              FORM LAPORAN
          ============================= */}

          <section className="lh-form-card">
            <h1>Lapor Barang Hilang</h1>

            <p className="lh-intro">
              Tulis ciri-ciri barangmu sedetail mungkin.
              Sistem akan mencarikan barang temuan yang
              mirip di lingkungan kampus.
            </p>

            {!user && (
              <div className="lh-notice lh-login-notice">
                <Icon name="info" />

                Kamu perlu login sebelum mengirim laporan.

                <button
                  type="button"
                  onClick={() => onNavigate("masuk")}
                >
                  Masuk
                </button>
              </div>
            )}

            <form
              className="lh-form"
              onSubmit={kirim}
            >

              {/* JENIS BARANG */}

              <label className="lh-field">
                <span>
                  Jenis Barang <b>*</b>
                </span>

                <select
                  value={form.kategori}
                  onChange={(e) =>
                    ubah("kategori", e.target.value)
                  }
                  required
                >
                  <option value="">
                    Pilih kategori jenis barang...
                  </option>

                  {KATEGORI.map(([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {/* NAMA BARANG */}

              <label className="lh-field">
                <span>
                  Nama Barang <b>*</b>
                </span>

                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) =>
                    ubah("nama", e.target.value)
                  }
                  maxLength={120}
                  required
                  placeholder="Contoh: Tumbler Hydro Flask 32oz Biru Navy"
                />
              </label>

              {/* WARNA DAN MEREK */}

              <div className="lh-two-cols">

                <label className="lh-field">
                  <span>Warna Dominan</span>

                  <input
                    type="text"
                    value={form.warna}
                    onChange={(e) =>
                      ubah("warna", e.target.value)
                    }
                    placeholder="Contoh: Biru dongker, hitam doff"
                  />
                </label>

                <label className="lh-field">
                  <span>Merek / Jenama</span>

                  <input
                    type="text"
                    value={form.merek}
                    onChange={(e) =>
                      ubah("merek", e.target.value)
                    }
                    placeholder="Contoh: Hydro Flask, Eiger, Uniqlo"
                  />
                </label>
              </div>

              {/* LOKASI KEHILANGAN */}

              <label className="lh-field">
                <span className="lh-label-row">
                  <span>
                    Lokasi Terakhir Terlihat <b>*</b>
                  </span>

                  <small>
                    <Icon name="pin_drop" />
                    Wilayah Kampus UMY
                  </small>
                </span>

                <select
                  value={form.lokasi}
                  onChange={(e) =>
                    ubah("lokasi", e.target.value)
                  }
                  required
                >
                  <option value="">
                    Pilih lokasi terakhir...
                  </option>

                  {LOKASI.map((lokasi) => (
                    <option
                      key={lokasi}
                      value={lokasi}
                    >
                      {lokasi}
                    </option>
                  ))}
                </select>
              </label>

              {/* TANGGAL DAN RENTANG WAKTU */}

              <div className="lh-two-cols">

                <label className="lh-field">
                  <span>
                    Tanggal Kehilangan <b>*</b>
                  </span>

                  <input
                    type="date"
                    max={tanggalLokal()}
                    value={form.tanggal}
                    onChange={(e) =>
                      ubah("tanggal", e.target.value)
                    }
                    required
                  />
                </label>

                <label className="lh-field">
                  <span>
                    Perkiraan Rentang Waktu <b>*</b>
                  </span>

                  <select
                    value={form.rentang}
                    onChange={(e) =>
                      ubah("rentang", e.target.value)
                    }
                    required
                  >
                    <option value="">
                      Pilih rentang jam...
                    </option>

                    {RENTANG.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* CIRI KHUSUS */}

              <label className="lh-field">
                <span className="lh-label-row">
                  <span>
                    Ciri Khusus &amp; Tanda Unik
                  </span>

                  <small>
                    Sangat Direkomendasikan
                  </small>
                </span>

                <small className="lh-hint">
                  Contoh: stiker kucing di bagian belakang,
                  ada retakan di pojok kiri,
                  gantungan tali merah.
                </small>

                <textarea
                  rows={4}
                  value={form.ciri}
                  onChange={(e) =>
                    ubah("ciri", e.target.value)
                  }
                  placeholder="Jelaskan goresan, stiker, gantungan, nomor seri, atau ciri yang hanya diketahui pemilik..."
                />
              </label>

              {/* UPLOAD FOTO */}

              <div className="lh-field">
                <span className="lh-label-row">
                  <span>Upload Foto Pendukung</span>
                  <small>Opsional</small>
                </span>

                <label className="lh-dropzone">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) =>
                      pilihFoto(e.target.files?.[0])
                    }
                  />

                  {preview ? (
                    <img
                      className="lh-preview"
                      src={preview}
                      alt="Pratinjau foto barang"
                    />
                  ) : (
                    <span className="lh-upload-icon">
                      <Icon name="cloud_upload" />
                    </span>
                  )}

                  <strong>
                    {foto
                      ? foto.name
                      : "Unggah foto barang (jika ada)"}
                  </strong>

                  <small>
                    Format JPG atau PNG, maksimal 5 MB.
                    Foto lama dapat membantu proses
                    pencocokan.
                  </small>

                  {foto && (
                    <span className="lh-file-loaded">
                      <Icon name="check_circle" />
                      Foto dipilih
                    </span>
                  )}
                </label>

                {foto && (
                  <button
                    type="button"
                    className="lh-remove-photo"
                    onClick={() => {
                      setFoto(null);
                      setPreview("");
                    }}
                  >
                    Hapus foto pilihan
                  </button>
                )}
              </div>

              {/* INFORMASI PELAPORAN */}

              <div className="lh-notice">
                <Icon name="verified_user" />

                <span>
                  Laporanmu akan dicocokkan dengan
                  barang temuan yang tercatat
                  di pos penampungan kampus.
                </span>
              </div>

              {/* VALIDASI ERROR */}

              {error && (
                <p
                  className="lh-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {/* TOMBOL KIRIM */}

              <button
                className="lh-submit"
                type="submit"
                disabled={menyimpan}
              >
                {menyimpan
                  ? "Menyimpan laporan..."
                  : "Kirim & Cari Kecocokan"}

                <Icon name="manage_search" />
              </button>

              {/* TOMBOL BATAL */}

              <button
                className="lh-cancel"
                type="button"
                onClick={() => onNavigate("beranda")}
              >
                <Icon name="arrow_back" />
                Batal dan kembali ke Beranda
              </button>

            </form>
          </section>

          {/* =============================
              SIDEBAR TIPS
          ============================= */}

          <aside className="lh-tips">

            <div className="lh-tips-header">
              <span>
                <Icon name="lightbulb" />
              </span>

              <h2>
                Tips agar hasil lebih akurat
              </h2>
            </div>

            <div className="lh-tip">
              <b>1</b>

              <div>
                <h3>
                  Sebutkan detail fisik yang spesifik
                </h3>

                <p>
                  Cantumkan stiker, warna gantungan,
                  goresan, atau aksesori yang melekat
                  pada barang.
                </p>
              </div>
            </div>

            <div className="lh-tip">
              <b>2</b>

              <div>
                <h3>
                  Tentukan perkiraan waktu &amp;
                  titik lokasi
                </h3>

                <p>
                  Semakin spesifik gedung atau ruangan,
                  semakin mudah petugas menelusuri
                  laporan terkait.
                </p>
              </div>
            </div>

            <div className="lh-tip">
              <b>3</b>

              <div>
                <h3>Unggah foto pendukung</h3>

                <p>
                  Foto lama saat kamu menggunakan
                  barang atau foto serupa dapat
                  membantu verifikasi visual.
                </p>
              </div>
            </div>

            <div className="lh-privacy">
              <Icon name="lock" />

              <p>
                Versi demo menyimpan laporan
                di browser. Jangan gunakan
                informasi pribadi atau foto identitas
                asli untuk pengujian.
              </p>
            </div>
          </aside>

        </div>
      </main>

      {/* ===================================
          FOOTER
      =================================== */}

      <footer className="lh-footer">
        <span>
          <span className="lh-footer-logo">
            <Icon name="search" />
          </span>

          © 2026 FindIt
        </span>

        <div>
          <button
            onClick={() =>
              onNavigate("bantuan-klaim")
            }
          >
            Bantuan
          </button>

          <button
            onClick={() => onNavigate("privasi")}
          >
            Kebijakan Privasi
          </button>
        </div>
      </footer>

    </div>
  );
}
