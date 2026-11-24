import AdminDashboard from "./AdminDashboard.jsx";

import { useEffect, useState } from "react";

import AuthPage from "./components/AuthPage.jsx";
import UserHome from "./UserHome.jsx";
import CariBarang from "./CariBarang.jsx";
import LaporHilang from "./LaporHilang.jsx";
import ProsesAnalisis from "./ProsesAnalisis.jsx";

// ========================================
// DATA CONTOH FINDIT
// ========================================

const FOTO = {
  tumbler:
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
  kunci:
    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=80",
  ipad:
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
  dompet:
    "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80",
  earbuds:
    "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
  hoodie:
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
};

const DATA_AWAL = [
  {
    id: "demo-1",
    tipe: "DITEMUKAN",
    nama: "Tumbler Hydro Flask 32oz Biru Dongker",
    kategori: "Botol Minum",
    merek: "Hydro Flask",
    warna: "Biru Dongker",
    lokasi: "Perpustakaan Pusat Lt. 2",
    waktu: "2026-11-23T11:20",
    ciri: "Tumbler biru dongker dengan tutup hitam",
    tempat: "Pos Satpam Utama",
    gambar: FOTO.tumbler,
    pelapor: "demo-sistem",
    status: "Ditemukan",
  },
  {
    id: "demo-2",
    tipe: "DITEMUKAN",
    nama: "Kunci Motor Honda Vario Gantungan Cokelat",
    kategori: "Kunci",
    merek: "Honda",
    warna: "Hitam",
    lokasi: "Parkir Gedung Fasilkom",
    waktu: "2026-11-23T09:15",
    ciri: "Kunci Honda Vario dengan gantungan kulit cokelat",
    tempat: "Pos Keamanan Fasilkom",
    gambar: FOTO.kunci,
    pelapor: "demo-sistem",
    status: "Ditemukan",
  },
  {
    id: "demo-3",
    tipe: "DITEMUKAN",
    nama: "iPad Air 5 Space Grey + Apple Pencil",
    kategori: "Elektronik",
    merek: "Apple",
    warna: "Abu-abu",
    lokasi: "Gedung Kuliah Bersama R.304",
    waktu: "2026-11-23T08:00",
    ciri: "iPad abu-abu dengan pensil putih",
    tempat: "Sekretariat GKB Lt. 1",
    gambar: FOTO.ipad,
    pelapor: "demo-sistem",
    status: "Ditemukan",
  },
  {
    id: "demo-4",
    tipe: "DITEMUKAN",
    nama: "Dompet Kulit Hitam Ada KTM",
    kategori: "Aksesori",
    merek: "",
    warna: "Hitam",
    lokasi: "Kantin Pusat Halal",
    waktu: "2026-11-22T17:30",
    ciri: "Dompet kulit hitam dengan beberapa kartu",
    tempat: "Pos Pengelola Kantin",
    gambar: FOTO.dompet,
    pelapor: "demo-sistem",
    status: "Ditemukan",
  },
  {
    id: "demo-5",
    tipe: "DITEMUKAN",
    nama: "Earbuds Sony WF-1000XM4 Hitam",
    kategori: "Elektronik",
    merek: "Sony",
    warna: "Hitam",
    lokasi: "Gazebo Rektorat",
    waktu: "2026-11-22T14:10",
    ciri: "Earbuds Sony hitam dengan kotak pengisian",
    tempat: "Pos Pamdal Rektorat",
    gambar: FOTO.earbuds,
    pelapor: "demo-sistem",
    status: "Ditemukan",
  },
  {
    id: "demo-6",
    tipe: "DITEMUKAN",
    nama: "Jaket Hoodie Uniqlo Abu-abu Ukuran L",
    kategori: "Pakaian",
    merek: "Uniqlo",
    warna: "Abu-abu",
    lokasi: "Lapangan Basket Utama",
    waktu: "2026-11-22T12:45",
    ciri: "Hoodie abu-abu ukuran L dengan resleting depan",
    tempat: "Pos UKM Olahraga",
    gambar: FOTO.hoodie,
    pelapor: "demo-sistem",
    status: "Ditemukan",
  },
];

const KATEGORI = [
  "Elektronik",
  "Botol Minum",
  "Dompet",
  "Kunci",
  "Aksesori",
  "Pakaian",
  "Dokumen",
  "Tas",
  "Lainnya",
];

// ========================================
// FUNGSI BANTU
// ========================================

const bersih = (teks) =>
  String(teks ?? "").trim().toLowerCase();

function formatWaktu(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function baca(key, fallback, store) {
  try {
    return JSON.parse(store.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

// ========================================
// SIMULASI PENCOCOKAN BARANG
// ========================================

function skorKemiripan(a, b) {
  let skor = 0;

  if (bersih(a.kategori) === bersih(b.kategori)) {
    skor += 35;
  }

  if (
    a.merek &&
    b.merek &&
    bersih(a.merek) === bersih(b.merek)
  ) {
    skor += 20;
  }

  if (
    a.warna &&
    b.warna &&
    bersih(a.warna) === bersih(b.warna)
  ) {
    skor += 20;
  }

  if (bersih(a.lokasi) === bersih(b.lokasi)) {
    skor += 5;
  }

  const kata = (text) =>
    new Set(
      bersih(text)
        .split(/[^\p{L}\p{N}]+/u)
        .filter((x) => x.length > 2)
    );

  const aKata = kata(`${a.nama} ${a.ciri}`);
  const bKata = kata(`${b.nama} ${b.ciri}`);

  const jumlahSama = [...aKata].filter((x) =>
    bKata.has(x)
  ).length;

  return Math.min(
    100,
    skor + Math.min(20, jumlahSama * 4)
  );
}

// ========================================
// ICON DAN JUDUL
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

function Judul({ label, title, description }) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

// ========================================
// KARTU BARANG
// ========================================

function BarangCard({ item, pergi }) {
  return (
    <article className="item-card">
      <div className="item-photo">
        <img
          src={item.gambar || FOTO.dompet}
          alt={item.nama}
          loading="lazy"
        />

        <span
          className={`status ${
            item.status === "Dalam Verifikasi"
              ? "warning"
              : ""
          }`}
        >
          {item.status}
        </span>
      </div>

      <div className="item-info">
        <h3 title={item.nama}>{item.nama}</h3>

        <p>
          <Icon name="location_on" />
          {item.lokasi}
        </p>

        <p>
          <Icon name="schedule" />
          {formatWaktu(item.waktu)} WIB
        </p>

        <div className="item-bottom">
          <small>
            {item.tempat || "Lokasi belum ditentukan"}
          </small>

          <button
            className="btn btn-soft btn-small"
            onClick={() => pergi(`detail/${item.id}`)}
          >
            Detail Barang
          </button>
        </div>
      </div>
    </article>
  );
}

// ========================================
// BERANDA AWAL
// ========================================

function Beranda({ barang, pergi, cari }) {
  const [teks, setTeks] = useState("");
  const [fotoAda, setFotoAda] = useState(true);

  const terbaru = barang
    .filter(
      (b) =>
        b.tipe === "DITEMUKAN" &&
        b.status !== "Dikembalikan"
    )
    .slice(0, 6);

  const langkah = [
    [
      "post_add",
      "Lapor",
      "Isi ciri, foto, waktu dan lokasi barang yang hilang atau ditemukan.",
    ],
    [
      "psychology",
      "Analisis Ciri",
      "Sistem membandingkan jenis, warna, merek dan deskripsi.",
    ],
    [
      "radar",
      "Lihat Rekomendasi",
      "Lihat barang yang memiliki ciri paling mirip.",
    ],
    [
      "domain_verification",
      "Konfirmasi & Ambil",
      "Ajukan klaim dan tunggu verifikasi petugas.",
    ],
  ];

  return (
    <>
      <section className="hero">
        {fotoAda && (
          <img
            className="hero-photo"
            src="/umy.jpg"
            alt="Kampus UMY"
            onError={() => setFotoAda(false)}
          />
        )}

        <div className="hero-overlay" />

        {!fotoAda && (
          <p className="hero-error">
            Foto UMY tidak ditemukan.
            Periksa frontend/public/umy.jpg.
          </p>
        )}

        <div className="container hero-inner">
          <h1>
            Barang hilang? Temukan lebih cepat di{" "}
            <span>FindIt</span>
          </h1>

          <p>
            Satu tempat terpusat untuk melapor
            dan mencari barang hilang di kampus,
            dibantu rekomendasi pencocokan
            berdasarkan ciri-ciri barang.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => pergi("lapor-hilang")}
            >
              <Icon name="search" />
              Saya Kehilangan Barang
            </button>

            <button
              className="btn btn-glass"
              onClick={() => pergi("lapor-ditemukan")}
            >
              <Icon name="volunteer_activism" />
              Saya Menemukan Barang
            </button>
          </div>

          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              cari(teks);
            }}
          >
            <Icon name="manage_search" />

            <input
              aria-label="Cari barang"
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
              placeholder="Cari berdasarkan ciri: jenis, warna, merek..."
            />

            <button
              className="btn btn-primary"
              type="submit"
            >
              <Icon name="auto_awesome" />
              Cari Barang
            </button>
          </form>

          <div className="popular">
            <strong>PENCARIAN POPULER:</strong>

            {[
              "Laptop Lenovo hitam",
              "KTM",
              "Kunci Motor Honda",
              "Botol Biru",
              "Hoodie Abu-abu",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => cari(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-white">
        <div className="container">
          <div className="section-heading center">
            <h2>Cara Kerja</h2>
            <p>
              Empat langkah sederhana untuk membantu
              barang kembali kepada pemiliknya.
            </p>
          </div>

          <div className="step-grid">
            {langkah.map(([ikon, judul, deskripsi], i) => (
              <article className="step" key={judul}>
                <span className="step-icon">
                  <Icon name={ikon} />
                </span>

                <small>LANGKAH 0{i + 1}</small>
                <h3>
                  {i + 1}. {judul}
                </h3>
                <p>{deskripsi}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pale">
        <div className="container">
          <div className="section-heading row-heading">
            <div>
              <span className="eyebrow green">
                â— PEMBARUAN BARANG
              </span>

              <h2>Barang Terbaru Ditemukan</h2>

              <p>
                Barang yang baru dilaporkan ditemukan
                di lingkungan kampus.
              </p>
            </div>

            <button
              className="link-button"
              onClick={() => cari("")}
            >
              Lihat Semua Temuan â†’
            </button>
          </div>

          <div className="card-grid">
            {terbaru.map((b) => (
              <BarangCard
                key={b.id}
                item={b}
                pergi={pergi}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-white">
        <div className="container">
          <div className="feature-box">
            <span className="feature-label">
              <Icon name="verified_user" />
              Keamanan & Pencocokan Barang
            </span>

            <h2>
              Pencocokan Barang Berdasarkan Ciri dan Teks
            </h2>

            <p>
              FindIt membandingkan laporan hilang dan
              ditemukan. Skor kecocokan saat ini masih
              simulasi frontend, bukan AI/NLP sungguhan.
              Klaim tetap diperiksa admin.
            </p>

            <div className="feature-grid">
              <div>
                <Icon name="id_card" />

                <span>
                  <strong>Verifikasi Kepemilikan</strong>
                  <small>
                    Petugas memeriksa bukti klaim
                    sebelum barang diserahkan.
                  </small>
                </span>
              </div>

              <div>
                <Icon name="lock" />

                <span>
                  <strong>Privasi Pengguna</strong>
                  <small>
                    Jangan masukkan data pribadi asli
                    dalam prototype.
                  </small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-strip">
        <div className="container">
          <div>
            <h3>
              Punya pertanyaan mengenai barang temuan?
            </h3>

            <p>
              Hubungi petugas kampus untuk bantuan
              pengambilan barang.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => pergi("lapor-ditemukan")}
          >
            Serahkan Temuan
          </button>
        </div>
      </section>
    </>
  );
}

// ========================================
// PENGOLAHAN FOTO
// ========================================

function prosesFoto(file) {
  if (!file || !file.size) {
    return Promise.resolve("");
  }

  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
    ].includes(file.type)
  ) {
    return Promise.reject(
      new Error("Foto harus JPG, PNG, atau WebP.")
    );
  }

  if (file.size > 4 * 1024 * 1024) {
    return Promise.reject(
      new Error("Foto maksimal 4 MB.")
    );
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Foto tidak dapat dibaca."));
    };

    image.onload = () => {
      try {
        const ratio = Math.min(
          1,
          700 / Math.max(image.width, image.height)
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(
          1,
          Math.round(image.width * ratio)
        );

        canvas.height = Math.max(
          1,
          Math.round(image.height * ratio)
        );

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Gagal memproses foto.");
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    image.src = url;
  });
}

// ========================================
// LAPOR BARANG DITEMUKAN
// ========================================

function FormLaporan({
  tipe,
  pengguna,
  simpan,
  pergi,
}) {
  const [memproses, setMemproses] = useState(false);

  const sekarang = new Date(
    Date.now() -
      new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  async function kirim(e) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    setMemproses(true);

    try {
      const foto = await prosesFoto(fd.get("foto"));

      simpan({
        id: crypto.randomUUID(),
        tipe,
        nama: String(fd.get("nama")).trim(),
        kategori: String(fd.get("kategori")),
        merek: String(fd.get("merek") || "").trim(),
        warna: String(fd.get("warna")).trim(),
        lokasi: String(fd.get("lokasi")).trim(),
        waktu: String(fd.get("waktu")),
        ciri: String(fd.get("ciri")).trim(),
        tempat: String(fd.get("tempat") || "").trim(),
        gambar: foto,
        pelapor: pengguna.email,
        status:
          tipe === "HILANG" ? "Hilang" : "Ditemukan",
      });
    } catch (error) {
      alert(
        error.message || "Gagal menyimpan laporan."
      );
    } finally {
      setMemproses(false);
    }
  }

  if (!pengguna) {
    return (
      <div className="container page">
        <Judul
          label="AKUN"
          title="Masuk untuk Membuat Laporan"
          description="Login terlebih dahulu."
        />

        <button
          className="btn btn-primary"
          onClick={() => pergi("masuk")}
        >
          Masuk
        </button>
      </div>
    );
  }

  return (
    <div className="container page">
      <Judul
        label="BUAT LAPORAN"
        title={`Lapor Barang ${
          tipe === "HILANG" ? "Hilang" : "Ditemukan"
        }`}
        description="Lengkapi ciri barang agar mudah dicocokkan."
      />

      <div className="content-grid">
        <form
          className="panel form-grid"
          onSubmit={kirim}
        >
          <label className="field full">
            Nama barang *
            <input
              name="nama"
              required
              maxLength={120}
              placeholder="Contoh: Kunci Honda Vario"
            />
          </label>

          <label className="field">
            Kategori *
            <select
              name="kategori"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Pilih kategori
              </option>

              {KATEGORI.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>

          <label className="field">
            Warna *
            <input
              name="warna"
              required
              placeholder="Contoh: Hitam"
            />
          </label>

          <label className="field">
            Merek
            <input
              name="merek"
              placeholder="Contoh: Honda"
            />
          </label>

          <label className="field">
            Waktu kejadian *
            <input
              name="waktu"
              type="datetime-local"
              max={sekarang}
              required
            />
          </label>

          <label className="field full">
            Lokasi Penemuan *
            <input
              name="lokasi"
              required
              placeholder="Contoh: Perpustakaan UMY"
            />
          </label>

          <label className="field full">
            Tempat penyimpanan *
            <input
              name="tempat"
              required
              placeholder="Contoh: Pos Satpam"
            />
          </label>

          <label className="field full">
            Ciri khusus / deskripsi *
            <textarea
              name="ciri"
              minLength={10}
              rows={4}
              required
              placeholder="Jelaskan ukuran, bentuk dan ciri khusus..."
            />
          </label>

          <label className="field full">
            Foto (opsional)
            <input
              name="foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />

            <small>
              Foto maksimal 4 MB dan disimpan lokal
              untuk demo.
            </small>
          </label>

          <div className="form-buttons full">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={memproses}
            >
              {memproses
                ? "Menyimpan..."
                : "Simpan Laporan"}
            </button>

            <button
              className="btn btn-outline"
              type="button"
              onClick={() => pergi("beranda")}
            >
              Batal
            </button>
          </div>
        </form>

        <aside className="panel tips">
          <h3>Tips Pelaporan</h3>

          <p>
            Jelaskan warna, merek, waktu,
            lokasi, dan ciri khusus dengan detail.
          </p>

          <div className="info-box">
            Setelah disimpan, sistem menampilkan
            rekomendasi kecocokan.
          </div>

          <div className="notice">
            Prototype frontend: gunakan data contoh,
            bukan data pribadi asli.
          </div>
        </aside>
      </div>
    </div>
  );
}

// ========================================
// DETAIL BARANG
// ========================================

function DetailBarang({
  barang,
  pengguna,
  pergi,
}) {
  if (!barang) {
    return (
      <div className="container page">
        <h2>Barang tidak ditemukan.</h2>
      </div>
    );
  }

  const rincian = [
    [
      "Jenis laporan",
      barang.tipe === "HILANG"
        ? "Hilang"
        : "Ditemukan",
    ],
    ["Kategori", barang.kategori],
    ["Merek", barang.merek || "-"],
    ["Warna", barang.warna],
    ["Lokasi", barang.lokasi],
    ["Waktu", `${formatWaktu(barang.waktu)} WIB`],
    ["Deskripsi", barang.ciri],
    ["Penyimpanan", barang.tempat || "-"],
  ];

  return (
    <div className="container page">
      <Judul
        label="DETAIL BARANG"
        title={barang.nama}
        description="Periksa ciri-ciri barang sebelum mengajukan klaim."
      />

      <div className="content-grid">
        <section className="panel">
          <img
            className="detail-photo"
            src={barang.gambar || FOTO.dompet}
            alt={barang.nama}
          />

          <dl className="details">
            {rincian.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="panel tips">
          <span className="status inline">
            {barang.status}
          </span>

          <h3 className="subheading">
            Apakah ini barang milikmu?
          </h3>

          <p>
            Ajukan klaim dengan bukti kepemilikan
            untuk diperiksa oleh petugas.
          </p>

          {barang.tipe === "DITEMUKAN" &&
          barang.status === "Ditemukan" &&
          barang.pelapor !== pengguna?.email ? (
            <button
              className="btn btn-primary btn-block"
              onClick={() =>
                pergi(`klaim/${barang.id}`)
              }
            >
              Ajukan Klaim
            </button>
          ) : (
            <div className="notice">
              Klaim tidak tersedia untuk laporan ini.
            </div>
          )}

          <div className="info-box">
            Rekomendasi bukan bukti kepemilikan.
          </div>
        </aside>
      </div>
    </div>
  );
}

// ========================================
// REKOMENDASI BARANG
// ========================================

function Rekomendasi({ acuan, barang, pergi }) {
  if (!acuan) {
    return (
      <div className="container page">
        <h2>Laporan tidak ditemukan.</h2>
      </div>
    );
  }

  const hasil = barang
    .filter(
      (b) =>
        b.id !== acuan.id &&
        b.tipe !== acuan.tipe &&
        ["Hilang", "Ditemukan"].includes(b.status)
    )
    .map((b) => ({
      ...b,
      skor: skorKemiripan(acuan, b),
    }))
    .filter((b) => b.skor >= 20)
    .sort((a, b) => b.skor - a.skor)
    .slice(0, 5);

  return (
    <div className="container page">
      <Judul
        label="SIMULASI MATCHING"
        title="Rekomendasi Kecocokan"
        description={`Laporan: ${acuan.nama}`}
      />

      <div className="notice">
        Skor kemiripan masih simulasi atribut,
        bukan hasil AI/NLP asli.
      </div>

      <div className="match-list">
        {hasil.length ? (
          hasil.map((b) => (
            <article className="match" key={b.id}>
              <img
                src={b.gambar || FOTO.dompet}
                alt={b.nama}
              />

              <div>
                <h3>{b.nama}</h3>
                <p>
                  {b.kategori} Â· {b.warna} Â· {b.lokasi}
                </p>
              </div>

              <strong>{b.skor}%</strong>

              <button
                className="btn btn-soft btn-small"
                onClick={() =>
                  pergi(`detail/${b.id}`)
                }
              >
                Detail
              </button>
            </article>
          ))
        ) : (
          <div className="empty">
            Belum ada laporan dengan ciri
            yang cukup mirip.
          </div>
        )}
      </div>

      <button
        className="btn btn-outline"
        onClick={() => pergi("laporan-saya")}
      >
        Laporan Saya
      </button>
    </div>
  );
}

// ========================================
// KLAIM BARANG
// ========================================

function HalamanKlaim({
  barang,
  pengguna,
  kirim,
  pergi,
}) {
  if (!pengguna) {
    return (
      <div className="container page">
        <h2>Masuk untuk mengajukan klaim.</h2>

        <button
          className="btn btn-primary"
          onClick={() => pergi("masuk")}
        >
          Masuk
        </button>
      </div>
    );
  }

  if (
    !barang ||
    barang.tipe !== "DITEMUKAN" ||
    barang.status !== "Ditemukan" ||
    barang.pelapor === pengguna.email
  ) {
    return (
      <div className="container page">
        <h2>Klaim tidak tersedia.</h2>
      </div>
    );
  }

  function kirimForm(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    kirim(
      barang.id,
      formData.get("bukti")
    );
  }

  return (
    <div className="container page">
      <Judul
        label="VERIFIKASI KEPEMILIKAN"
        title="Ajukan Klaim Barang"
        description={`Barang: ${barang.nama}`}
      />

      <form
        className="panel auth-panel"
        onSubmit={kirimForm}
      >
        <label className="field">
          Bukti kepemilikan *
          <textarea
            name="bukti"
            rows={5}
            minLength={15}
            required
            placeholder="Jelaskan ciri khusus yang dapat dibuktikan..."
          />
        </label>

        <div className="notice">
          Gunakan data contoh untuk pengujian prototype.
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
        >
          Kirim Klaim
        </button>
      </form>
    </div>
  );
}

// ========================================
// LAPORAN SAYA
// ========================================

function LaporanSaya({
  pengguna,
  barang,
  klaim,
  pergi,
}) {
  if (!pengguna) {
    return (
      <div className="container page">
        <h2>Silakan login terlebih dahulu.</h2>

        <button
          className="btn btn-primary"
          onClick={() => pergi("masuk")}
        >
          Masuk
        </button>
      </div>
    );
  }

  const laporan = barang.filter(
    (b) => b.pelapor === pengguna.email
  );

  const daftarKlaim = klaim.filter(
    (x) => x.email === pengguna.email
  );

  return (
    <div className="container page">
      <Judul
        label="AKTIVITAS PENGGUNA"
        title="Laporan Saya"
        description={`Halo, ${pengguna.nama}. Pantau laporan dan status klaimmu.`}
      />

      <section className="panel block">
        <h2>Daftar Laporan ({laporan.length})</h2>

        {laporan.length ? (
          laporan.map((b) => (
            <div
              className="list-row"
              key={b.id}
            >
              <div>
                <strong>{b.nama}</strong>

                <p>
                  {b.tipe === "HILANG"
                    ? "Hilang"
                    : "Ditemukan"}{" "}
                  Â· {b.status}
                </p>
              </div>

              <div className="button-group">
                <button
                  className="btn btn-soft btn-small"
                  onClick={() =>
                    pergi(`detail/${b.id}`)
                  }
                >
                  Detail
                </button>

                <button
                  className="btn btn-primary btn-small"
                  onClick={() =>
                    pergi(`rekomendasi/${b.id}`)
                  }
                >
                  Rekomendasi
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="muted">
            Belum ada laporan.
          </p>
        )}
      </section>

      <section className="panel block">
        <h2>Status Klaim ({daftarKlaim.length})</h2>

        {daftarKlaim.length ? (
          daftarKlaim.map((x) => (
            <div
              className="list-row"
              key={x.id}
            >
              <div>
                <strong>
                  {barang.find(
                    (b) => b.id === x.barangId
                  )?.nama || "Barang"}
                </strong>

                <p>{formatWaktu(x.tanggal)}</p>
              </div>

              <span className="status inline">
                {x.status}
              </span>
            </div>
          ))
        ) : (
          <p className="muted">
            Belum ada klaim.
          </p>
        )}
      </section>

      <button
        className="btn btn-outline"
        onClick={() => pergi("beranda-pengguna")}
      >
        Kembali ke Beranda Pengguna
      </button>
    </div>
  );
}

// ========================================
// DASHBOARD ADMIN
// ========================================

function Admin({
  pengguna,
  barang,
  klaim,
  verifikasi,
  hapus,
  pergi,
}) {
  if (pengguna?.role !== "admin") {
    return (
      <div className="container page">
        <h2>Akses admin diperlukan.</h2>

        <button
          className="btn btn-primary"
          onClick={() => pergi("masuk")}
        >
          Masuk
        </button>
      </div>
    );
  }

  const menunggu = klaim.filter(
    (x) => x.status === "Menunggu"
  );

  return (
    <div className="container page">
      <Judul
        label="PANEL ADMIN"
        title="Dashboard Admin"
        description="Verifikasi klaim dan kelola laporan barang demo."
      />

      <section className="panel block">
        <h2>
          Klaim Menunggu Verifikasi ({menunggu.length})
        </h2>

        {menunggu.length ? (
          menunggu.map((x) => (
            <div
              className="list-row admin-row"
              key={x.id}
            >
              <div>
                <strong>
                  {barang.find(
                    (b) => b.id === x.barangId
                  )?.nama || "Barang"}
                </strong>

                <p>Pengaju: {x.email}</p>
                <p>Bukti: {x.bukti}</p>
              </div>

              <div className="button-group">
                <button
                  className="btn btn-primary btn-small"
                  onClick={() =>
                    verifikasi(x.id, true)
                  }
                >
                  Setujui
                </button>

                <button
                  className="btn btn-danger btn-small"
                  onClick={() =>
                    verifikasi(x.id, false)
                  }
                >
                  Tolak
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="muted">
            Belum ada klaim yang menunggu.
          </p>
        )}
      </section>

      <section className="panel block">
        <h2>Kelola Data Barang ({barang.length})</h2>

        {barang.map((b) => (
          <div
            className="list-row admin-row"
            key={b.id}
          >
            <div>
              <strong>{b.nama}</strong>

              <p>
                {b.tipe} Â· {b.status}
              </p>
            </div>

            <div className="button-group">
              <button
                className="btn btn-soft btn-small"
                onClick={() =>
                  pergi(`detail/${b.id}`)
                }
              >
                Lihat
              </button>

              <button
                className="btn btn-danger btn-small"
                onClick={() => hapus(b.id)}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ========================================
// HALAMAN INFORMASI
// ========================================

function HalamanInformasi({
  halaman,
  pengguna,
  pergi,
}) {
  const profil = halaman === "profil-saya";

  const bantuan =
    halaman === "bantuan" ||
    halaman === "bantuan-klaim";

  return (
    <div className="container page">
      <Judul
        label={
          profil
            ? "AKUN"
            : bantuan
              ? "PANDUAN"
              : "INFORMASI"
        }
        title={
          profil
            ? "Profil Saya"
            : bantuan
              ? "Cara Klaim Barang"
              : "Kebijakan Privasi"
        }
        description="Informasi FindIt versi prototype."
      />

      <section className="panel block">
        {profil ? (
          <>
            <h2>
              {pengguna?.nama || "Belum login"}
            </h2>

            <p>
              Email: {pengguna?.email || "-"}
            </p>

            <p>
              NIM/NIP:{" "}
              {pengguna?.nomorInduk || "Belum diisi"}
            </p>
          </>
        ) : bantuan ? (
          <>
            <h2>Proses klaim barang</h2>

            <p>
              1. Cari barang yang mirip dengan milikmu.
            </p>

            <p>
              2. Buka detail barang dan ajukan klaim.
            </p>

            <p>
              3. Isi bukti kepemilikan dan tunggu
              verifikasi admin.
            </p>

            <p>
              4. Ambil barang sesuai petunjuk petugas.
            </p>
          </>
        ) : (
          <p>
            FindIt masih prototype frontend.
            Login dan data tersimpan di browser
            untuk demo, belum menggunakan autentikasi server.
          </p>
        )}

        <button
          className="btn btn-primary"
          onClick={() => pergi("beranda")}
        >
          Kembali ke Beranda
        </button>
      </section>
    </div>
  );
}

// ========================================
// APLIKASI UTAMA FINDIT
// ========================================

export default function App() {
  // ======================================
  // DATA BARANG
  // ======================================

  const [barang, setBarang] = useState([]);

  // ======================================
  // DATA KLAIM
  // ======================================

  const [klaim, setKlaim] = useState(() =>
    baca(
      "findit_klaim_final_v1",
      [],
      localStorage
    )
  );

  // ======================================
  // SESI PENGGUNA
  // ======================================

  const [pengguna, setPengguna] = useState(() =>
    baca(
      "findit_user_api_v2",
      null,
      sessionStorage
    )
  );

  // ======================================
  // ROUTING HALAMAN
  // ======================================

  const [rute, setRute] = useState(
    () =>
      window.location.hash.replace(/^#\/?/, "") ||
      "beranda"
  );

  const [cekSesi, setCekSesi] = useState(
    Boolean(pengguna)
  );

  useEffect(() => {
    let aktif = true;
    const controller = new AbortController();

    async function validasiSesi() {
      try {
        sessionStorage.removeItem("findit_user_final_v1");
      } catch {
        // Penyimpanan browser bersifat opsional.
      }

      if (!pengguna?.token) {
        if (aktif) {
          setPengguna(null);
          setCekSesi(false);
        }
        return;
      }

      try {
        const baseUrl = (
          import.meta.env.VITE_API_URL ||
          "http://localhost:5000/api"
        ).replace(/\/$/, "");

        const response = await fetch(
          `${baseUrl}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${pengguna.token}`,
            },
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result.success ||
          !result.data ||
          !["admin", "user"].includes(result.data.role)
        ) {
          throw new Error("Sesi tidak valid.");
        }

        if (aktif) {
          setPengguna({
            ...result.data,
            nama: result.data.name,
            nomorInduk: result.data.nim_nip,
            token: pengguna.token,
          });
        }

      } catch (error) {
        if (aktif) {
          setPengguna(null);

          try {
            sessionStorage.removeItem(
              "findit_user_api_v2"
            );
          } catch {
            // Abaikan kegagalan penyimpanan.
          }
        }
      } finally {
        if (aktif) {
          setCekSesi(false);
        }
      }
    }

    validasiSesi();

    return () => {
      aktif = false;
      controller.abort();
    };
  }, []);


  const [dataPenggunaApi, setDataPenggunaApi] = useState({
    token: null,
    items: [],
    error: "",
    loading: false,
  });

  const tokenAktif = pengguna?.token;

  useEffect(() => {
    if (!tokenAktif || cekSesi) return;

    let aktif = true;
    const controller = new AbortController();

    const base = (
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000/api"
    ).replace(/\/$/, "");

    async function ambil(path) {
      const response = await fetch(`${base}${path}`, {
        headers: {
          Authorization: `Bearer ${tokenAktif}`,
        },
        signal: controller.signal,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data.");
      }

      if (!Array.isArray(result.data)) {
        throw new Error("Format data API tidak sesuai.");
      }

      return result.data;
    }

    async function muatData() {
      setDataPenggunaApi({
        token: tokenAktif,
        items: [],
        error: "",
        loading: true,
      });

      try {
        const temuan = [];

        for (let page = 1; page <= 100; page++) {
          const rows = await ambil(
            `/items?limit=100&page=${page}`
          );

          temuan.push(...rows);

          if (rows.length < 100) break;
        }

        const laporan = await ambil("/reports/my");

        const gambarKosong =
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#e8edf5"/><text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="24">Foto belum tersedia</text></svg>'
          );

        const dataBarang = temuan.map((item) => ({
          id: `item-${item.id}`,
          apiId: item.id,
          tipe: "DITEMUKAN",
          nama: item.item_name,
          kategori: item.category || "Lainnya",
          warna: item.color || "",
          merek: item.brand || "",
          lokasi: item.location || "",
          tempat: item.storage_location || "",
          waktu:
            String(item.found_date || "").slice(0, 10) +
            "T" +
            String(item.found_time || "00:00:00"),
          ciri: item.description || "",
          gambar: gambarKosong,
          status: item.status === "claimed" ? "Dikembalikan" : "Ditemukan",
          pelapor: "",
        }));

        const dataLaporan = laporan.map((item) => ({
          id: `report-${item.id}`,
          apiId: item.id,
          tipe: "HILANG",
          nama: item.item_name,
          kategori: item.category || "Lainnya",
          warna: item.color || "",
          merek: item.brand || "",
          lokasi: item.location || "",
          waktu: String(item.lost_date || "").slice(0, 10),
          ciri: item.description || "",
          gambar: gambarKosong,
          pelapor: pengguna.email,
          status:
            ["resolved", "returned", "completed"].includes(item.status)
              ? "Dikembalikan"
              : item.status === "matched"
                ? "Ada Rekomendasi"
                : "Hilang",
        }));

        if (aktif) {
          setDataPenggunaApi({
            token: tokenAktif,
            items: [...dataBarang, ...dataLaporan],
            error: "",
            loading: false,
          });
        }

      } catch (error) {
        if (aktif) {
          setDataPenggunaApi({
            token: tokenAktif,
            items: [],
            error: error.message || "Backend tidak dapat dihubungi.",
            loading: false,
          });
        }
      }
    }

    muatData();

    return () => {
      aktif = false;
      controller.abort();
    };

  }, [tokenAktif, cekSesi, rute]);

  const barangApi =
    tokenAktif && dataPenggunaApi.token === tokenAktif
      ? dataPenggunaApi.items
      : [];

  const dataApiLoading =
    Boolean(tokenAktif) &&
    (
      dataPenggunaApi.token !== tokenAktif ||
      dataPenggunaApi.loading
    );

  const dataApiError =
    dataPenggunaApi.token === tokenAktif
      ? dataPenggunaApi.error
      : "";

  const [kataCari, setKataCari] = useState("");
  const [menuBuka, setMenuBuka] = useState(false);

  // ======================================
  // PENYIMPANAN DATA
  // ======================================



  useEffect(() => {
    try {
      localStorage.setItem(
        "findit_klaim_final_v1",
        JSON.stringify(klaim)
      );
    } catch {
      console.warn("Penyimpanan klaim penuh.");
    }
  }, [klaim]);

  useEffect(() => {
    try {
      if (pengguna) {
        sessionStorage.setItem(
          "findit_user_api_v2",
          JSON.stringify(pengguna)
        );
      } else {
        sessionStorage.removeItem(
          "findit_user_api_v2"
        );
      }
    } catch {
      console.warn("Gagal menyimpan sesi.");
    }
  }, [pengguna]);

  // ======================================
  // SINKRONISASI URL
  // ======================================

  useEffect(() => {
    const sinkron = () => {
      setRute(
        window.location.hash.replace(/^#\/?/, "") ||
          "beranda"
      );

      setMenuBuka(false);
      window.scrollTo(0, 0);
    };

    window.addEventListener(
      "hashchange",
      sinkron
    );

    return () =>
      window.removeEventListener(
        "hashchange",
        sinkron
      );
  }, []);

  // ======================================
  // NAVIGASI
  // ======================================

  function pergi(tujuan) {
    const route =
      tujuan === "beranda" &&
      pengguna?.role === "user"
        ? "beranda-pengguna"
        : tujuan;

    window.location.hash = route;

    setRute(route);
    setMenuBuka(false);
    window.scrollTo(0, 0);
  }

  function cari(teks = "") {
    setKataCari(teks);
    pergi("cari");
  }

  // ======================================
  // SIMPAN LAPORAN BARU
  // ======================================
  // Barang HILANG masuk ke Proses Analisis.
  // Barang DITEMUKAN langsung ke rekomendasi.

  function simpanLaporan(data) {
    setBarang((lama) => [
      data,
      ...lama,
    ]);

    if (data.tipe === "HILANG") {
      pergi(`proses-analisis/${data.id}`);
    } else {
      pergi(`rekomendasi/${data.id}`);
    }
  }

  // ======================================
  // LOGIN BACKEND
  // ======================================

  async function requestAuth(endpoint, body) {
    const baseUrl = (
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000/api"
    ).replace(/\/$/, "");

    let response;

    try {
      response = await fetch(`${baseUrl}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error(
        "Backend tidak dapat dihubungi. Pastikan server port 5000 berjalan."
      );
    }

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      throw new Error(
        result?.message || "Permintaan gagal. Silakan coba kembali."
      );
    }

    return result.data;
  }

  async function masuk(email, password) {
    const data = await requestAuth("login", {
      email: email.trim().toLowerCase(),
      password,
    });

    const user = data?.user;

    if (
      !data?.token ||
      !user ||
      !["admin", "user"].includes(user.role)
    ) {
      throw new Error("Respons autentikasi tidak valid.");
    }

    setPengguna({
      ...user,
      nama: user.name,
      nomorInduk: user.nim_nip,
      token: data.token,
    });

    pergi(
      user.role === "admin"
        ? "admin"
        : "beranda-pengguna"
    );
  }

  // ======================================
  // REGISTRASI
  // ======================================

  async function registrasi(
    nama,
    email,
    nomorInduk,
    password,
    confirmPassword
  ) {
    await requestAuth("register", {
      name: nama.trim(),
      email: email.trim().toLowerCase(),
      nim_nip: nomorInduk.trim(),
      password,
      confirmPassword,
    });

    return true;
  }

  // ======================================
  // LOGOUT
  // ======================================

  function keluar() {
    setPengguna(null);

    try {
      sessionStorage.removeItem(
        "findit_user_api_v2"
      );
    } catch {
      console.warn("Gagal menghapus sesi.");
    }

    window.location.hash = "beranda";
    setRute("beranda");
    setMenuBuka(false);
    window.scrollTo(0, 0);
  }

  // ======================================
  // KIRIM KLAIM
  // ======================================

  function kirimKlaim(barangId, bukti) {
    if (String(barangId).startsWith("item-")) {
      alert("Integrasi pengajuan klaim sedang diselesaikan.");
      return;
    }
    const target = barang.find(
      (b) => b.id === barangId
    );

    if (
      !pengguna ||
      !target ||
      target.tipe !== "DITEMUKAN" ||
      target.status !== "Ditemukan" ||
      target.pelapor === pengguna.email
    ) {
      return;
    }

    if (
      klaim.some(
        (x) =>
          x.barangId === barangId &&
          x.status === "Menunggu"
      )
    ) {
      alert("Barang ini sedang diverifikasi.");
      return;
    }

    setKlaim((lama) => [
      {
        id: crypto.randomUUID(),
        barangId,
        email: pengguna.email,
        bukti: String(bukti).trim(),
        tanggal: new Date().toISOString(),
        status: "Menunggu",
      },
      ...lama,
    ]);

    setBarang((lama) =>
      lama.map((b) =>
        b.id === barangId
          ? {
              ...b,
              status: "Dalam Verifikasi",
            }
          : b
      )
    );

    pergi("laporan-saya");
  }

  // ======================================
  // VERIFIKASI ADMIN
  // ======================================

  function verifikasiKlaim(id, disetujui) {
    if (pengguna?.role !== "admin") {
      return;
    }

    const target = klaim.find(
      (x) =>
        x.id === id &&
        x.status === "Menunggu"
    );

    if (
      !target ||
      !window.confirm(
        `Yakin ${
          disetujui ? "menyetujui" : "menolak"
        } klaim ini?`
      )
    ) {
      return;
    }

    setKlaim((lama) =>
      lama.map((x) =>
        x.id === id
          ? {
              ...x,
              status: disetujui
                ? "Disetujui"
                : "Ditolak",
            }
          : x
      )
    );

    setBarang((lama) =>
      lama.map((b) =>
        b.id === target.barangId
          ? {
              ...b,
              status: disetujui
                ? "Dikembalikan"
                : "Ditemukan",
            }
          : b
      )
    );
  }

  // ======================================
  // HAPUS LAPORAN
  // ======================================

  function hapusLaporan(id) {
    if (
      pengguna?.role !== "admin" ||
      !window.confirm("Hapus laporan demo ini?")
    ) {
      return;
    }

    setBarang((lama) =>
      lama.filter((b) => b.id !== id)
    );

    setKlaim((lama) =>
      lama.filter((x) => x.barangId !== id)
    );
  }

  // ======================================
  // NAVIGASI DARI KOMPONEN LAIN
  // ======================================

  function navigasiPengguna(tujuan, data) {
    const route = String(tujuan || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const rawId =
      typeof data === "object" && data !== null
        ? data.id
        : data;

    const item =
      [...barangApi, ...barang].find((b) => b.id === String(rawId)
      ) ||
      barang.find(
        (b) => b.id === `demo-${rawId}`
      );

    // Route lengkap dengan ID barang
    if (
      /^(detail|klaim|rekomendasi|proses-analisis)\/[\w-]+$/.test(
        route
      )
    ) {
      return pergi(route);
    }

    // Beranda pengguna
    if (
      [
        "beranda",
        "dashboard",
        "beranda-pengguna",
      ].includes(route)
    ) {
      return pergi(
        pengguna?.role === "user"
          ? "beranda-pengguna"
          : "beranda"
      );
    }

    // Cari barang
    if (
      ["cari", "cari-barang"].includes(route)
    ) {
      return cari(
        typeof data === "string"
          ? data
          : data?.keyword || ""
      );
    }

    // Detail / klaim / rekomendasi
    if (
      [
        "detail",
        "detail-barang",
        "klaim",
        "klaim-barang",
        "rekomendasi",
        "detail-laporan",
      ].includes(route)
    ) {
      if (!item) {
        return pergi("cari");
      }

      const namaRoute = route.startsWith("detail")
        ? "detail"
        : route.startsWith("klaim")
          ? "klaim"
          : "rekomendasi";

      return pergi(`${namaRoute}/${item.id}`);
    }

    // Bantuan
    if (
      ["bantuan", "bantuan-klaim"].includes(route)
    ) {
      return pergi("bantuan-klaim");
    }

    // Logout
    if (
      ["logout", "keluar"].includes(route)
    ) {
      return keluar();
    }

    // Halaman lainnya
    if (
      [
        "lapor-hilang",
        "lapor-ditemukan",
        "laporan-saya",
        "profil-saya",
        "privasi",
        "masuk",
        "daftar",
      ].includes(route)
    ) {
      return pergi(route);
    }

    alert(
      "Fitur ini belum tersedia pada prototype FindIt."
    );
  }

  // ======================================
  // INFORMASI ROUTE AKTIF
  // ======================================

  const [ruteHalaman, id] = rute.split("/");

  const halamanDiminta =
    ruteHalaman === "dashboard"
      ? "beranda-pengguna"
      : ruteHalaman === "cari-barang"
        ? "cari"
        : ruteHalaman;

  const halamanKhususAdmin = [
    "admin",
    "admin-dashboard",
    "data-barang",
    "data-pengguna",
    "input-barang-temuan",
    "verifikasi-laporan",
  ];

  const halamanWajibLogin = [
    "beranda-pengguna",
    "lapor-hilang",
    "lapor-ditemukan",
    "proses-analisis",
    "rekomendasi",
    "klaim",
    "laporan-saya",
    "profil-saya",
    ...halamanKhususAdmin,
  ];

  let tujuanAman = halamanDiminta;

  if (
    !pengguna &&
    halamanWajibLogin.includes(halamanDiminta)
  ) {
    tujuanAman = "masuk";
  } else if (
    halamanKhususAdmin.includes(halamanDiminta) &&
    pengguna?.role !== "admin"
  ) {
    tujuanAman = "beranda-pengguna";
  }

  const halaman = tujuanAman;

  useEffect(() => {
    if (!cekSesi && tujuanAman !== halamanDiminta) {
      window.location.hash = tujuanAman;
      setRute(tujuanAman);
    }
  }, [cekSesi, tujuanAman, halamanDiminta]);


  const detail = [...barangApi, ...barang].find(
    (b) => b.id === id
  );

  const navigasi = [
    ["beranda", "Beranda"],
    ["cari", "Cari Barang"],
    ["lapor-hilang", "Lapor Hilang"],
    ["lapor-ditemukan", "Lapor Ditemukan"],
  ];

  const halamanValid = [
    "beranda",
    "beranda-pengguna",
    "cari",
    "lapor-hilang",
    "lapor-ditemukan",
    "proses-analisis",
    "detail",
    "rekomendasi",
    "klaim",
    "masuk",
    "daftar",
    "laporan-saya",
    "admin",
    "profil-saya",
    "bantuan-klaim",
    "privasi",
  ];

  if (cekSesi || (dataApiLoading && halaman === "detail")) {
    return (
      <div
        className="container page"
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <p role="status">
          Memeriksa sesi pengguna...
        </p>
      </div>
    );
  }


  // ======================================
  // HALAMAN CARI BARANG
  // ======================================

  if (halaman === "cari") {
    return (
      <CariBarang
        items={barangApi}
        loading={dataApiLoading}
        error={dataApiError}
        keyword={kataCari}
        user={pengguna}
        onNavigate={navigasiPengguna}
        onLogout={keluar}
      />
    );
  }

  // ======================================
  // HALAMAN LAPOR HILANG
  // ======================================

  if (halaman === "lapor-hilang") {
    return (
      <LaporHilang
        user={pengguna}
        onNavigate={navigasiPengguna}
        onLogout={keluar}
        onSave={simpanLaporan}
      />
    );
  }

  // ======================================
  // HALAMAN PROSES ANALISIS BARU
  // ======================================

  if (halaman === "proses-analisis") {
    return (
      <ProsesAnalisis
        laporan={detail}
        barang={barang}
        pengguna={pengguna}
        pergi={pergi}
        keluar={keluar}
      />
    );
  }

  // ======================================
  // BERANDA PENGGUNA
  // ======================================

  if (
    pengguna?.role === "user" &&
    ["beranda", "beranda-pengguna"].includes(
      halaman
    )
  ) {
    return (
      <UserHome
        userName={pengguna.nama || "Mahasiswa"}
        userEmail={pengguna.email}
        items={barangApi}
        loading={dataApiLoading}
        error={dataApiError}
        onNavigate={navigasiPengguna}
        onLogout={keluar}
      />
    );
  }

  // ======================================
  // BERANDA PENGGUNA BELUM LOGIN
  // ======================================

  if (
    halaman === "beranda-pengguna" &&
    !pengguna
  ) {
    return (
      <AuthPage
        daftar={false}
        masuk={masuk}
        registrasi={registrasi}
        pergi={pergi}
      />
    );
  }

  // ======================================
  // ADMIN
  // ======================================

  if (
    halaman === "beranda-pengguna" &&
    pengguna?.role === "admin"
  ) {
    return (
      <AdminDashboard
  user={pengguna}
  pengguna={pengguna}
  barang={barang}
  klaim={klaim}
  onNavigate={navigasiPengguna}
  onLogout={keluar}
  onVerifyClaim={verifikasiKlaim}
  onVerifyReport={(laporanId, disetujui) => {
    if (pengguna?.role !== "admin") {
      throw new Error("Akses admin diperlukan.");
    }

    const target = barang.find(
      (item) => String(item.id) === String(laporanId)
    );

    if (!target) {
      throw new Error("Laporan tidak ditemukan.");
    }

    const next = barang.map((item) =>
      String(item.id) === String(laporanId)
        ? {
            ...item,
            statusVerifikasi: disetujui
              ? "Terverifikasi"
              : "Ditolak",
            status: disetujui
              ? item.tipe === "HILANG"
                ? "Hilang"
                : "Ditemukan"
              : "Ditolak",
            tanggalVerifikasi: new Date().toISOString(),
          }
        : item
    );

    localStorage.setItem(
      "findit_barang_final_v1",
      JSON.stringify(next)
    );

    setBarang(next);

    return true;
  }}
/>
    );
  }

  // ======================================
  // NAVBAR UMUM
  // ======================================

  const auth = ["masuk", "daftar"].includes(
    halaman
  );

  return (
    <>
      <header
        className={`site-header ${
          auth ? "auth-site-header" : ""
        }`}
      >
        <div className="container navbar">
          <button
            className="logo"
            onClick={() => pergi("beranda")}
          >
            <span className="logo-mark">
              <Icon name="search" />
            </span>

            <span>
              <strong>FindIt</strong>
              <small>SISTEM KAMPUS</small>
            </span>
          </button>

          <nav
            className={`navigation ${
              menuBuka ? "open" : ""
            }`}
            aria-label="Navigasi utama"
          >
            {navigasi.map(([route, nama]) => (
              <button
                key={route}
                className={
                  halaman === route
                    ? "active"
                    : ""
                }
                onClick={() => pergi(route)}
              >
                {nama}
              </button>
            ))}
          </nav>

          <div className="nav-right">
            {pengguna ? (
              <>
                {pengguna.role === "user" && (
                  <button
                    onClick={() =>
                      pergi("beranda-pengguna")
                    }
                  >
                    Beranda Pengguna
                  </button>
                )}

                <button
                  onClick={() =>
                    pergi("laporan-saya")
                  }
                >
                  Laporan Saya
                </button>

                {pengguna.role === "admin" && (
                  <button
                    onClick={() => pergi("admin")}
                  >
                    Admin
                  </button>
                )}

                <button
                  className="btn btn-primary btn-small"
                  onClick={keluar}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => pergi("masuk")}
                >
                  Masuk
                </button>

                <button
                  className="btn btn-primary btn-small"
                  onClick={() => pergi("daftar")}
                >
                  Daftar
                </button>
              </>
            )}
          </div>

          <button
            className="menu-toggle"
            aria-label="Buka menu"
            aria-expanded={menuBuka}
            onClick={() => setMenuBuka(!menuBuka)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>

      {/* ==================================
          KONTEN HALAMAN UMUM
      ================================== */}

      <main>
        {/* BERANDA AWAL */}

        {halaman === "beranda" && (
          <Beranda
            barang={barangApi}
            pergi={pergi}
            cari={cari}
          />
        )}

        {/* LAPOR DITEMUKAN */}

        {halaman === "lapor-ditemukan" && (
          <FormLaporan
            key="ditemukan"
            tipe="DITEMUKAN"
            pengguna={pengguna}
            simpan={simpanLaporan}
            pergi={pergi}
          />
        )}

        {/* DETAIL BARANG */}

        {halaman === "detail" && (
          <DetailBarang
            barang={detail}
            pengguna={pengguna}
            pergi={pergi}
          />
        )}

        {/* REKOMENDASI */}

        {halaman === "rekomendasi" && (
          <Rekomendasi
            acuan={detail}
            barang={barang}
            pergi={pergi}
          />
        )}

        {/* KLAIM BARANG */}

        {halaman === "klaim" && (
          <HalamanKlaim
            barang={detail}
            pengguna={pengguna}
            kirim={kirimKlaim}
            pergi={pergi}
          />
        )}

        {/* LOGIN DAN REGISTRASI */}

        {auth && (
          <AuthPage
            daftar={halaman === "daftar"}
            masuk={masuk}
            registrasi={registrasi}
            pergi={pergi}
          />
        )}

        {/* LAPORAN SAYA */}

        {halaman === "laporan-saya" && (
          <LaporanSaya
            pengguna={pengguna}
            barang={barang}
            klaim={klaim}
            pergi={pergi}
          />
        )}

        {/* DASHBOARD ADMIN */}

        {halaman === "admin" && (
          <AdminDashboard
  user={pengguna}
  pengguna={pengguna}
  barang={barang}
  klaim={klaim}
  onNavigate={navigasiPengguna}
  onLogout={keluar}
  onVerifyClaim={verifikasiKlaim}
  onVerifyReport={(laporanId, disetujui) => {
    if (pengguna?.role !== "admin") {
      throw new Error("Akses admin diperlukan.");
    }

    const target = barang.find(
      (item) => String(item.id) === String(laporanId)
    );

    if (!target) {
      throw new Error("Laporan tidak ditemukan.");
    }

    const next = barang.map((item) =>
      String(item.id) === String(laporanId)
        ? {
            ...item,
            statusVerifikasi: disetujui
              ? "Terverifikasi"
              : "Ditolak",
            status: disetujui
              ? item.tipe === "HILANG"
                ? "Hilang"
                : "Ditemukan"
              : "Ditolak",
            tanggalVerifikasi: new Date().toISOString(),
          }
        : item
    );

    localStorage.setItem(
      "findit_barang_final_v1",
      JSON.stringify(next)
    );

    setBarang(next);

    return true;
  }}
/>
        )}

        {/* HALAMAN INFORMASI */}

        {[
          "profil-saya",
          "bantuan-klaim",
          "privasi",
        ].includes(halaman) && (
          <HalamanInformasi
            halaman={halaman}
            pengguna={pengguna}
            pergi={pergi}
          />
        )}

        {/* HALAMAN TIDAK DITEMUKAN */}

        {!halamanValid.includes(halaman) && (
          <div className="container page">
            <h2>Halaman tidak ditemukan.</h2>

            <button
              className="btn btn-primary"
              onClick={() => pergi("beranda")}
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </main>

      {/* ==================================
          FOOTER
      ================================== */}

      <footer className="site-footer">
        <div className="container">
          <span>
            ðŸ”Ž <strong>FindIt</strong> Â© 2026
            â€” Prototype Kampus
          </span>

          <span>Lost & Found Kampus</span>
        </div>
      </footer>
    </>
  );
}


