import { useRef, useState } from "react";
import "./InputBarangTemuan.css";

const kategoriBarang = [
  "Elektronik",
  "Dompet & Kartu",
  "Aksesoris & Kunci",
  "Botol Minum / Tumbler",
  "Buku & Alat Tulis",
  "Lainnya",
];

const lokasiKampus = [
  "Perpustakaan Pusat UMY Lt. 2",
  "Gedung Siti Walidah Lt. 2",
  "Sportorium UMY",
  "Masjid KH Ahmad Dahlan",
  "Gedung AR Fachruddin A",
  "Kantin Bintang",
  "Koridor FT UMY",
  "Kantin Pusat",
  "Gedung Kuliah Bersama",
  "Gazebo Rektorat",
  "Parkir Gedung B",
  "Lainnya",
];

const lokasiPenyimpanan = [
  "Pos Keamanan Gerbang Utama",
  "Pos Satpam Gedung Siti Walidah",
  "Pos Keamanan Sportorium",
  "Ruang Pengelola Lost & Found Rektorat",
];

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

function tanggalHariIni() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function waktuSekarang() {
  const date = new Date();

  return [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join(":");
}

function formAwal() {
  return {
    kategori: "",
    nama: "",
    warna: "",
    merek: "",
    lokasi: "",
    tanggal: tanggalHariIni(),
    jam: waktuSekarang(),
    tempat: "Ruang Pengelola Lost & Found Rektorat",
    namaPenemu: "",
    ciri: "",
  };
}

function kompresFoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () =>
      reject(new Error("Foto gagal dibaca."));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () =>
        reject(new Error("Format foto tidak valid."));

      image.onload = () => {
        const canvas = document.createElement("canvas");

        const scale = Math.min(
          1,
          1000 / Math.max(image.width, image.height)
        );

        canvas.width = Math.max(
          1,
          Math.round(image.width * scale)
        );

        canvas.height = Math.max(
          1,
          Math.round(image.height * scale)
        );

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Foto gagal diproses."));
          return;
        }

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(
          canvas.toDataURL("image/jpeg", 0.78)
        );
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

function Field({ label, required, optional, children }) {
  return (
    <label className="ibt-field">
      <span className="ibt-label">
        <span>
          {label}

          {required && (
            <span className="ibt-required"> *</span>
          )}
        </span>

        {optional && (
          <small>Opsional</small>
        )}
      </span>

      {children}
    </label>
  );
}

export default function InputBarangTemuan({
  user = null,
  onSave,
  onDashboard = () => {},
  onDataBarang = () => {},
}) {
  const [form, setForm] = useState(formAwal);
  const [foto, setFoto] = useState("");
  const [namaFoto, setNamaFoto] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hasil, setHasil] = useState(null);

  const fileRef = useRef(null);
  const successRef = useRef(null);

  function ubah(event) {
    const { name, value } = event.target;

    setForm((before) => ({
      ...before,
      [name]: value,
    }));

    setError("");
  }

  async function pilihFoto(file) {
    if (!file || loading || processing) return;

    setError("");

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {
      setError("Gunakan foto JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setProcessing(true);

    try {
      const gambar = await kompresFoto(file);

      setFoto(gambar);
      setNamaFoto(file.name);
    } catch (err) {
      setError(err.message || "Foto gagal diproses.");
    } finally {
      setProcessing(false);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  function hapusFoto() {
    setFoto("");
    setNamaFoto("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function resetForm() {
    setForm(formAwal());
    setHasil(null);
    setError("");
    hapusFoto();
  }

  async function simpan(event) {
    event.preventDefault();

    if (loading || processing || hasil) return;

    setError("");

    if (user?.role !== "admin") {
      setError("Hanya admin yang dapat menyimpan barang.");
      return;
    }

    if (
      !form.kategori ||
      !form.nama.trim() ||
      !form.warna.trim() ||
      !form.lokasi ||
      !form.tanggal ||
      !form.jam ||
      !form.tempat
    ) {
      setError("Lengkapi seluruh kolom wajib.");
      return;
    }

    if (!foto) {
      setError("Foto barang wajib diunggah.");
      return;
    }

    const waktu = `${form.tanggal}T${form.jam}`;

    if (
      Number.isNaN(new Date(waktu).getTime()) ||
      new Date(waktu) > new Date()
    ) {
      setError(
        "Tanggal dan waktu ditemukan tidak boleh melebihi waktu sekarang."
      );
      return;
    }

    if (typeof onSave !== "function") {
      setError("Fungsi penyimpanan belum terhubung.");
      return;
    }

    const id = crypto.randomUUID();

    const nomorBarang =
      `FD-${new Date().getFullYear()}-` +
      id.slice(0, 8).toUpperCase();

    const data = {
      id,
      kodeBarang: nomorBarang,
      tipe: "DITEMUKAN",

      nama: form.nama.trim(),
      kategori: form.kategori,
      warna: form.warna.trim(),
      merek: form.merek.trim(),

      lokasi: form.lokasi,
      tempat: form.tempat,
      lokasiPenyimpanan: form.tempat,

      tanggalDitemukan: form.tanggal,
      jamDitemukan: form.jam,
      waktu,

      namaPenemu: form.namaPenemu.trim(),

      ciri: "",
      ciriKhususRahasia: form.ciri.trim(),

      gambar: foto,

      pelapor: user.email,
      namaPelapor: user.nama || "Admin FindIt",

      status: "Ditemukan",
      statusVerifikasi: "Terverifikasi",

      tanggalLaporan: new Date().toISOString(),
    };

    setLoading(true);

    try {
      const saved = await onSave(data);

      if (saved === false) {
        throw new Error("Barang gagal disimpan.");
      }

      setHasil({
        ...data,
        ...(typeof saved === "object" && saved
          ? saved
          : {}),
      });

      requestAnimationFrame(() => {
        successRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    } catch (err) {
      setError(err.message || "Barang gagal disimpan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ibt-page">
      {/* HEADER */}

      <header className="ibt-header">
        <nav className="ibt-breadcrumb">
          <button
            type="button"
            onClick={onDashboard}
          >
            <Icon name="grid_view" />
            Dashboard
          </button>

          <Icon name="chevron_right" />

          <span>Input Barang Temuan</span>
        </nav>

        <h1>Input Barang Temuan</h1>

        <p>
          Catat barang yang ditemukan agar bisa
          dicocokkan dengan laporan kehilangan.
        </p>
      </header>

      {/* FORM */}

      <form
        className="ibt-card"
        onSubmit={simpan}
      >
        <fieldset disabled={loading || processing || !!hasil}>

          <div className="ibt-grid">

            <Field label="Jenis Barang" required>
              <select
                name="kategori"
                value={form.kategori}
                onChange={ubah}
                required
              >
                <option value="" disabled>
                  Pilih kategori barang
                </option>

                {kategoriBarang.map((kategori) => (
                  <option
                    key={kategori}
                    value={kategori}
                  >
                    {kategori}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nama Barang" required>
              <input
                name="nama"
                value={form.nama}
                onChange={ubah}
                placeholder="cth. Tumbler Hydro Flask 32oz Biru"
                maxLength={150}
                required
              />
            </Field>

            <Field label="Warna Dominan" required>
              <input
                name="warna"
                value={form.warna}
                onChange={ubah}
                placeholder="cth. Biru Navy, Hitam, Perak, Merah"
                maxLength={80}
                required
              />
            </Field>

            <Field label="Merek / Jenama">
              <input
                name="merek"
                value={form.merek}
                onChange={ubah}
                placeholder="cth. Hydro Flask, Eiger, Sony, Casio"
                maxLength={100}
              />
            </Field>

            <Field label="Lokasi Ditemukan" required>
              <select
                name="lokasi"
                value={form.lokasi}
                onChange={ubah}
                required
              >
                <option value="" disabled>
                  Pilih area kampus UMY
                </option>

                {lokasiKampus.map((lokasi) => (
                  <option key={lokasi} value={lokasi}>
                    {lokasi}
                  </option>
                ))}
              </select>
            </Field>

            <div className="ibt-date-grid">
              <Field
                label="Tanggal Ditemukan"
                required
              >
                <input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={ubah}
                  max={tanggalHariIni()}
                  required
                />
              </Field>

              <Field label="Waktu" required>
                <input
                  type="time"
                  name="jam"
                  value={form.jam}
                  onChange={ubah}
                  required
                />
              </Field>
            </div>

            <Field label="Lokasi Penyimpanan" required>
              <select
                name="tempat"
                value={form.tempat}
                onChange={ubah}
                required
              >
                <option value="">
                  Pilih pos penyimpanan barang
                </option>

                {lokasiPenyimpanan.map((tempat) => (
                  <option key={tempat} value={tempat}>
                    {tempat}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Nama Penemu"
              optional
            >
              <input
                name="namaPenemu"
                value={form.namaPenemu}
                onChange={ubah}
                maxLength={100}
                placeholder="cth. Dimas (Mahasiswa) / Petugas Cleaning Service"
              />
            </Field>
          </div>

          {/* CIRI KHUSUS */}

          <div className="ibt-section">
            <Field label="Ciri Khusus & Tanda Unik">
              <textarea
                name="ciri"
                value={form.ciri}
                onChange={ubah}
                rows={4}
                maxLength={1500}
                placeholder="Misal: ada stiker logo fakultas di bagian bawah botol, goresan tipis di dekat tutup, nomor seri tertentu..."
              />
            </Field>

            <div className="ibt-privacy">
              <Icon name="lock" />

              <span>
                Khusus verifikasi petugas, bukan untuk
                ditampilkan pada katalog publik.
              </span>
            </div>
          </div>

          {/* UPLOAD FOTO */}

          <div className="ibt-section">
            <div className="ibt-label">
              <span>
                Upload Foto Barang
                <span className="ibt-required"> *</span>
              </span>
            </div>

            <div
              className={`ibt-upload ${
                dragging ? "ibt-dragging" : ""
              }`}
              onDragOver={(event) => {
                event.preventDefault();

                if (!hasil && !loading && !processing) {
                  setDragging(true);
                }
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();

                setDragging(false);

                if (!hasil && !loading && !processing) {
                  pilihFoto(
                    event.dataTransfer.files[0]
                  );
                }
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                id="ibt-photo"
                onChange={(event) =>
                  pilihFoto(event.target.files[0])
                }
                hidden
              />

              {foto ? (
                <div className="ibt-preview">
                  <img
                    src={foto}
                    alt="Preview barang temuan"
                  />

                  <strong>{namaFoto}</strong>

                  <div className="ibt-photo-actions">
                    <button
                      type="button"
                      onClick={() =>
                        fileRef.current?.click()
                      }
                    >
                      Ganti Foto
                    </button>

                    <button
                      type="button"
                      className="ibt-remove"
                      onClick={hapusFoto}
                    >
                      Hapus Foto
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="ibt-upload-trigger"
                  onClick={() =>
                    fileRef.current?.click()
                  }
                >
                  <span className="ibt-camera">
                    <Icon name="add_a_photo" />
                  </span>

                  <strong>
                    {processing
                      ? "Memproses foto..."
                      : "Klik atau seret foto barang ke sini"}
                  </strong>

                  <small>
                    Format JPG, PNG, atau WEBP
                    (Maks. 5MB)
                  </small>
                </button>
              )}
            </div>

            <div className="ibt-note">
              <Icon name="info" />

              <span>
                Catatan penting: Foto tidak boleh
                memperlihatkan nomor identitas lengkap,
                kartu ATM, atau dokumen pribadi sensitif.
              </span>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="ibt-error"
              role="alert"
            >
              <Icon name="error" />
              {error}
            </div>
          )}

          {/* TOMBOL */}

          <div className="ibt-actions">
            <button
              type="button"
              className="ibt-cancel"
              onClick={() => {
                if (
                  window.confirm(
                    "Batalkan pengisian barang temuan?"
                  )
                ) {
                  resetForm();
                  onDashboard();
                }
              }}
            >
              Batal
            </button>

            <button
              type="submit"
              className="ibt-save"
              disabled={
                loading || processing || !!hasil
              }
            >
              <Icon name="save" />

              {loading
                ? "Menyimpan..."
                : hasil
                ? "Barang Tersimpan"
                : "Simpan Barang Temuan"}
            </button>
          </div>
        </fieldset>
      </form>

      {/* NOTIFIKASI BERHASIL */}

      {hasil && (
        <section
          className="ibt-success"
          ref={successRef}
          role="status"
        >
          <div className="ibt-success-content">
            <div className="ibt-success-icon">
              <Icon name="check_circle" />
            </div>

            <div>
              <h2>Barang temuan tersimpan</h2>

              <span className="ibt-id">
                #{hasil.kodeBarang}
              </span>

              <p>
                Barang telah ditambahkan ke Data Barang
                dan dapat digunakan untuk pencocokan
                laporan kehilangan.
              </p>
            </div>
          </div>

          <div className="ibt-success-actions">
            <button
              type="button"
              onClick={() => {
                resetForm();
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              Input Barang Lain
            </button>

            <button
              type="button"
              className="ibt-go-data"
              onClick={onDataBarang}
            >
              Ke Data Barang
              <Icon name="arrow_forward" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}