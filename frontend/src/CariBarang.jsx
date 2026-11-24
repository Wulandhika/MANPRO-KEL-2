
import { useEffect, useMemo, useState } from "react";
import "./CariBarang.css";



const JENIS = [
  "Dompet",
  "HP / Smartphone",
  "Kunci",
  "Tas & Ransel",
  "Laptop & Tablet",
  "Botol Minum / Tumbler",
  "Pakaian & Jaket",
  "Aksesori & Perhiasan",
  "Lainnya",
];

const WARNA = [
  { nama: "Hitam", kode: "#1e293b" },
  { nama: "Cokelat", kode: "#78350f" },
  { nama: "Biru", kode: "#2563eb" },
  { nama: "Merah", kode: "#dc2626" },
  { nama: "Putih", kode: "#ffffff" },
  { nama: "Abu-abu", kode: "#94a3b8" },
  { nama: "Hijau", kode: "#16a34a" },
];

const LOKASI = [
  ["", "Semua Lokasi Kampus"],
  ["kantin", "Kantin Pusat / AR Fachruddin"],
  ["perpustakaan", "Perpustakaan UMY"],
  ["masjid", "Masjid Ahmad Dahlan"],
  ["rektorat", "Rektorat UMY"],
  ["sportorium", "Sportorium UMY"],
  ["ibrahim", "Gedung KH Ibrahim"],
  ["walidah", "Gedung Siti Walidah"],
  ["parkir", "Area Parkir / Gerbang Utama"],
];

const KOSONG = () => ({
  jenis: [],
  warna: "",
  merek: "",
  lokasi: "",
  dari: "",
  sampai: "",
});

const kecil = (s) =>
  String(s ?? "").toLocaleLowerCase("id-ID").trim();

function kelompok(item) {
  const t = kecil(`${item.kategori} ${item.nama}`);

  if (/dompet|wallet/.test(t)) return "Dompet";
  if (/smartphone|handphone|iphone|ponsel/.test(t))
    return "HP / Smartphone";
  if (/kunci|smartkey/.test(t)) return "Kunci";
  if (/tas|ransel|backpack/.test(t)) return "Tas & Ransel";
  if (/laptop|tablet|ipad|macbook/.test(t))
    return "Laptop & Tablet";
  if (/tumbler|botol|minum|flask/.test(t))
    return "Botol Minum / Tumbler";
  if (/jaket|hoodie|pakaian|parasut/.test(t))
    return "Pakaian & Jaket";
  if (/aksesori|aksesor|earbud|kacamata|helm|case/.test(t))
    return "Aksesori & Perhiasan";
  return "Lainnya";
}

function waktuSingkat(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  const hari = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const jam = d
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(".", ":");

  return `${hari} • ${jam} WIB`;
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

export default function CariBarang({
  items = [],
  loading = false,
  error = "",
  keyword = "",
  user = null,
  onNavigate = () => {},
  onLogout = () => {},
}) {
  const [teks, setTeks] = useState(keyword);
  const [pencarian, setPencarian] = useState(keyword);
  const [draft, setDraft] = useState(KOSONG);
  const [filter, setFilter] = useState(KOSONG);
  const [urutan, setUrutan] = useState("terbaru");
  const [hal, setHal] = useState(1);
  const [detail, setDetail] = useState(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setTeks(keyword || "");
    setPencarian(keyword || "");
    setHal(1);
  }, [keyword]);

  useEffect(() => {
    if (!detail) return;

    function tutup(e) {
      if (e.key === "Escape") setDetail(null);
    }

    window.addEventListener("keydown", tutup);
    return () => window.removeEventListener("keydown", tutup);
  }, [detail]);

  // Data contoh dan laporan baru dari aplikasi.
  const daftar = useMemo(() => {
    const baru = (Array.isArray(items) ? items : [])
      .filter(
        (x) =>
          x.tipe === "DITEMUKAN" &&
          x.status !== "Dikembalikan" &&
          x.pelapor !== "demo-sistem"
      )
      .map((x) => ({
        ...x,
        id: String(x.id),
        contoh: false,
      }));

    return baru;
  }, [items]);

  const hasil = useMemo(() => {
    const kata = kecil(pencarian);

    return daftar
      .filter((item) => {
        const teksBarang = kecil(
          [
            item.nama,
            item.ciri,
            item.kategori,
            item.merek,
            item.warna,
            item.lokasi,
            item.tempat,
          ].join(" ")
        );

        if (
          kata &&
          !kata
            .split(/\s+/)
            .every((k) => teksBarang.includes(k))
        ) {
          return false;
        }

        if (
          filter.jenis.length &&
          !filter.jenis.includes(kelompok(item))
        ) {
          return false;
        }

        if (
          filter.warna &&
          !kecil(item.warna).includes(kecil(filter.warna))
        ) {
          return false;
        }

        if (
          filter.merek &&
          !kecil(item.merek).includes(kecil(filter.merek))
        ) {
          return false;
        }

        if (
          filter.lokasi &&
          !kecil(item.lokasi).includes(filter.lokasi)
        ) {
          if (
            !(
              filter.lokasi === "ibrahim" &&
              kecil(item.lokasi).includes("e6")
            )
          ) {
            return false;
          }
        }

        const tanggal = String(item.waktu || "").slice(0, 10);

        if (filter.dari && tanggal < filter.dari)
          return false;

        if (filter.sampai && tanggal > filter.sampai)
          return false;

        return true;
      })
      .sort((a, b) =>
        urutan === "terbaru"
          ? new Date(b.waktu) - new Date(a.waktu)
          : new Date(a.waktu) - new Date(b.waktu)
      );
  }, [daftar, pencarian, filter, urutan]);

  const perHalaman = 9;
  const jumlahHalaman = Math.max(
    1,
    Math.ceil(hasil.length / perHalaman)
  );
  const halaman = Math.min(hal, jumlahHalaman);

  const tampil = hasil.slice(
    (halaman - 1) * perHalaman,
    halaman * perHalaman
  );

  function cari(e) {
    e?.preventDefault();
    setPencarian(teks.trim());
    setHal(1);
  }

  function chip(teksChip) {
    setTeks(teksChip);
    setPencarian(teksChip);
    setHal(1);
  }

  function reset() {
    setDraft(KOSONG());
    setFilter(KOSONG());
    setTeks("");
    setPencarian("");
    setUrutan("terbaru");
    setHal(1);
  }

  function pindah(ke) {
    setMenu(false);
    onNavigate(ke);
  }

  function bukaDetail(item) {
    if (item.contoh) {
      setDetail(item);
    } else {
      onNavigate("detail", { id: item.id });
    }
  }

  return (
    <div className="cb-page">
      <header className="cb-header">
        <div className="cb-nav">
          <button
            className="cb-brand"
            onClick={() => pindah("beranda")}
          >
            <span className="cb-logo">
              <Icon name="search" />
            </span>
            <span>
              <b>FindIt</b>
              <small>SISTEM KAMPUS</small>
            </span>
          </button>

          <nav
            className="cb-links"
            aria-label="Navigasi FindIt"
          >
            <button onClick={() => pindah("beranda")}>
              Beranda
            </button>
            <button
              className="cb-active"
              onClick={() => {
                reset();
                window.scrollTo(0, 0);
              }}
            >
              Cari Barang
            </button>
            <button onClick={() => pindah("lapor-hilang")}>
              Lapor Hilang
            </button>
            <button onClick={() => pindah("laporan-saya")}>
              Laporan Saya
            </button>
          </nav>

          {user ? (
            <div className="cb-account">
              <button
                className="cb-user"
                aria-expanded={menu}
                onClick={() => setMenu((v) => !v)}
              >
                <span className="cb-avatar">
                  <Icon name="person" />
                </span>
                <span className="cb-user-name">
                  {user.nama || "Pengguna"}
                </span>
                <Icon name="expand_more" />
              </button>

              {menu && (
                <div className="cb-menu">
                  <button
                    onClick={() => pindah("profil-saya")}
                  >
                    <Icon name="account_circle" />
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
            <div className="cb-guest">
              <button onClick={() => pindah("masuk")}>
                Masuk
              </button>
              <button
                className="cb-button"
                onClick={() => pindah("daftar")}
              >
                Daftar
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="cb-main">
        <div className="cb-breadcrumb">
          <button onClick={() => pindah("beranda")}>
            Beranda
          </button>
          <Icon name="chevron_right" />
          <b>Cari Barang</b>
        </div>

        <h1>Cari Barang</h1>
        <p className="cb-subtitle">
          Cari barang temuan berdasarkan ciri-cirinya.
        </p>

        <form className="cb-search" onSubmit={cari}>
          <Icon name="search" />
          <input
            aria-label="Cari barang berdasarkan ciri"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder="Cari berdasarkan ciri: jenis, warna, merek..."
          />
          <button className="cb-button" type="submit">
            <Icon name="search" />
            Cari
          </button>
        </form>

        <div className="cb-chips">
          <span>Rekomendasi pencarian:</span>
          {[
            ["Tumbler", "local_cafe"],
            ["Dompet", "wallet"],
            ["Kunci Motor", "key"],
            ["Jaket", "checkroom"],
            ["Earbuds", "headphones"],
            ["Laptop", "laptop_mac"],
            ["Tas", "backpack"],
          ].map(([nama, ikon]) => (
            <button
              key={nama}
              className={
                pencarian === nama ? "cb-chip-selected" : ""
              }
              onClick={() => chip(nama)}
            >
              <Icon name={ikon} />
              {nama}
            </button>
          ))}
        </div>

        <div className="cb-layout">
          <aside className="cb-sidebar">
            <div className="cb-filter-top">
              <h2>
                <Icon name="tune" />
                Filter
              </h2>
              <button type="button" onClick={reset}>
                Reset
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFilter({ ...draft });
                setHal(1);
              }}
            >
              <fieldset className="cb-filter-group">
                <legend>Jenis Barang</legend>
                {JENIS.map((j) => (
                  <label className="cb-check" key={j}>
                    <input
                      type="checkbox"
                      checked={draft.jenis.includes(j)}
                      onChange={(e) =>
                        setDraft((v) => ({
                          ...v,
                          jenis: e.target.checked
                            ? [...v.jenis, j]
                            : v.jenis.filter((x) => x !== j),
                        }))
                      }
                    />
                    {j}
                  </label>
                ))}
              </fieldset>

              <div className="cb-filter-group">
                <h3>Warna Dominan</h3>
                <div className="cb-swatches">
                  {WARNA.map((w) => (
                    <button
                      key={w.nama}
                      type="button"
                      title={w.nama}
                      aria-label={`Filter warna ${w.nama}`}
                      aria-pressed={draft.warna === w.nama}
                      className={
                        draft.warna === w.nama
                          ? "cb-swatch-on"
                          : ""
                      }
                      style={{ background: w.kode }}
                      onClick={() =>
                        setDraft((v) => ({
                          ...v,
                          warna:
                            v.warna === w.nama ? "" : w.nama,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <label className="cb-filter-group">
                <h3>Merek / Jenama</h3>
                <input
                  className="cb-field"
                  placeholder="Contoh: Eiger, Apple, Uniqlo"
                  value={draft.merek}
                  onChange={(e) =>
                    setDraft((v) => ({
                      ...v,
                      merek: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="cb-filter-group">
                <h3>Lokasi Ditemukan</h3>
                <select
                  className="cb-field"
                  value={draft.lokasi}
                  onChange={(e) =>
                    setDraft((v) => ({
                      ...v,
                      lokasi: e.target.value,
                    }))
                  }
                >
                  {LOKASI.map(([value, nama]) => (
                    <option key={value} value={value}>
                      {nama}
                    </option>
                  ))}
                </select>
              </label>

              <div className="cb-filter-group">
                <h3>Tanggal Ditemukan</h3>
                <label className="cb-date">
                  Dari:
                  <input
                    type="date"
                    value={draft.dari}
                    onChange={(e) =>
                      setDraft((v) => ({
                        ...v,
                        dari: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="cb-date">
                  Sampai:
                  <input
                    type="date"
                    min={draft.dari || undefined}
                    value={draft.sampai}
                    onChange={(e) =>
                      setDraft((v) => ({
                        ...v,
                        sampai: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <button
                type="submit"
                className="cb-button cb-apply"
              >
                <Icon name="filter_alt" />
                Terapkan Filter
              </button>

              <button
                type="button"
                className="cb-reset-bottom"
                onClick={reset}
              >
                Reset Filter
              </button>
            </form>
          </aside>

          <section
            className="cb-results"
            aria-label="Hasil pencarian barang"
          >
            <div className="cb-result-toolbar">
              <span>
                <i className="cb-green-dot" />
                Menampilkan <strong>{tampil.length}</strong>
                {" "}dari <strong>{hasil.length}</strong>
                {" "}barang temuan
                <small>(data server)</small>
              </span>

              <label>
                Urutkan:
                <select
                  value={urutan}
                  onChange={(e) => {
                    setUrutan(e.target.value);
                    setHal(1);
                  }}
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="terlama">Terlama</option>
                </select>
              </label>
            </div>

                        {!user ? (
              <div className="cb-empty">
                <Icon name="lock" />
                <h3>Silakan masuk terlebih dahulu</h3>
                <p>Login untuk melihat katalog barang kampus.</p>
                <button className="cb-button" onClick={() => pindah("masuk")}>
                  Masuk
                </button>
              </div>
            ) : loading ? (
              <div className="cb-empty" role="status">
                Memuat barang dari database...
              </div>
            ) : error ? (
              <div className="cb-empty" role="alert">
                {error}
              </div>
            ) : tampil.length ? (
              <div className="cb-grid">
                {tampil.map((item) => (
                  <article
                    className="cb-card"
                    key={item.id}
                  >
                    <div className="cb-cover">
                      <Icon name="inventory_2" />
                      <img
                        src={item.gambar}
                        alt={item.nama}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span className="cb-post">
                        <Icon name="shield_person" />
                        {item.tempat || "Pos Penampungan"}
                      </span>
                    </div>

                    <div className="cb-card-body">
                      <span className="cb-safe">
                        ● {kelompok(item)} •{" "}
                        {item.status === "Dalam Verifikasi"
                          ? "Dalam Verifikasi"
                          : "Tersimpan Aman"}
                      </span>

                      <h3 title={item.nama}>{item.nama}</h3>

                      <p>
                        <Icon name="location_on" />
                        {item.lokasi}
                      </p>

                      <p>
                        <Icon name="schedule" />
                        {waktuSingkat(item.waktu)}
                      </p>

                      <button
                        className="cb-detail"
                        onClick={() => bukaDetail(item)}
                      >
                        Lihat Detail
                        <Icon name="arrow_forward" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="cb-empty">
                <Icon name="search_off" />
                <h3>Barang tidak ditemukan</h3>
                <p>
                  Coba ubah kata kunci atau pilih filter
                  lainnya.
                </p>
                <button
                  className="cb-button"
                  onClick={reset}
                >
                  Tampilkan Semua Barang
                </button>
              </div>
            )}

            {jumlahHalaman > 1 && (
              <div className="cb-pagination">
                <button
                  disabled={halaman === 1}
                  onClick={() => {
                    setHal(halaman - 1);
                    window.scrollTo(0, 0);
                  }}
                >
                  <Icon name="chevron_left" />
                  Sebelumnya
                </button>

                {Array.from(
                  { length: jumlahHalaman },
                  (_, i) => i + 1
                ).map((i) => (
                  <button
                    key={i}
                    className={
                      i === halaman ? "cb-current" : ""
                    }
                    aria-current={
                      i === halaman ? "page" : undefined
                    }
                    onClick={() => {
                      setHal(i);
                      window.scrollTo(0, 0);
                    }}
                  >
                    {i}
                  </button>
                ))}

                <button
                  disabled={halaman === jumlahHalaman}
                  onClick={() => {
                    setHal(halaman + 1);
                    window.scrollTo(0, 0);
                  }}
                >
                  Selanjutnya
                  <Icon name="chevron_right" />
                </button>
              </div>
            )}
          </section>
        </div>

        <section className="cb-help">
          <span className="cb-help-icon">
            <Icon name="search_off" />
          </span>

          <div>
            <h2>Barang tidak ditemukan?</h2>
            <p>
              Coba ubah kata kunci atau filter. Jika
              barangmu belum ada, buat laporan kehilangan
              agar mudah dicocokkan saat ada temuan baru.
            </p>
          </div>

          <button
            className="cb-button"
            onClick={() => pindah("lapor-hilang")}
          >
            <Icon name="add_circle" />
            Lapor Barang Hilang
          </button>
        </section>
      </main>

      <footer className="cb-footer">
        <div>
          <b>🔎 FindIt</b>
          <span>© 2026 FindIt</span>
          <span className="cb-footer-links">
            <button
              onClick={() => pindah("bantuan-klaim")}
            >
              Bantuan
            </button>
            <button onClick={() => pindah("privasi")}>
              Kebijakan Privasi
            </button>
          </span>
        </div>
      </footer>

      {detail && (
        <div
          className="cb-modal-backdrop"
          onClick={() => setDetail(null)}
        >
          <div
            className="cb-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Detail ${detail.nama}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="cb-modal-close"
              onClick={() => setDetail(null)}
              aria-label="Tutup"
            >
              <Icon name="close" />
            </button>

            <h2>{detail.nama}</h2>

            <div className="cb-modal-photo">
              <img
                src={detail.gambar}
                alt={detail.nama}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <p><b>Kategori:</b> {kelompok(detail)}</p>
            <p><b>Warna:</b> {detail.warna}</p>
            <p><b>Lokasi:</b> {detail.lokasi}</p>
            <p><b>Waktu:</b> {waktuSingkat(detail.waktu)}</p>
            <p><b>Penampungan:</b> {detail.tempat}</p>
            <p><b>Ciri-ciri:</b> {detail.ciri}</p>

            <p className="cb-modal-note">
              Ini data contoh desain. Pengajuan klaim
              terhubung ke laporan yang dibuat di aplikasi,
              bukan ke data contoh ini.
            </p>

            <button
              className="cb-button cb-modal-ok"
              onClick={() => setDetail(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
