
import { useEffect, useMemo, useState } from "react";
import "./CariBarang.css";

const DEMO = [
  {
    id: "cari-demo-1",
    nama: "Dompet Kulit Cokelat Lipat",
    kategori: "Dompet",
    warna: "Cokelat",
    merek: "Eiger",
    tempat: "Pos Satpam Rektorat",
    lokasi: "Selasar Rektorat UMY",
    waktu: "2026-11-12T10:15",
    ciri: "Dompet kulit lipat warna cokelat",
    gambar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-3VS08ekhaDdxGrVuAukpNbd8_uzpskhpRxj55p-mc3JLU2lszydl_FcVd_LGpIk-1YJIylwRYLiGoLNCATaep8zUCUBYPQeEmn6qsDklgttBw1tHWrEYtKGm41te51JfRWaPpSuNcjO8nR3bXpeOBNoUjmdE7bYdTgqjCrNCg5JsgfxwsCDyvVE0mbsLI-aYtyMA0F-lOXcHpuIzbK-lwtEkcGp-O7CqolEtIde8",
    status: "Ditemukan",
    contoh: true,
  },
  {
    id: "cari-demo-2",
    nama: "Tumbler Stainless Biru Steel",
    kategori: "Botol Minum",
    warna: "Biru",
    merek: "",
    tempat: "Pos Perpustakaan",
    lokasi: "Perpustakaan UMY Lt. 2",
    waktu: "2026-11-12T09:30",
    ciri: "Tumbler stainless biru steel",
    gambar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9ETyQcpYc_jCv3Cvl8mbKN1PoXVaosrpvbg11DXIwbFwJcvpm8JSNguEnsjosrAYmsdGd1NcCqGxexw9HZZJE1ro2HMYRMk8PCqvjmr8kkaXSR8AXRuf1SIpfBm8bIQqfX-vhmpWRHgfB-CCM2YecXINqGbqUsbSxDPsbDyC1WyJ4ocNTa-ZRq9rqnTwArZBo8lTxNNOUtqXrBL9EVyzP--D1V1D5P6Yll3QyLG6d",
    status: "Ditemukan",
    contoh: true,
  },
  {
    id: "cari-demo-3",
    nama: "Kunci Motor Tali Merah",
    kategori: "Kunci",
    warna: "Merah",
    merek: "",
    tempat: "Pos Satpam Utama",
    lokasi: "Parkir Gerbang Utama UMY",
    waktu: "2026-11-11T16:45",
    ciri: "Kunci motor dengan tali merah",
    gambar: "https://lh3.googleusercontent.com/aida-public/AB6AXuARsGjgXzdNGjPBc3tx61528UNJNFkq5HVDbQCl5jql7QMzPiYzf8x6sxdAhKJiFFgylQKgLRlY0O_tnxe19IVWJLwjVEesvFta61r2pltQVxhjZY9SUd07mJzJO5TGE30ChjuNENIkJn2DsHJtSwfnG5TV3ygPbXtfdizHaBYz9tkwmze4skF4dWxA5ljM95FTcSMwjbNARkfTRFOd4aSb9ClXHstQ2h5jqJ_anckG",
    status: "Ditemukan",
    contoh: true,
  },
  {
    id: "cari-demo-4",
    nama: "Jaket Parasut Hitam Polos",
    kategori: "Pakaian",
    warna: "Hitam",
    merek: "",
    tempat: "Pos Pengamanan Masjid",
    lokasi: "Masjid KH Ahmad Dahlan",
    waktu: "2026-11-11T13:10",
    ciri: "Jaket parasut hitam polos",
    gambar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqeq03MkrwWPmOWN4wAn92Fig3CeQjOXNLXAfLyh9OnumR9QW4YB2R6dpoWy4GlqQlQuPJIKuz94pzlXINGdnd2od4HZsULk-2VD47tuvy1vbByhhiT3ZnJZqz_uHxV85Lz04gUfPPIrk7uE-_SPmvBQUJNo9xEosczCD4gTLO0cr2ZTh_Z8cj5VLGBxyzVwdeM9k6ZeFhYKJ-WfqqTPnHr5y3pnUzRxs7pAhpc3n",
    status: "Ditemukan",
    contoh: true,
  },
  {
    id: "cari-demo-5",
    nama: "Case Wireless Earbuds Putih",
    kategori: "Aksesori",
    warna: "Putih",
    merek: "",
    tempat: "Pos Kantin Pusat",
    lokasi: "Kantin Pusat (AR Fachruddin)",
    waktu: "2026-11-11T12:00",
    ciri: "Case wireless earbuds putih",
    gambar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9IvYwWQlzB_DAzr8H6m-8pGqfvvKuCdFUqM1np74xBZul_L4v-0dMI7OYX8bjxN3K_adMIs4bMcMYUyt2Tklg1EQ8EalAp38vwb6On-yk5pcCs3aKsnNrZnL5gedO6SlYYlo13BIZWwZIVlz9Sqllgdybh9PJGwlJF-a9MUNhapIY2pLQVgurHktz9t1qkzg2u41_64BxE56jpqPGOK_3a80jt8xIkl2DkX_F_4wJ",
    status: "Ditemukan",
    contoh: true,
  },
  {
    id: "cari-demo-6",
    nama: "Tas Ransel Laptop Abu-abu",
    kategori: "Tas",
    warna: "Abu-abu",
    merek: "",
    tempat: "Pos Sportorium",
    lokasi: "Sportorium UMY",
    waktu: "2026-11-10T17:20",
    ciri: "Tas ransel laptop abu-abu",
    gambar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZxQoHjnCWrM21Q8Fi8OGeHT3ldjmNp2XN3gODOsVkE0C1k719SM7nv2Pm9G-d5W76fiX5-62XoBWAH2LTlazDspt7RwupAt93We2XWFWNeQFnWWMkeIEDbMe1aBZqUEGQ9xvFYp8vclSHAUdzO-0S9wQonF6reC3obKb-FynWYvLcW4FJb62H4-ZtebIZ7f1g85kAzGCWdPuTd1CS5CkFJ_5xOiP7nh8epXsXDmso",
    status: "Ditemukan",
    contoh: true,
  },
  {
    id: "cari-demo-7",
    nama: "Kacamata Minus Frame Hitam",
    kategori: "Aksesori",
    warna: "Hitam",
    merek: "",
    tempat: "Pos Gedung E6",
    lokasi: "Gedung KH Ibrahim (E6)",
    waktu: "2026-11-10T11:40",
    ciri: "Kacamata minus frame hitam",
    gambar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlo9SwVhR-e4e6g7q3S1-UlJDmmpHpKR0txzyJC7JNayd5T3vryoxECUJg35c_lHYqMAAysSsmMZH8md7hkjTn2tZFg-BuvEB9HfUS9jafourcv1TQ11nKmOuUH3IFzFTHUCifY_7IoEesTcjIuH-wigMpIab7K1hXnO_tDmHu1YzKyvf5pGE4iio4QPisJnqTO9crM0MFBsd_PQg2CbWPqrJBQ1XJG7sN9H6OJAWr",
    status: "Ditemukan",
    contoh: true,
  },
  {
    id: "cari-demo-8",
    nama: "Payung Lipat Biru Navy",
    kategori: "Lainnya",
    warna: "Biru Navy",
    merek: "",
    tempat: "Pos Gedung Siti Walidah",
    lokasi: "Gedung Siti Walidah Lt. 1",
    waktu: "2026-11-09T15:50",
    ciri: "Payung lipat warna navy",
    gambar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBscoPZbrUJ9a5-iT4uTctgpJH5XME7FsxQC35awYlqRSIk8BmA9AEqwGAYztRUsQblciHcloNO9AyWD6SLAIPPWLoIo1sS3DzAJXnuDIT_704bXQlv2zJVKoMWNBVLsB6cmw1IAkOtWZpw65pPhKgradQ1niWUQKdWdhLOtzRtbGZvq6w7nu9Rd1WX5Gxuga7ZbOKh8_mucJKPmFnqic9wWq6D4lL08tH9m-jsr4nV",
    status: "Ditemukan",
    contoh: true,
  },
  {
    id: "cari-demo-9",
    nama: "Helm Half-Face Putih Polos",
    kategori: "Aksesori",
    warna: "Putih",
    merek: "",
    tempat: "Pos Satpam Utama",
    lokasi: "Parkir Gerbang Utama UMY",
    waktu: "2026-11-09T08:15",
    ciri: "Helm half-face putih polos",
    gambar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCppao7xS2Amo_u7kDQ-Ss9E8Ek5f0Yz6hNL2yq_fZ7NGFWtFKyfEC6Jk7x1VTBJko6UQ-xnMlE5PPpVr3B-lF5lcR3qn3InjS5XdoQN3afEOXWNvSiDYD2swmnxEzgcQu9zvET3cajl8tr8QH78b5mnA54PxCYV_KmBLXKBi-eOVq1WmFHbWHAYfeRsCfsjbS-jgpKmV3ZLbv2OeYm8qa2sz55BRJdVM-oMkPia1b",
    status: "Ditemukan",
    contoh: true,
  },
];

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

    return [...DEMO, ...baru];
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
                <small>(data demo)</small>
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

            {tampil.length ? (
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
