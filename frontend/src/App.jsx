
import { useEffect, useState } from "react";
import AuthPage from "./components/AuthPage.jsx";

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
    ciri: "Tumbler warna biru dongker dengan tutup hitam",
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
    ciri: "Dompet kulit warna hitam dengan beberapa kartu",
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
    ciri: "Earbuds Sony hitam beserta kotak pengisian",
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
  "Kunci",
  "Aksesori",
  "Pakaian",
  "Dokumen",
  "Lainnya",
];

// ========================================
// HELPER
// ========================================

const normalize = (text) =>
  String(text ?? "").trim().toLowerCase();

const tanggal = (value) =>
  value
    ? new Date(value).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

function ambilData(key, fallback, storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function skorKemiripan(a, b) {
  let nilai = 0;

  if (normalize(a.kategori) === normalize(b.kategori)) {
    nilai += 35;
  }

  if (
    a.merek &&
    b.merek &&
    normalize(a.merek) === normalize(b.merek)
  ) {
    nilai += 20;
  }

  if (normalize(a.warna) === normalize(b.warna)) {
    nilai += 20;
  }

  if (normalize(a.lokasi) === normalize(b.lokasi)) {
    nilai += 5;
  }

  const kata = (s) =>
    new Set(
      normalize(s)
        .split(/[^\p{L}\p{N}]+/u)
        .filter((x) => x.length > 2)
    );

  const kataA = kata(`${a.nama} ${a.ciri}`);
  const kataB = kata(`${b.nama} ${b.ciri}`);

  nilai += Math.min(
    20,
    [...kataA].filter((x) => kataB.has(x)).length * 4
  );

  return Math.min(100, nilai);
}

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
// KOMPONEN KARTU BARANG
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
          {tanggal(item.waktu)} WIB
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
// HALAMAN BERANDA
// ========================================

function Beranda({ barang, pergi, cari }) {
  const [teks, setTeks] = useState("");
  const [fotoSiap, setFotoSiap] = useState(true);

  const terbaru = barang
    .filter(
      (x) =>
        x.tipe === "DITEMUKAN" &&
        x.status !== "Dikembalikan"
    )
    .slice(0, 6);

  const langkah = [
    [
      "post_add",
      "Lapor",
      "Isi ciri, foto, waktu, dan lokasi barang hilang atau ditemukan.",
    ],
    [
      "psychology",
      "Analisis Ciri",
      "Sistem membandingkan jenis, warna, merek, dan deskripsi.",
    ],
    [
      "radar",
      "Lihat Rekomendasi",
      "Lihat barang yang memiliki kemiripan paling relevan.",
    ],
    [
      "domain_verification",
      "Konfirmasi & Ambil",
      "Ajukan klaim dan lakukan verifikasi dengan petugas.",
    ],
  ];

  return (
    <>
      <section className="hero">
        {fotoSiap && (
          <img
            className="hero-photo"
            src="/umy.jpg"
            alt=""
            aria-hidden="true"
            onError={() => setFotoSiap(false)}
          />
        )}

        <div className="hero-overlay" />

        {!fotoSiap && (
          <p className="hero-error">
            Foto tidak ditemukan. Periksa file:
            frontend/public/umy.jpg
          </p>
        )}

        <div className="container hero-inner">
          <h1>
            Barang hilang? Temukan lebih cepat di{" "}
            <span>FindIt</span>
          </h1>

          <p>
            Satu tempat terpusat untuk melapor dan mencari
            barang hilang di kampus, dibantu rekomendasi
            pencocokan berdasarkan ciri-ciri barang.
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
            {langkah.map(([icon, title, text], i) => (
              <article className="step" key={title}>
                <span className="step-icon">
                  <Icon name={icon} />
                </span>

                <small>LANGKAH 0{i + 1}</small>
                <h3>{i + 1}. {title}</h3>
                <p>{text}</p>
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
                ● PEMBARUAN BARANG
              </span>
              <h2>Barang Terbaru Ditemukan</h2>
              <p>
                Barang yang baru saja dilaporkan ditemukan
                di lingkungan kampus.
              </p>
            </div>

            <button
              className="link-button"
              onClick={() => cari("")}
            >
              Lihat Semua Temuan →
            </button>
          </div>

          <div className="card-grid">
            {terbaru.map((item) => (
              <BarangCard
                key={item.id}
                item={item}
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
              FindIt membandingkan laporan barang hilang
              dan ditemukan untuk menampilkan rekomendasi.
              Saat ini skor adalah simulasi frontend.
              Keputusan kepemilikan tetap melalui
              verifikasi admin.
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
                    Jangan mengirim data pribadi asli
                    saat mencoba demo.
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
// HALAMAN CARI BARANG
// ========================================

function HalamanCari({ barang, keyword, pergi }) {
  const [teks, setTeks] = useState(keyword);
  const [tipe, setTipe] = useState("");
  const [kategori, setKategori] = useState("");
  const [lokasi, setLokasi] = useState("");

  useEffect(() => {
    setTeks(keyword);
  }, [keyword]);

  const hasil = barang.filter(
    (x) =>
      x.status !== "Dikembalikan" &&
      (!tipe || x.tipe === tipe) &&
      (!kategori || x.kategori === kategori) &&
      normalize(x.lokasi).includes(normalize(lokasi)) &&
      normalize(
        [
          x.nama,
          x.merek,
          x.warna,
          x.ciri,
          x.kategori,
        ].join(" ")
      ).includes(normalize(teks))
  );

  return (
    <div className="container page">
      <Judul
        label="PENCARIAN BARANG"
        title="Cari Barang"
        description="Cari laporan menurut nama, warna, jenis, merek, atau lokasi."
      />

      <div className="filters">
        <input
          aria-label="Kata kunci"
          placeholder="Nama, warna, merek, ciri..."
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
        />

        <select
          aria-label="Jenis laporan"
          value={tipe}
          onChange={(e) => setTipe(e.target.value)}
        >
          <option value="">Semua laporan</option>
          <option value="DITEMUKAN">Ditemukan</option>
          <option value="HILANG">Hilang</option>
        </select>

        <select
          aria-label="Kategori"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
        >
          <option value="">Semua kategori</option>
          {KATEGORI.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>

        <input
          aria-label="Lokasi"
          placeholder="Lokasi kampus"
          value={lokasi}
          onChange={(e) => setLokasi(e.target.value)}
        />
      </div>

      <p className="result-count">
        {hasil.length} laporan ditemukan (data demo)
      </p>

      {hasil.length ? (
        <div className="card-grid">
          {hasil.map((item) => (
            <BarangCard
              key={item.id}
              item={item}
              pergi={pergi}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          Belum ada hasil. Coba kata kunci atau filter lain.
        </div>
      )}
    </div>
  );
}

// ========================================
// PROSES FOTO
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
      new Error("Ukuran foto maksimal 4 MB.")
    );
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Foto tidak bisa dibaca."));
    };

    image.onload = () => {
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

      canvas
        .getContext("2d")
        .drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };

    image.src = url;
  });
}

// ========================================
// HALAMAN FORM LAPORAN
// ========================================

function FormLaporan({ tipe, pengguna, simpan, pergi }) {
  const [memproses, setMemproses] = useState(false);

  const sekarang = new Date(
    Date.now() -
      new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  if (!pengguna) {
    return (
      <div className="container page">
        <Judul
          label="LOGIN DIPERLUKAN"
          title="Masuk untuk Membuat Laporan"
          description="Gunakan akun demo sebelum mengirim laporan."
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

  async function submit(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    setMemproses(true);

    try {
      const foto = await prosesFoto(form.get("foto"));

      simpan({
        id: crypto.randomUUID(),
        tipe,
        nama: String(form.get("nama")).trim(),
        kategori: String(form.get("kategori")),
        merek: String(form.get("merek") || "").trim(),
        warna: String(form.get("warna")).trim(),
        lokasi: String(form.get("lokasi")).trim(),
        waktu: String(form.get("waktu")),
        ciri: String(form.get("ciri")).trim(),
        tempat: String(form.get("tempat") || "").trim(),
        gambar: foto || FOTO.dompet,
        pelapor: pengguna.email,
        status:
          tipe === "HILANG" ? "Hilang" : "Ditemukan",
      });
    } catch (error) {
      alert(error.message || "Gagal menyimpan foto.");
    } finally {
      setMemproses(false);
    }
  }

  return (
    <div className="container page">
      <Judul
        label="BUAT LAPORAN"
        title={`Lapor Barang ${
          tipe === "HILANG" ? "Hilang" : "Ditemukan"
        }`}
        description="Masukkan informasi barang selengkap mungkin untuk membantu pencocokan."
      />

      <div className="content-grid">
        <form
          className="panel form-grid"
          onSubmit={submit}
        >
          <label className="field full">
            Nama barang *
            <input
              name="nama"
              required
              maxLength={120}
              placeholder="Contoh: Kunci Honda Vario hitam"
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
            Lokasi{" "}
            {tipe === "HILANG"
              ? "terakhir terlihat"
              : "penemuan"}{" "}
            *
            <input
              name="lokasi"
              required
              placeholder="Contoh: Perpustakaan Pusat Lt. 2"
            />
          </label>

          {tipe === "DITEMUKAN" && (
            <label className="field full">
              Tempat penyimpanan *
              <input
                name="tempat"
                required
                placeholder="Contoh: Pos Satpam Utama"
              />
            </label>
          )}

          <label className="field full">
            Ciri khusus / deskripsi *
            <textarea
              name="ciri"
              minLength={10}
              rows={4}
              required
              placeholder="Deskripsikan ukuran, bentuk, dan ciri khusus barang..."
            />
          </label>

          <label className="field full">
            Foto barang (opsional)
            <input
              name="foto"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
            <small>
              Maksimal 4 MB. Untuk demo disimpan
              di browser.
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
          <h3>Tips pelaporan</h3>
          <p>
            Isi warna, merek, lokasi, waktu,
            dan ciri barang dengan jelas.
          </p>

          <div className="info-box">
            Setelah laporan disimpan, rekomendasi
            kecocokan langsung ditampilkan.
          </div>

          <div className="notice">
            Gunakan informasi contoh. Jangan masukkan
            identitas pribadi atau data rahasia
            di prototype.
          </div>
        </aside>
      </div>
    </div>
  );
}

// ========================================
// HALAMAN DETAIL BARANG
// ========================================

function DetailBarang({ barang, pengguna, pergi }) {
  if (!barang) {
    return (
      <div className="container page">
        <h2>Barang tidak ditemukan.</h2>
      </div>
    );
  }

  const rincian = [
    [
      "Tipe laporan",
      barang.tipe === "HILANG" ? "Hilang" : "Ditemukan",
    ],
    ["Kategori", barang.kategori],
    ["Merek", barang.merek || "-"],
    ["Warna", barang.warna],
    ["Lokasi", barang.lokasi],
    ["Waktu", `${tanggal(barang.waktu)} WIB`],
    ["Deskripsi", barang.ciri],
    ["Tempat penyimpanan", barang.tempat || "-"],
  ];

  return (
    <div className="container page">
      <Judul
        label="DETAIL LAPORAN"
        title={barang.nama}
        description="Periksa ciri dan status sebelum mengajukan klaim."
      />

      <div className="content-grid">
        <section className="panel">
          <img
            className="detail-photo"
            src={barang.gambar || FOTO.dompet}
            alt={barang.nama}
          />

          <dl className="details">
            {rincian.map(([nama, nilai]) => (
              <div key={nama}>
                <dt>{nama}</dt>
                <dd>{nilai}</dd>
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
            Ajukan bukti kepemilikan. Admin akan
            memeriksa klaim sebelum barang diserahkan.
          </p>

          {barang.tipe === "DITEMUKAN" &&
          barang.status === "Ditemukan" &&
          pengguna?.email !== barang.pelapor ? (
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
              Klaim belum tersedia untuk laporan ini.
            </div>
          )}

          <div className="info-box">
            Skor rekomendasi tidak membuktikan
            kepemilikan barang.
          </div>
        </aside>
      </div>
    </div>
  );
}

// ========================================
// HALAMAN REKOMENDASI
// ========================================

function HalamanRekomendasi({ acuan, barang, pergi }) {
  if (!acuan) {
    return (
      <div className="container page">
        <h2>Laporan tidak ditemukan.</h2>
      </div>
    );
  }

  const hasil = barang
    .filter(
      (x) =>
        x.id !== acuan.id &&
        x.tipe !== acuan.tipe &&
        ["Ditemukan", "Hilang"].includes(x.status)
    )
    .map((x) => ({
      ...x,
      skor: skorKemiripan(acuan, x),
    }))
    .filter((x) => x.skor >= 20)
    .sort((a, b) => b.skor - a.skor)
    .slice(0, 5);

  return (
    <div className="container page">
      <Judul
        label="SIMULASI MATCHING"
        title="Rekomendasi Kecocokan"
        description={`Laporan acuan: ${acuan.nama}`}
      />

      <div className="notice">
        Skor ini perbandingan atribut dan kata,
        bukan prediksi AI/NLP atau kepastian
        barang milik seseorang.
      </div>

      <div className="match-list">
        {hasil.length ? (
          hasil.map((x) => (
            <article className="match" key={x.id}>
              <img
                src={x.gambar || FOTO.dompet}
                alt={x.nama}
              />

              <div>
                <h3>{x.nama}</h3>
                <p>
                  {x.kategori} · {x.warna} · {x.lokasi}
                </p>
              </div>

              <strong>{x.skor}%</strong>

              <button
                className="btn btn-soft btn-small"
                onClick={() =>
                  pergi(`detail/${x.id}`)
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
        Lihat Laporan Saya
      </button>
    </div>
  );
}

// ========================================
// HALAMAN KLAIM BARANG
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
        <Judul
          label="LOGIN DIPERLUKAN"
          title="Masuk untuk Klaim"
          description="Gunakan akun demo dahulu."
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

  return (
    <div className="container page">
      <Judul
        label="VERIFIKASI KEPEMILIKAN"
        title="Ajukan Klaim Barang"
        description={`Barang: ${barang.nama}`}
      />

      <form
        className="panel auth-panel"
        onSubmit={(e) => {
          e.preventDefault();

          kirim(
            barang.id,
            new FormData(e.currentTarget).get("bukti")
          );
        }}
      >
        <label className="field">
          Bukti kepemilikan *
          <textarea
            name="bukti"
            required
            minLength={15}
            rows={5}
            placeholder="Tuliskan ciri khusus yang dapat diverifikasi petugas..."
          />
        </label>

        <div className="notice">
          Gunakan data dummy untuk simulasi.
        </div>

        <button
          className="btn btn-primary btn-block"
          type="submit"
        >
          Kirim Klaim
        </button>
      </form>
    </div>
  );
}

// ========================================
// HALAMAN LAPORAN SAYA
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
        <Judul
          label="LAPORAN SAYA"
          title="Silakan Masuk"
          description="Login untuk melihat aktivitasmu."
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

  const milikSaya = barang.filter(
    (x) => x.pelapor === pengguna.email
  );

  const klaimSaya = klaim.filter(
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
        <h2>
          Daftar Laporan ({milikSaya.length})
        </h2>

        {milikSaya.length ? (
          milikSaya.map((x) => (
            <div
              className="list-row"
              key={x.id}
            >
              <div>
                <strong>{x.nama}</strong>
                <p>
                  {x.tipe === "HILANG"
                    ? "Hilang"
                    : "Ditemukan"}
                  {" · "}
                  {x.status}
                </p>
              </div>

              <button
                className="btn btn-soft btn-small"
                onClick={() =>
                  pergi(`rekomendasi/${x.id}`)
                }
              >
                Rekomendasi
              </button>
            </div>
          ))
        ) : (
          <p className="muted">
            Belum ada laporan.
          </p>
        )}
      </section>

      <section className="panel block">
        <h2>
          Status Klaim ({klaimSaya.length})
        </h2>

        {klaimSaya.length ? (
          klaimSaya.map((x) => (
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

                <p>{tanggal(x.tanggal)} WIB</p>
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
        description="Kelola laporan dan verifikasi klaim pada data simulasi."
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
        <h2>
          Kelola Data Barang ({barang.length})
        </h2>

        {barang.map((x) => (
          <div
            className="list-row admin-row"
            key={x.id}
          >
            <div>
              <strong>{x.nama}</strong>

              <p>
                {x.tipe === "HILANG"
                  ? "Hilang"
                  : "Ditemukan"}
                {" · "}
                {x.status}
              </p>
            </div>

            <div className="button-group">
              <button
                className="btn btn-soft btn-small"
                onClick={() =>
                  pergi(`detail/${x.id}`)
                }
              >
                Lihat
              </button>

              <button
                className="btn btn-danger btn-small"
                onClick={() =>
                  hapus(x.id)
                }
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
// APLIKASI UTAMA FINDIT
// ========================================

export default function App() {
  const [barang, setBarang] = useState(() =>
    ambilData("findit_barang_final_v1", DATA_AWAL)
  );

  const [klaim, setKlaim] = useState(() =>
    ambilData("findit_klaim_final_v1", [])
  );

  const [pengguna, setPengguna] = useState(() =>
    ambilData(
      "findit_user_final_v1",
      null,
      sessionStorage
    )
  );

  const [rute, setRute] = useState(
    () =>
      window.location.hash.slice(1) || "beranda"
  );

  const [kataCari, setKataCari] = useState("");
  const [menuBuka, setMenuBuka] = useState(false);

  // Simpan data demo
  useEffect(() => {
    try {
      localStorage.setItem(
        "findit_barang_final_v1",
        JSON.stringify(barang)
      );
    } catch {
      console.warn(
        "Gagal menyimpan laporan (storage penuh)."
      );
    }
  }, [barang]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "findit_klaim_final_v1",
        JSON.stringify(klaim)
      );
    } catch {
      console.warn(
        "Gagal menyimpan klaim (storage penuh)."
      );
    }
  }, [klaim]);

  // Sesi pengguna
  useEffect(() => {
    if (pengguna) {
      sessionStorage.setItem(
        "findit_user_final_v1",
        JSON.stringify(pengguna)
      );
    } else {
      sessionStorage.removeItem(
        "findit_user_final_v1"
      );
    }
  }, [pengguna]);

  // Sinkronisasi halaman
  useEffect(() => {
    const sinkron = () => {
      setRute(
        window.location.hash.slice(1) || "beranda"
      );

      setMenuBuka(false);
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", sinkron);

    return () =>
      window.removeEventListener("hashchange", sinkron);
  }, []);

  function pergi(halaman) {
    window.location.hash = halaman;
    setRute(halaman);
    setMenuBuka(false);
    window.scrollTo(0, 0);
  }

  function cari(teks) {
    setKataCari(teks);
    pergi("cari");
  }

  function simpanLaporan(data) {
    setBarang((lama) => [data, ...lama]);
    pergi(`rekomendasi/${data.id}`);
  }

  // ======================================
  // LOGIN DEMO
  // ======================================

  function masuk(email, password) {
    const admin =
      email === "admin@findit.test" &&
      password === "admin123";

    const user =
      email === "demo@findit.test" &&
      password === "demo123";

    if (!admin && !user) {
      alert("Email atau password akun demo salah.");
      return;
    }

    setPengguna({
      email,
      nama: admin
        ? "Admin FindIt"
        : "Pengguna Demo",
      role: admin ? "admin" : "user",
    });

    pergi(
      admin ? "admin" : "laporan-saya"
    );
  }

  // ======================================
  // REGISTRASI DEMO
  // ======================================

  function registrasi(nama, email, nomorInduk) {
    if (!nama || !email || !nomorInduk) {
      alert("Lengkapi semua data pendaftaran.");
      return;
    }

    setPengguna({
      email,
      nama,
      nomorInduk,
      role: "user",
    });

    pergi("laporan-saya");
  }

  function keluar() {
    setPengguna(null);
    pergi("beranda");
  }

  // ======================================
  // KLAIM BARANG
  // ======================================

  function kirimKlaim(barangId, bukti) {
    const target = barang.find(
      (x) => x.id === barangId
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

    const sedangDiproses = klaim.some(
      (x) =>
        x.barangId === barangId &&
        x.status === "Menunggu"
    );

    if (sedangDiproses) {
      alert(
        "Barang ini sedang dalam verifikasi."
      );
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
      lama.map((x) =>
        x.id === barangId
          ? {
              ...x,
              status: "Dalam Verifikasi",
            }
          : x
      )
    );

    pergi("laporan-saya");
  }

  // ======================================
  // VERIFIKASI ADMIN
  // ======================================

  function verifikasiKlaim(id, disetujui) {
    if (pengguna?.role !== "admin") return;

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
      lama.map((x) =>
        x.id === target.barangId
          ? {
              ...x,
              status: disetujui
                ? "Dikembalikan"
                : "Ditemukan",
            }
          : x
      )
    );
  }

  function hapusLaporan(id) {
    if (pengguna?.role !== "admin") return;

    if (
      !window.confirm(
        "Hapus laporan ini dari data demo?"
      )
    ) {
      return;
    }

    setBarang((lama) =>
      lama.filter((x) => x.id !== id)
    );

    setKlaim((lama) =>
      lama.filter(
        (x) => x.barangId !== id
      )
    );
  }

  // ======================================
  // ROUTING
  // ======================================

  const [halaman, id] = rute.split("/");

  const detail = barang.find(
    (x) => x.id === id
  );

  const navigasi = [
    ["beranda", "Beranda"],
    ["cari", "Cari Barang"],
    ["lapor-hilang", "Lapor Hilang"],
    ["lapor-ditemukan", "Lapor Ditemukan"],
  ];

  const halamanValid = [
    ...navigasi.map((x) => x[0]),
    "detail",
    "rekomendasi",
    "klaim",
    "masuk",
    "daftar",
    "laporan-saya",
    "admin",
  ];

  const halamanAuth = ["masuk", "daftar"].includes(
    halaman
  );

  return (
    <>
      {/* HEADER */}
      <header
        className={`site-header ${
          halamanAuth ? "auth-site-header" : ""
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
                  halaman === route ? "active" : ""
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

      {/* KONTEN HALAMAN */}
      <main>
        {halaman === "beranda" && (
          <Beranda
            barang={barang}
            pergi={pergi}
            cari={cari}
          />
        )}

        {halaman === "cari" && (
          <HalamanCari
            barang={barang}
            keyword={kataCari}
            pergi={pergi}
          />
        )}

        {halaman === "lapor-hilang" && (
          <FormLaporan
            key="hilang"
            tipe="HILANG"
            pengguna={pengguna}
            simpan={simpanLaporan}
            pergi={pergi}
          />
        )}

        {halaman === "lapor-ditemukan" && (
          <FormLaporan
            key="ditemukan"
            tipe="DITEMUKAN"
            pengguna={pengguna}
            simpan={simpanLaporan}
            pergi={pergi}
          />
        )}

        {halaman === "detail" && (
          <DetailBarang
            barang={detail}
            pengguna={pengguna}
            pergi={pergi}
          />
        )}

        {halaman === "rekomendasi" && (
          <HalamanRekomendasi
            acuan={detail}
            barang={barang}
            pergi={pergi}
          />
        )}

        {halaman === "klaim" && (
          <HalamanKlaim
            barang={detail}
            pengguna={pengguna}
            kirim={kirimKlaim}
            pergi={pergi}
          />
        )}

        {/* LOGIN DAN DAFTAR BARU */}
        {(halaman === "masuk" ||
          halaman === "daftar") && (
          <AuthPage
            daftar={halaman === "daftar"}
            masuk={masuk}
            registrasi={registrasi}
            pergi={pergi}
          />
        )}

        {halaman === "laporan-saya" && (
          <LaporanSaya
            pengguna={pengguna}
            barang={barang}
            klaim={klaim}
            pergi={pergi}
          />
        )}

        {halaman === "admin" && (
          <Admin
            pengguna={pengguna}
            barang={barang}
            klaim={klaim}
            verifikasi={verifikasiKlaim}
            hapus={hapusLaporan}
            pergi={pergi}
          />
        )}

        {!halamanValid.includes(halaman) && (
          <div className="container page">
            <h2>Halaman tidak ditemukan.</h2>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <span>
            🔎 <strong>FindIt</strong> © 2026
            — Prototype Kampus
          </span>

          <span>Lost & Found Kampus</span>
        </div>
      </footer>
    </>
  );
}
