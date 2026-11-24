import { useMemo, useState } from "react";
import "./UserHome.css";



const quickTerms = ["Tumbler", "KTM", "Kunci Motor", "Jaket", "Earbuds"];

function Icon({ name }) {
  return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>;
}

function formatTanggal(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function statusClass(status) {
  if (status === "Dikembalikan" || status === "Disetujui") return "done";
  if (status === "Dalam Verifikasi" || status === "Menunggu") return "pending";
  if (status === "Hilang") return "missing";
  return "match";
}

function statusText(report, isExample) {
  return isExample ? report.status : report.status === "Hilang" ? "Hilang" : report.status;
}

export default function UserHome({
  userName = "Mahasiswa",
  userEmail = "",
  items = [],
  loading = false,
  error = "",
  onNavigate = () => {},
  onLogout = () => {},
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [exampleModal, setExampleModal] = useState(null);

  const reports = useMemo(() => {
    const own = items.filter((item) => item.pelapor === userEmail);
    return own.slice(0, 4);
  }, [items, userEmail]);

  const isExample = false;

  const foundItems = useMemo(() => {
    const term = activeSearch.trim().toLowerCase();
    return items
      .filter((item) => item.tipe === "DITEMUKAN" && item.status !== "Dikembalikan")
      .filter((item) => !term || [item.nama, item.kategori, item.merek, item.warna, item.lokasi, item.ciri]
        .some((value) => String(value || "").toLowerCase().includes(term)))
      .slice(0, 6);
  }, [items, activeSearch]);

  function searchNow(value) {
    const next = value.trim();
    setSearch(next);
    setActiveSearch(next);
    requestAnimationFrame(() => document.getElementById("uh-temuan")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function reportClick(item) {
    if (isExample) {
      setExampleModal(item);
      return;
    }
    onNavigate("detail", { id: item.id });
  }

  return (
    <div className="uh-page">
      <header className="uh-header">
        <div className="uh-shell uh-navbar">
          <button className="uh-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="uh-brand-icon"><Icon name="search" /></span>
            <span><strong>FindIt</strong><small>SISTEM KAMPUS</small></span>
          </button>

          <nav className="uh-nav" aria-label="Navigasi pengguna">
            <button className="is-active" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Beranda</button>
            <button onClick={() => onNavigate("cari")}>Cari Barang</button>
            <button onClick={() => onNavigate("lapor-hilang")}>Lapor Hilang</button>
            <button onClick={() => onNavigate("laporan-saya")}>Laporan Saya</button>
          </nav>

          <div className="uh-profile">
            <button className="uh-profile-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
              <span className="uh-profile-name">{userName}</span>
              <span className="uh-avatar"><Icon name="person" /></span>
              <Icon name="expand_more" />
            </button>
            {menuOpen && <div className="uh-profile-menu">
              <strong>{userName}</strong>
              <small>{userEmail || "Akun pengguna"}</small>
              <button onClick={() => onNavigate("profil-saya")}><Icon name="account_circle" /> Profil Saya</button>
              <button onClick={onLogout}><Icon name="logout" /> Keluar</button>
            </div>}
          </div>
        </div>
      </header>

      <main className="uh-main uh-shell">
        <section className="uh-hello">
          <div className="uh-hello-top">
            <div><h1>Halo, {userName}!</h1><p>Kehilangan sesuatu? Laporkan atau cari di sini secara cepat dan tenang.</p></div>
            <div className="uh-actions">
              <button className="uh-button uh-primary" onClick={() => onNavigate("lapor-hilang")}><Icon name="add_circle" /> Lapor Barang Hilang</button>
              <button className="uh-button uh-light" onClick={() => onNavigate("cari")}><Icon name="search" /> Cari Barang</button>
            </div>
          </div>
          <form className="uh-search" onSubmit={(e) => { e.preventDefault(); searchNow(search); }}>
            <Icon name="search" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari berdasarkan ciri: jenis, warna, merek..." aria-label="Cari barang" />
            <button className="uh-button uh-primary" type="submit">Cari <Icon name="arrow_forward" /></button>
          </form>
          <div className="uh-chips"><span><Icon name="bolt" /> Pencarian Cepat:</span>{quickTerms.map((t) => <button key={t} onClick={() => searchNow(t)}>{t}</button>)}</div>
        </section>

        <section className="uh-section" id="uh-laporan">
          <div className="uh-section-heading"><div><h2>Laporan Saya</h2><p>Pantau perkembangan pencarian barang milikmu secara berkala.</p></div><button className="uh-link" onClick={() => onNavigate("laporan-saya")}>Lihat Semua Laporan <Icon name="arrow_forward" /></button></div>
          {isExample && <p className="uh-demo-note">Belum ada laporan.</p>}
                    {loading && <p role="status">Memuat data...</p>}
          {error && <p role="alert">{error}</p>}
          {!loading && !error && reports.length === 0 && (
            <div className="uh-empty">
              Kamu belum memiliki laporan kehilangan.
              <button onClick={() => onNavigate("lapor-hilang")}>
                Buat Laporan
              </button>
            </div>
          )}
          <div className="uh-reports">
            {reports.map((item) => <article className="uh-report" key={item.id}>
              <div className="uh-report-top">
                <div className={`uh-report-icon ${statusClass(item.status)}`}><Icon name={item.ikon || (item.kategori === "Kunci" ? "key" : "inventory_2")} /></div>
                <div className="uh-report-body"><h3>{item.nama}</h3><p><Icon name="calendar_today" /> {formatTanggal(item.waktu)} <span>·</span> <Icon name="location_on" /> {item.lokasi}</p></div>
                <span className={`uh-pill ${statusClass(item.status)}`}>{statusText(item, isExample)}</span>
              </div>
              <div className="uh-report-bottom"><span>{item.catatan || `Status laporan: ${item.status}`}</span><button onClick={() => reportClick(item)}>{item.status === "Dikembalikan" ? "Selesai" : "Lihat Laporan"} <Icon name="chevron_right" /></button></div>
            </article>)}
          </div>
        </section>

        <section className="uh-section" id="uh-temuan">
          <div className="uh-section-heading"><div><h2>{activeSearch ? `Hasil Pencarian: ${activeSearch}` : "Barang Terbaru Ditemukan"}</h2><p>Barang yang baru saja dilaporkan ditemukan di lingkungan kampus.</p></div><button className="uh-link" onClick={() => onNavigate("cari")}>Lihat Semua Temuan <Icon name="arrow_forward" /></button></div>
          {foundItems.length === 0 ? <div className="uh-empty">Belum ada barang yang sesuai dengan pencarian. <button onClick={() => searchNow("")}>Tampilkan semua</button></div> : <div className="uh-items">
            {foundItems.map((item) => <article className="uh-item" key={item.id}>
              <div className="uh-item-image"><img src={item.gambar} alt={item.nama} loading="lazy" /><span className="uh-place"><Icon name="shield" /> {item.tempat || "Pos keamanan kampus"}</span></div>
              <div className="uh-item-content"><h3>{item.nama}</h3><p><Icon name="location_on" /> {item.lokasi}</p><p><Icon name="schedule" /> {formatTanggal(item.waktu)}</p><button onClick={() => onNavigate("detail", { id: item.id })}>Lihat Detail <Icon name="chevron_right" /></button></div>
            </article>)}
          </div>}
        </section>

        <section className="uh-help"><div className="uh-help-info"><span className="uh-help-icon"><Icon name="contact_support" /></span><div><h3>Merasa salah satu barang di atas milikmu?</h3><p>Siapkan ciri khusus barang untuk verifikasi oleh admin.</p></div></div><button className="uh-button uh-primary" onClick={() => onNavigate("bantuan-klaim")}>Pelajari Cara Klaim <Icon name="arrow_forward" /></button></section>
      </main>
      <footer className="uh-footer"><div className="uh-shell uh-footer-inner"><span><strong>🔎 FindIt</strong> © 2026 FindIt</span><div><button onClick={() => onNavigate("bantuan")}>Bantuan</button><button onClick={() => onNavigate("privasi")}>Kebijakan Privasi</button></div></div></footer>

      {exampleModal && <div className="uh-modal-backdrop" onClick={() => setExampleModal(null)}><div className="uh-modal" role="dialog" aria-modal="true" aria-label="Contoh laporan" onClick={(e) => e.stopPropagation()}><button className="uh-modal-close" onClick={() => setExampleModal(null)} aria-label="Tutup"><Icon name="close" /></button><h2>{exampleModal.nama}</h2><p>Ini hanya contoh laporan untuk tampilan dashboard, bukan laporan yang benar-benar tersimpan.</p><button className="uh-button uh-primary" onClick={() => { setExampleModal(null); onNavigate("lapor-hilang"); }}>Buat Laporan Baru</button></div></div>}
    </div>
  );
}
