
import React, { useState } from "react";
import "./UserDashboard.css";

const reportsData = [
  {
    id: 1,
    name: "Dompet Kulit Cokelat Eiger",
    icon: "wallet",
    date: "15 November 2026",
    location: "Kantin AR Fachruddin",
    status: "Ada Rekomendasi",
    statusIcon: "auto_awesome",
    type: "recommendation",
    description: "Tersedia temuan yang mirip di pos penampungan",
    action: "Lihat Rekomendasi (3)",
  },
  {
    id: 2,
    name: "Kunci Motor Vario Gantungan Merah",
    icon: "key",
    date: "14 November 2026",
    location: "Parkir Siti Walidah",
    status: "Dalam Verifikasi",
    statusIcon: "hourglass_top",
    type: "verification",
    description: "Sedang dicocokkan oleh petugas kampus",
    action: "Detail Laporan",
  },
  {
    id: 3,
    name: "Tumbler Hydro Flask Biru",
    icon: "water_bottle",
    date: "10 November 2026",
    location: "Perpustakaan UMY Lt. 2",
    status: "Dikembalikan",
    statusIcon: "check_circle",
    type: "completed",
    description: "Telah diambil di Pos Satpam Utama",
    action: "Selesai",
  },
  {
    id: 4,
    name: "Jaket Parka Hitam Uniqlo",
    icon: "apparel",
    date: "8 November 2026",
    location: "Selasar AR Fachruddin B",
    status: "Hilang",
    statusIcon: "search",
    type: "missing",
    description: "Belum ada temuan yang cocok",
    action: "Perbarui Info",
  },
];

const foundItems = [
  {
    id: 1,
    name: "Tumbler Hydro Flask 32oz Biru",
    post: "Perpustakaan UMY",
    location: "Perpustakaan Pusat UMY Lt. 2",
    time: "Hari ini, 11:20 WIB",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtd0pG08EQLFwwD7-7cohHSjbvMUPAZckhjXOECLv6NE07IWgJYaQeNXgWtn0IrzoQZmlAJ3b2e6UVFe6rgh4_pwzgRYSskeC6ZLKEIpPPUMksf5ehyvy_7Q2wuNuZEZSfeJZ3Pa90riinCRSv44TzhjGOAQIF0ich7AM3n5bkt7XR6QJbZ4EO_mfmP7A7ef5EF-27GBC71ZlA-hcJmJXqq8C5L_fg9tAFQIcxmzRX",
  },
  {
    id: 2,
    name: "Kunci Motor Honda + Smartkey",
    post: "Pos Gerbang Utama",
    location: "Parkiran Gedung Siti Walidah",
    time: "Hari ini, 09:15 WIB",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOngEgZ4GixoZSCfesqJWtqV6_yuRvm-5wi_j4vXFDghpJXnnL8JEMP_E2fWKatwN-e0MH5MgSxdCiSg_2bNCzWvWosslBofzvRPCpgDdx4oMwECYmU39f7sKOAJc3Y36kz2nAQvBlCxevev1FZph0br4oqL3U6rRuFWQocgkPDwxG7LWWCJ0JqNwNXbbAEUfSoNaq7hFFlamNLX3HBPkJ4imXYS7RMZ3oJABXzkic",
  },
  {
    id: 3,
    name: "iPad Air 5 Space Grey & Pencil",
    post: "Gedung KH Ibrahim",
    location: "Ruang Kuliah E6 Lt. 3",
    time: "Hari ini, 08:00 WIB",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4sM0wJU8QUbg1WAmTB880jk1IlPLf5XwPK92CDfgnK-_CJVp3tskQgR_fzHxQzqUWBieSwI_7wmT6zn_mZvJVCoJrnHzt0EshTkSPtE7pVW8hX5qV1XqgMQ5WHqdBGCT6of6QEDxnaMJeor2_sXE60yBOPsFdl9GTl2reUFmnEiwTDoGKPqV6t8jRrjkBy_iC0EW-z5wz4HiLf7ASb5C-qZjD4gzZQ5pKBzD5fc8t",
  },
  {
    id: 4,
    name: "Dompet Kulit Hitam",
    post: "Kantin Plaza Bintang",
    location: "Kantin Gedung AR Fachruddin A",
    time: "Kemarin, 17:30 WIB",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVTb4utMJLFJTtMiLCBABAiCrV5cydkSf168FA4iEL2KdDYZIJXalhzhaQYfapJadcDJZEzuciIuoQACEEhmQxA0AwRRIGllirGocfvvf7GJdkbZBX99Pog2IsPGpHRNefftkISVjFq5t2oRvIp1jgX6eDsmTzNFdSJnwsfhL7ls-2obTialQXFS8ktz4iqZBHOonCDFPUY6o2XO33Hv0zN-21HG2zYmS7dnsrGHb8",
  },
  {
    id: 5,
    name: "Earbuds Sony WF-1000XM4 Hitam",
    post: "Masjid Ahmad Dahlan",
    location: "Plaza Bintang UMY",
    time: "Kemarin, 14:10 WIB",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIXMWcLfZYAjXVjQ-h6NtLNSJN7xkA3l14yY20kJw8fGMM4SfIMad9KdFr6fo4EYWlvqKTUXX7vFzghVYASFh86fucw6x8JJW8ANROvHe9lwGUPe8JbvSnehpcRBmf3Du1OwLINgLQjEhLR-WlagCURoxC521YjIRqps8GWe1o2yAgADEgjz4TxMum31V0hhl2d1fo4SPChFiR_Kp9XFYnL2Rouq_vl1wOvdqmPRRW",
  },
  {
    id: 6,
    name: "Jaket Hoodie Abu-abu Ukuran L",
    post: "Sportorium UMY",
    location: "Tribun Lapangan Bintang UMY",
    time: "Kemarin, 12:45 WIB",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVr6PseeSHoQBLDKdQnMaAphZBT89jAwQntyp9SZJMbeqyEjTb7C9ZiFb0_FvhnjNMs_pc7Z-nJEEX_wgfUqXEpHtwqpwKFaTczIoN9vjlvHwVQcAN_1nbmI57Mq1V_pxhRwRlNlcdQ9P8ISODu8oRwtpCQwehlJQe2TNCyMavJoI_z599mIE-aDIixBI3dwHSVVVvMIauMGDGx3MrAoO6joew2ujHT52A2qCRKs5N",
  },
];

const quickSearch = [
  "Tumbler",
  "KTM / Kartu Mahasiswa",
  "Kunci Motor",
  "Jaket / Hoodie",
  "Earbuds",
];

function Icon({ name }) {
  return (
    <span className="material-symbols-outlined">
      {name}
    </span>
  );
}

export default function UserDashboard({
  userName = "Dimas Fauzi",
  onLogout,
  onNavigate,
}) {
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [reports, setReports] = useState(reportsData);

  const terms = keyword.toLowerCase().split("/").map(
    (term) => term.trim()
  );

  const filteredItems = foundItems.filter((item) =>
    terms.some((term) =>
      `${item.name} ${item.location} ${item.post}`
        .toLowerCase()
        .includes(term)
    )
  );

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleSearch(e) {
    e.preventDefault();
    setKeyword(search.trim());
    scrollToSection("dashboard-found");
  }

  function handleQuickSearch(value) {
    setSearch(value);
    setKeyword(value);
    scrollToSection("dashboard-found");
  }

  function showAllItems() {
    setSearch("");
    setKeyword("");
    scrollToSection("dashboard-found");
  }

  function openPage(page) {
    if (onNavigate) {
      onNavigate(page);
    } else {
      setModal({
        title: page,
        description: "Halaman ini belum dihubungkan.",
      });
    }
  }

  function handleLogout() {
    if (onLogout) {
      onLogout();
    } else {
      window.location.hash = "login";
    }
  }

  function handleReportAction(report) {
    setModal({
      title: report.name,
      description: report.description,
      location: report.location,
      date: report.date,
      status: report.status,
      report:
        report.type === "missing" ? report : null,
    });
  }

  return (
    <div className="ud-page">
      {/* NAVBAR */}
      <header className="ud-header">
        <div className="ud-nav-container">
          <a
            className="ud-brand"
            href="#dashboard"
            onClick={() => window.scrollTo({
              top: 0,
              behavior: "smooth",
            })}
          >
            <div className="ud-logo">
              <Icon name="search" />
            </div>

            <div>
              <strong>FindIt</strong>
              <small>SISTEM KAMPUS</small>
            </div>
          </a>

          <nav className="ud-navigation">
            <button
              className="ud-nav-active"
              onClick={() => window.scrollTo({
                top: 0,
                behavior: "smooth",
              })}
            >
              Beranda
            </button>

            <button onClick={showAllItems}>
              Cari Barang
            </button>

            <button onClick={() => openPage("Lapor Hilang")}>
              Lapor Hilang
            </button>

            <button
              onClick={() => scrollToSection("dashboard-reports")}
            >
              Laporan Saya
            </button>
          </nav>

          <div className="ud-profile">
            <button
              className="ud-profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
            >
              <span className="ud-profile-name">
                {userName}
              </span>

              <div className="ud-avatar">
                <Icon name="person" />
              </div>

              <Icon name="expand_more" />
            </button>

            {profileOpen && (
              <div className="ud-dropdown">
                <div className="ud-dropdown-info">
                  <small>Mahasiswa Aktif</small>
                  <strong>{userName}</strong>
                </div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    openPage("Profil Saya");
                  }}
                >
                  <Icon name="account_circle" />
                  Profil Saya
                </button>

                <button
                  className="ud-logout"
                  onClick={handleLogout}
                >
                  <Icon name="logout" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="ud-main">
        {/* GREETING */}
        <section className="ud-greeting">
          <div className="ud-greeting-top">
            <div>
              <h1>Halo, {userName}!</h1>
              <p>
                Kehilangan sesuatu? Laporkan atau cari
                di sini secara cepat dan tenang.
              </p>
            </div>

            <div className="ud-hero-actions">
              <button
                className="ud-btn ud-btn-primary"
                onClick={() => openPage("Lapor Hilang")}
              >
                <Icon name="add_circle" />
                Lapor Barang Hilang
              </button>

              <button
                className="ud-btn ud-btn-secondary"
                onClick={() =>
                  document.getElementById("ud-search")?.focus()
                }
              >
                <Icon name="search" />
                Cari Barang
              </button>
            </div>
          </div>

          <form
            className="ud-search"
            onSubmit={handleSearch}
          >
            <Icon name="search" />

            <input
              id="ud-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan ciri: jenis, warna, merek..."
              aria-label="Cari barang"
            />

            <button
              type="submit"
              className="ud-btn ud-btn-primary"
            >
              Cari
              <Icon name="arrow_forward" />
            </button>
          </form>

          <div className="ud-quick-search">
            <span className="ud-quick-label">
              <Icon name="local_fire_department" />
              Pencarian Cepat:
            </span>

            {quickSearch.map((item) => (
              <button
                key={item}
                onClick={() => handleQuickSearch(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* LAPORAN SAYA */}
        <section
          id="dashboard-reports"
          className="ud-section"
        >
          <div className="ud-section-heading">
            <div>
              <h2>Laporan Saya</h2>
              <p>
                Pantau perkembangan pencarian barang
                milikmu secara berkala
              </p>
            </div>

            <button
              className="ud-text-button"
              onClick={() => openPage("Laporan Saya")}
            >
              Lihat Semua Laporan
              <Icon name="arrow_forward" />
            </button>
          </div>

          <div className="ud-report-grid">
            {reports.map((report) => (
              <article
                className="ud-report-card"
                key={report.id}
              >
                <div className="ud-report-top">
                  <div className={`ud-report-icon ${report.type}`}>
                    <Icon name={report.icon} />
                  </div>

                  <div className="ud-report-info">
                    <h3>{report.name}</h3>

                    <div className="ud-report-meta">
                      <span>
                        <Icon name="calendar_today" />
                        {report.date}
                      </span>

                      <span>•</span>

                      <span>
                        <Icon name="location_on" />
                        {report.location}
                      </span>
                    </div>
                  </div>

                  <span className={`ud-status ${report.type}`}>
                    <Icon name={report.statusIcon} />
                    {report.status}
                  </span>
                </div>

                <div className="ud-report-bottom">
                  <p>{report.description}</p>

                  {report.type === "completed" ? (
                    <span className="ud-completed">
                      <Icon name="verified" />
                      Selesai
                    </span>
                  ) : (
                    <button
                      className={`ud-report-action ${report.type}`}
                      onClick={() => handleReportAction(report)}
                    >
                      {report.type === "recommendation" && (
                        <Icon name="visibility" />
                      )}

                      {report.action}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* BARANG TERBARU */}
        <section
          className="ud-section"
          id="dashboard-found"
        >
          <div className="ud-section-heading">
            <div>
              <h2>
                {keyword
                  ? `Hasil Pencarian: ${keyword}`
                  : "Barang Terbaru Ditemukan"}
              </h2>

              <p>
                {keyword
                  ? `${filteredItems.length} barang ditemukan`
                  : "Barang-barang ini baru saja diserahkan ke pos pengamanan dan penampungan kampus"}
              </p>
            </div>

            <button
              className="ud-text-button"
              onClick={showAllItems}
            >
              Lihat Semua Temuan
              <Icon name="arrow_forward" />
            </button>
          </div>

          <div className="ud-item-grid">
            {filteredItems.map((item) => (
              <article
                className="ud-item-card"
                key={item.id}
              >
                <div className="ud-item-image">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <span className="ud-item-post">
                    <Icon name="shield" />
                    {item.post}
                  </span>
                </div>

                <div className="ud-item-content">
                  <h3>{item.name}</h3>

                  <p>
                    <Icon name="location_on" />
                    {item.location}
                  </p>

                  <p>
                    <Icon name="schedule" />
                    {item.time}
                  </p>

                  <button
                    className="ud-detail-button"
                    onClick={() =>
                      setModal({
                        title: item.name,
                        image: item.image,
                        location: item.location,
                        date: item.time,
                        description: `Barang disimpan di ${item.post}.`,
                      })
                    }
                  >
                    Lihat Detail
                    <Icon name="chevron_right" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="ud-empty">
              <Icon name="search_off" />
              <h3>Barang tidak ditemukan</h3>
              <p>Coba gunakan kata kunci lainnya.</p>

              <button
                className="ud-btn ud-btn-primary"
                onClick={showAllItems}
              >
                Tampilkan Semua Barang
              </button>
            </div>
          )}
        </section>

        {/* BANTUAN KLAIM */}
        <section className="ud-help">
          <div className="ud-help-left">
            <div className="ud-help-icon">
              <Icon name="contact_support" />
            </div>

            <div>
              <h3>
                Merasa salah satu barang di atas milikmu?
              </h3>

              <p>
                Siapkan ciri khusus barang untuk
                verifikasi oleh admin.
              </p>
            </div>
          </div>

          <button
            className="ud-btn ud-btn-primary"
            onClick={() =>
              setModal({
                title: "Cara Klaim Barang",
                description:
                  "Pilih barang yang ditemukan, siapkan bukti kepemilikan dan identitas mahasiswa, lalu hubungi petugas pos penampungan untuk proses verifikasi.",
              })
            }
          >
            Pelajari Cara Klaim
            <Icon name="arrow_forward" />
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="ud-footer">
        <div className="ud-footer-container">
          <div className="ud-footer-brand">
            <div className="ud-footer-logo">
              <Icon name="search" />
            </div>

            <strong>FindIt</strong>
            <span>© 2026 FindIt</span>
          </div>

          <div className="ud-footer-links">
            <button onClick={() => openPage("Bantuan")}>
              Bantuan
            </button>

            <button
              onClick={() => openPage("Kebijakan Privasi")}
            >
              Kebijakan Privasi
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL DETAIL */}
      {modal && (
        <div
          className="ud-modal-overlay"
          onClick={() => setModal(null)}
        >
          <div
            className="ud-modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ud-modal-close"
              onClick={() => setModal(null)}
              aria-label="Tutup"
            >
              <Icon name="close" />
            </button>

            {modal.image && (
              <img
                className="ud-modal-image"
                src={modal.image}
                alt={modal.title}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}

            <h2>{modal.title}</h2>

            {modal.location && (
              <p>Lokasi: {modal.location}</p>
            )}

            {modal.date && (
              <p>Waktu: {modal.date}</p>
            )}

            {modal.status && (
              <p>Status: {modal.status}</p>
            )}

            <p>{modal.description}</p>

            {modal.report ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  const data = new FormData(e.currentTarget);

                  setReports((previous) =>
                    previous.map((report) =>
                      report.id === modal.report.id
                        ? {
                            ...report,
                            name: data.get("name"),
                            location: data.get("location"),
                          }
                        : report
                    )
                  );

                  setModal(null);
                }}
              >
                <label>Nama Barang</label>

                <input
                  name="name"
                  defaultValue={modal.report.name}
                  required
                />

                <label>Lokasi Kehilangan</label>

                <input
                  name="location"
                  defaultValue={modal.report.location}
                  required
                />

                <button
                  className="ud-btn ud-btn-primary"
                  type="submit"
                >
                  Simpan Perubahan
                </button>
              </form>
            ) : (
              <button
                className="ud-btn ud-btn-primary"
                onClick={() => setModal(null)}
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
