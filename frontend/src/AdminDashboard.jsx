import DataPengguna from "./DataPengguna.jsx";
import DataBarang from "./DataBarang.jsx";
import InputBarangTemuan from "./InputBarangTemuan.jsx";
import VerifikasiLaporan from "./VerifikasiLaporan.jsx";

import { useMemo, useState } from "react";
import "./AdminDashboard.css";

const MENU = [
  {
    id: "dashboard",
    icon: "grid_view",
    label: "Dashboard",
  },
  {
    id: "verifikasi",
    icon: "verified",
    label: "Verifikasi Laporan",
  },
  {
    id: "input",
    icon: "add_circle",
    label: "Input Barang Temuan",
  },
  {
    id: "barang",
    icon: "inventory_2",
    label: "Data Barang",
  },
  {
    id: "pengguna",
    icon: "group",
    label: "Data Pengguna",
  },
];

function Icon({ name, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatId(item) {
  if (item.kodeLaporan) {
    return item.kodeLaporan;
  }

  const date = new Date(
    item.tanggalLaporan ||
      item.waktu ||
      Date.now()
  );

  const periode = Number.isNaN(date.getTime())
    ? "000000"
    : `${date.getFullYear()}${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

  const kode = String(item.id || "0000")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-4)
    .toUpperCase();

  return `#LPR-${periode}-${kode}`;
}

function namaPelapor(item) {
  if (item.namaPelapor) {
    return item.namaPelapor;
  }

  if (item.pelapor === "demo@findit.test") {
    return "Dimas Fauzi";
  }

  if (item.pelapor === "admin@findit.test") {
    return "Admin FindIt";
  }

  return (
    item.pelapor?.split("@")[0] ||
    "Pengguna"
  );
}

function perluVerifikasi(item) {
  if (item.statusVerifikasi === "Ditolak") {
    return false;
  }

  if (item.statusVerifikasi === "Terverifikasi") {
    return false;
  }

  return (
    item.statusVerifikasi ===
      "Menunggu Verifikasi" ||
    item.status === "Menunggu Verifikasi" ||
    (
      item.tipe === "HILANG" &&
      item.status === "Hilang" &&
      !item.statusVerifikasi
    )
  );
}

function FotoBarang({ item }) {
  const [error, setError] = useState(false);

  const kategori = String(
    item.kategori || ""
  ).toLowerCase();

  let icon = "inventory_2";

  if (kategori.includes("elektronik")) {
    icon = "headphones";
  } else if (kategori.includes("dompet")) {
    icon = "wallet";
  } else if (kategori.includes("kunci")) {
    icon = "key";
  } else if (kategori.includes("tas")) {
    icon = "backpack";
  } else if (kategori.includes("minum")) {
    icon = "water_bottle";
  }

  return (
    <div className="ad-item-photo">
      {item.gambar && !error ? (
        <img
          src={item.gambar}
          alt={item.nama}
          onError={() => setError(true)}
        />
      ) : (
        <Icon name={icon} />
      )}
    </div>
  );
}

// ==========================================
// KARTU STATISTIK
// ==========================================

function StatCard({
  title,
  value,
  description,
  icon,
  color,
}) {
  return (
    <article className={`ad-stat-card ad-${color}`}>
      <span className="ad-stat-label">
        {title}
      </span>

      <div className="ad-stat-middle">
        <strong>{value}</strong>

        <div className="ad-stat-icon">
          <Icon name={icon} />
        </div>
      </div>

      <span className="ad-stat-description">
        {description}
      </span>
    </article>
  );
}

// ==========================================
// GRAFIK LAPORAN MINGGUAN
// ==========================================

function WeeklyChart({ barang }) {
  const hari = [
    "Sen",
    "Sel",
    "Rab",
    "Kam",
    "Jum",
    "Sab",
    "Min",
  ];

  const data = useMemo(() => {
    const hilang = Array(7).fill(0);
    const ditemukan = Array(7).fill(0);

    const mulai = new Date();

    mulai.setHours(0, 0, 0, 0);

    const offset = (mulai.getDay() + 6) % 7;

    mulai.setDate(mulai.getDate() - offset);

    const akhir = new Date(mulai);
    akhir.setDate(akhir.getDate() + 7);

    barang.forEach((item) => {
      const tanggal = new Date(
        item.tanggalLaporan ||
          item.waktu ||
          ""
      );

      if (
        Number.isNaN(tanggal.getTime()) ||
        tanggal < mulai ||
        tanggal >= akhir
      ) {
        return;
      }

      const index = (tanggal.getDay() + 6) % 7;

      if (item.tipe === "HILANG") {
        hilang[index] += 1;
      }

      if (item.tipe === "DITEMUKAN") {
        ditemukan[index] += 1;
      }
    });

    return { hilang, ditemukan };
  }, [barang]);

  const max = Math.max(
    1,
    ...data.hilang,
    ...data.ditemukan
  );

  const titik = (values) =>
    values.map((value, index) => ({
      x: 50 + index * 100,
      y: 190 - (value / max) * 155,
      value,
    }));

  const titikHilang = titik(data.hilang);
  const titikTemuan = titik(data.ditemukan);

  const garisHilang = titikHilang
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const garisTemuan = titikTemuan
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <section className="ad-panel ad-chart-panel">
      <div className="ad-panel-heading">
        <div>
          <h2>Laporan Masuk per Minggu</h2>

          <p>
            Statistik tren mingguan barang
            hilang dan barang ditemukan.
          </p>
        </div>

        <div className="ad-chart-legend">
          <span>
            <i className="ad-dot ad-dot-red" />
            Barang Hilang
          </span>

          <span>
            <i className="ad-dot ad-dot-blue" />
            Barang Ditemukan
          </span>
        </div>
      </div>

      <div className="ad-chart">
        <svg
          viewBox="0 0 700 210"
          preserveAspectRatio="none"
          role="img"
          aria-label="Grafik laporan minggu ini"
        >
          <defs>
            <linearGradient
              id="ad-gradient-red"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#ba1a1a"
                stopOpacity="0.15"
              />

              <stop
                offset="100%"
                stopColor="#ba1a1a"
                stopOpacity="0"
              />
            </linearGradient>

            <linearGradient
              id="ad-gradient-blue"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#2f64b0"
                stopOpacity="0.15"
              />

              <stop
                offset="100%"
                stopColor="#2f64b0"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {[30, 85, 140, 190].map((y) => (
            <line
              key={y}
              x1="0"
              x2="700"
              y1={y}
              y2={y}
              stroke="#e6e9ef"
              strokeDasharray="4 4"
            />
          ))}

          <polygon
            points={`${garisHilang} 650,190 50,190`}
            fill="url(#ad-gradient-red)"
          />

          <polygon
            points={`${garisTemuan} 650,190 50,190`}
            fill="url(#ad-gradient-blue)"
          />

          <polyline
            points={garisHilang}
            fill="none"
            stroke="#ba1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polyline
            points={garisTemuan}
            fill="none"
            stroke="#2f64b0"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {titikHilang.map((p, i) => (
            <circle
              key={`hilang-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#ba1a1a"
              stroke="white"
              strokeWidth="2"
            >
              <title>
                {hari[i]}: {p.value} laporan hilang
              </title>
            </circle>
          ))}

          {titikTemuan.map((p, i) => (
            <circle
              key={`temuan-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#2f64b0"
              stroke="white"
              strokeWidth="2"
            >
              <title>
                {hari[i]}: {p.value} laporan temuan
              </title>
            </circle>
          ))}
        </svg>

        <div className="ad-chart-days">
          {hari.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      {!data.hilang.some(Boolean) &&
        !data.ditemukan.some(Boolean) && (
          <p className="ad-chart-empty">
            Belum ada laporan masuk minggu ini.
          </p>
        )}
    </section>
  );
}

// ==========================================
// TABEL LAPORAN
// ==========================================

function ReportTable({
  items,
  onReview,
  isVerification = false,
}) {
  return (
    <div className="ad-table-scroll">
      <table className="ad-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nama Barang</th>
            <th>Pelapor</th>
            <th>Tipe</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th className="ad-align-right">
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="ad-empty">
                  <Icon
                    name={
                      isVerification
                        ? "task_alt"
                        : "inventory_2"
                    }
                  />

                  <h3>
                    {isVerification
                      ? "Tidak ada laporan yang perlu diverifikasi"
                      : "Belum ada data barang"}
                  </h3>

                  <p>
                    Data laporan akan muncul
                    di halaman ini.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>
                  <FotoBarang item={item} />
                </td>

                <td>
                  <div className="ad-item-name">
                    {item.nama}
                  </div>

                  <span className="ad-report-id">
                    {formatId(item)}
                  </span>
                </td>

                <td>
                  <div className="ad-reporter">
                    {namaPelapor(item)}
                  </div>

                  <small className="ad-muted">
                    {item.lokasi || "-"}
                  </small>
                </td>

                <td>
                  <span
                    className={`ad-type ${
                      item.tipe === "HILANG"
                        ? "ad-type-lost"
                        : "ad-type-found"
                    }`}
                  >
                    {item.tipe === "HILANG"
                      ? "Hilang"
                      : "Ditemukan"}
                  </span>
                </td>

                <td className="ad-date">
                  {formatTanggal(
                    item.tanggalLaporan ||
                      item.waktu
                  )}
                </td>

                <td>
                  <span className="ad-status">
                    <i />

                    {perluVerifikasi(item)
                      ? "Menunggu Verifikasi"
                      : item.statusVerifikasi ||
                        item.status ||
                        "-"}
                  </span>
                </td>

                <td className="ad-align-right">
                  <button
                    type="button"
                    className="ad-review-button"
                    onClick={() => onReview(item)}
                  >
                    {perluVerifikasi(item)
                      ? "Tinjau"
                      : "Detail"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// MODAL TINJAU LAPORAN
// ==========================================

function ReviewModal({
  item,
  onClose,
  onVerify,
  onDetail,
}) {
  if (!item) return null;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(approved) {
    setError("");

    if (!onVerify) {
      setError(
        "Fungsi verifikasi belum dihubungkan."
      );
      return;
    }

    setLoading(true);

    try {
      await onVerify(item.id, approved);
      onClose();
    } catch (err) {
      setError(
        err.message || "Verifikasi gagal."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="ad-modal-overlay"
      onClick={onClose}
    >
      <section
        className="ad-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Tinjau laporan"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ad-modal-heading">
          <div>
            <h2>Tinjau Laporan</h2>
            <p>{formatId(item)}</p>
          </div>

          <button
            type="button"
            className="ad-close-button"
            onClick={onClose}
            aria-label="Tutup"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="ad-modal-item">
          <FotoBarang item={item} />

          <div>
            <h3>{item.nama}</h3>
            <p>{item.kategori || "-"}</p>
          </div>
        </div>

        <div className="ad-modal-details">
          {[
            ["Nama Pelapor", namaPelapor(item)],
            ["Email", item.pelapor || "-"],
            ["Jenis Laporan", item.tipe],
            ["Warna", item.warna || "-"],
            ["Merek", item.merek || "-"],
            ["Lokasi", item.lokasi || "-"],
            [
              "Tanggal",
              formatTanggal(
                item.tanggalLaporan ||
                  item.waktu
              ),
            ],
            ["Ciri Khusus", item.ciri || "-"],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        {error && (
          <p className="ad-error-message">
            {error}
          </p>
        )}

        <div className="ad-modal-actions">
          <button
            type="button"
            className="ad-outline-button"
            onClick={() => onDetail(item)}
          >
            Lihat Detail
          </button>

          {perluVerifikasi(item) && (
            <>
              <button
                type="button"
                className="ad-danger-button"
                disabled={loading}
                onClick={() =>
                  handleVerify(false)
                }
              >
                Tolak
              </button>

              <button
                type="button"
                className="ad-primary-button"
                disabled={loading}
                onClick={() =>
                  handleVerify(true)
                }
              >
                <Icon name="check_circle" />

                {loading
                  ? "Memproses..."
                  : "Verifikasi"}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// ==========================================
// KOMPONEN UTAMA ADMIN DASHBOARD
// ==========================================

export default function AdminDashboard({
  user = null,
  pengguna = null,
  barang = [],
  klaim = [],
  onNavigate = () => {},
  onLogout = () => {},
  onVerifyReport,
  onVerifyClaim,
  onUpdateItem,
  onDeleteItem,
  onSaveFound,
}) {
  const admin = user || pengguna;

  const [activeMenu, setActiveMenu] =
    useState("dashboard");

  const [search, setSearch] = useState("");

  const [selected, setSelected] =
    useState(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const laporanPending = useMemo(
    () =>
      barang
        .filter(perluVerifikasi)
        .sort(
          (a, b) =>
            new Date(
              b.tanggalLaporan || b.waktu || 0
            ) -
            new Date(
              a.tanggalLaporan || a.waktu || 0
            )
        ),
    [barang]
  );

  const klaimPending = klaim.filter(
    (item) => item.status === "Menunggu"
  );

  const totalTemuan = barang.filter(
    (item) =>
      item.tipe === "DITEMUKAN" &&
      [
        "Ditemukan",
        "Dalam Verifikasi",
      ].includes(item.status)
  ).length;

  const totalKembali = barang.filter(
    (item) =>
      item.tipe === "DITEMUKAN" &&
      item.status === "Dikembalikan"
  ).length;

  const dataPengguna = useMemo(() => {
    const map = new Map();

    barang.forEach((item) => {
      if (!item.pelapor) return;

      const email = item.pelapor;

      if (!map.has(email)) {
        map.set(email, {
          nama: namaPelapor(item),
          email,
          jumlah: 0,
        });
      }

      map.get(email).jumlah += 1;
    });

    return Array.from(map.values());
  }, [barang]);

  const hasilPencarian = barang.filter(
    (item) =>
      [
        item.nama,
        item.kategori,
        item.lokasi,
        item.pelapor,
        formatId(item),
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  function pindahMenu(menu) {
    setSidebarOpen(false);
    setSearch("");

    

    setActiveMenu(menu);
  }

  function lihatDetail(item) {
    setSelected(null);
    onNavigate(`detail/${item.id}`);
  }

  const headings = {
    dashboard: {
      title: "Dashboard Admin",
      subtitle:
        "Ringkasan laporan dan barang temuan.",
    },
    verifikasi: {
      title: "Verifikasi Laporan",
      subtitle:
        "Tinjau laporan dan pengajuan klaim pengguna.",
    },
    barang: {
      title: "Data Barang",
      subtitle:
        "Kelola seluruh laporan barang hilang dan ditemukan.",
    },
    pengguna: {
      title: "Data Pengguna",
      subtitle:
        "Daftar pengguna yang telah membuat laporan.",
    },
  };

  if (admin?.role !== "admin") {
    return (
      <div className="ad-access-denied">
        <Icon name="lock" />
        <h2>Akses Admin Diperlukan</h2>

        <p>
          Silakan masuk menggunakan akun admin.
        </p>

        <button
          className="ad-primary-button"
          onClick={() => onNavigate("masuk")}
        >
          Masuk
        </button>
      </div>
    );
  }

  return (
    <div className="ad-shell">
  <style>{`
    /* FINDIT_HIDE_ADMIN_TOP_NAV */

    body:has(.ad-shell) header.site-header,
    body:has(.ad-shell) header.findit-main-header,
    body:has(.ad-shell) footer.site-footer {
      display: none !important;
    }

    /* Hindari judul ganda di halaman Verifikasi Laporan */
    .ad-shell:has(.vl-page) .ad-header {
      display: none !important;
    }

    body:has(.ad-shell) {
      margin: 0 !important;
      padding: 0 !important;
    }
  `}</style>

      {/* SIDEBAR */}

      {sidebarOpen && (
        <div
          className="ad-mobile-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`ad-sidebar ${
          sidebarOpen ? "ad-sidebar-open" : ""
        }`}
      >
        <div>
          <div className="ad-brand">
            <div className="ad-brand-icon">
              <Icon name="search" />
            </div>

            <strong>FindIt</strong>

            <span className="ad-admin-badge">
              ADMIN
            </span>
          </div>

          <nav className="ad-navigation">
            {MENU.map((menu) => (
              <button
                key={menu.id}
                type="button"
                className={`ad-menu-item ${
                  activeMenu === menu.id
                    ? "ad-menu-active"
                    : ""
                }`}
                onClick={() =>
                  pindahMenu(menu.id)
                }
              >
                <Icon name={menu.icon} />

                <span>{menu.label}</span>

                {menu.id === "verifikasi" && (
                  <small className="ad-menu-count">
                    {laporanPending.length +
                      klaimPending.length}
                  </small>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="ad-profile-card">
          <div className="ad-avatar">
            <Icon name="person" />
          </div>

          <div className="ad-profile-text">
            <strong>
              {admin?.nama || "Admin FindIt"}
            </strong>

            <span>Petugas Pengelola</span>
          </div>

          <button
            type="button"
            className="ad-logout-button"
            title="Keluar"
            aria-label="Keluar"
            onClick={onLogout}
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}

      <main className="ad-main">
        <div className="ad-content">

          {/* HEADER */}

          <header className="ad-header">
            <div className="ad-header-title">
              <button
                type="button"
                className="ad-mobile-toggle"
                onClick={() =>
                  setSidebarOpen(true)
                }
                aria-label="Buka menu"
              >
                <Icon name="menu" />
              </button>

              <div>
                <h1>
                  {headings[activeMenu]?.title}
                </h1>

                <p>
                  {
                    headings[activeMenu]
                      ?.subtitle
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              className="ad-primary-button"
              onClick={() =>
                pindahMenu("input")
              }
            >
              <Icon name="add" />
              Input Barang Temuan
            </button>
          </header>

          {/* DASHBOARD */}

          {activeMenu === "dashboard" && (
            <>
              <div className="ad-stats-grid">
                <StatCard
                  title="Total Laporan"
                  value={barang.length}
                  description="Seluruh laporan masuk"
                  icon="description"
                  color="neutral"
                />

                <StatCard
                  title="Menunggu Verifikasi"
                  value={laporanPending.length}
                  description="Perlu tinjauan petugas"
                  icon="pending_actions"
                  color="red"
                />

                <StatCard
                  title="Barang Ditemukan"
                  value={totalTemuan}
                  description="Tersimpan di pos keamanan"
                  icon="inventory_2"
                  color="blue"
                />

                <StatCard
                  title="Dikembalikan"
                  value={totalKembali}
                  description="Berhasil diambil pemilik"
                  icon="task_alt"
                  color="green"
                />
              </div>

              <WeeklyChart barang={barang} />

              <section className="ad-panel">
                <div className="ad-panel-heading">
                  <div>
                    <h2>Perlu Diverifikasi</h2>

                    <p>
                      Daftar laporan terbaru
                      yang menunggu verifikasi
                      petugas.
                    </p>
                  </div>

                  <button
                    className="ad-text-button"
                    type="button"
                    onClick={() =>
                      pindahMenu("verifikasi")
                    }
                  >
                    Lihat Semua
                  </button>
                </div>

                <ReportTable
                  items={laporanPending.slice(0, 5)}
                  onReview={setSelected}
                  isVerification
                />
              </section>
            </>
          )}

                    {/* VERIFIKASI LAPORAN */}

          {activeMenu === "verifikasi" && (
            <>
              <VerifikasiLaporan
                barang={barang}
                onNavigate={onNavigate}
                onVerifyReport={onVerifyReport}
                onDashboard={() => setActiveMenu("dashboard")}
              />

              <section className="ad-panel" style={{ marginTop: 24 }}>
                <div className="ad-panel-heading">
                  <div>
                    <h2>
                      Pengajuan Klaim ({
                        klaim.filter((item) => item.status === "Menunggu").length
                      })
                    </h2>
                    <p>
                      Periksa bukti kepemilikan sebelum menyetujui klaim.
                    </p>
                  </div>
                </div>

                {klaim.filter((item) => item.status === "Menunggu").length === 0 ? (
                  <div className="ad-empty">
                    <h3>Belum ada klaim menunggu</h3>
                    <p>Pengajuan klaim akan muncul di sini.</p>
                  </div>
                ) : (
                  klaim
                    .filter((item) => item.status === "Menunggu")
                    .map((claim) => (
                      <div className="ad-claim-row" key={claim.id}>
                        <div>
                          <h3>
                            {barang.find((b) => b.id === claim.barangId)?.nama ||
                              "Barang"}
                          </h3>
                          <p>Pengaju: {claim.email}</p>
                          <p>Bukti: {claim.bukti}</p>
                        </div>

                        <div className="ad-claim-actions">
                          <button
                            type="button"
                            className="ad-danger-button"
                            onClick={() => onVerifyClaim?.(claim.id, false)}
                          >
                            Tolak
                          </button>
                          <button
                            type="button"
                            className="ad-primary-button"
                            onClick={() => onVerifyClaim?.(claim.id, true)}
                          >
                            Setujui
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </section>
            </>
          )}
{/* INPUT BARANG TEMUAN */}

{activeMenu === "input" && (
  <InputBarangTemuan
    user={admin}
    onSave={onSaveFound}
    onDashboard={() => pindahMenu("dashboard")}
    onDataBarang={() => pindahMenu("barang")}
  />
)}

{/* DATA BARANG */}

{activeMenu === "barang" && (
  <DataBarang
    barang={barang}
    klaim={klaim}
    onInputBarang={() => pindahMenu("input")}
    onDetail={(item) => onNavigate(`detail/${item.id}`)}
    onUpdateItem={onUpdateItem}
    onDeleteItem={onDeleteItem}
  />
)}
          {/* DATA PENGGUNA */}

          {activeMenu === "pengguna" && (
            <DataPengguna
              barang={barang}
              admin={admin}
              onDashboard={() => pindahMenu("dashboard")}
            />
          )}
        </div>
      </main>

      {/* MODAL */}

      {selected && (
        <ReviewModal
          key={selected.id}
          item={selected}
          onClose={() => setSelected(null)}
          onVerify={onVerifyReport}
          onDetail={lihatDetail}
        />
      )}
    </div>
  );
}








