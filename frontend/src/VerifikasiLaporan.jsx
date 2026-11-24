
import React, { useState, useMemo } from "react";
import "./VerifikasiLaporan.css";

const FILTERS = [
  "Semua",
  "Menunggu Verifikasi",
  "Disetujui",
  "Ditolak",
  "Dikembalikan",
];

const PAGE_SIZE = 6;

function Icon({ name, size = 20 }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}

function getStatus(item) {
  const status = String(item.status || "").toLowerCase();
  const verifikasi = String(
    item.statusVerifikasi || ""
  ).toLowerCase();

  if (status.includes("dikembalikan")) {
    return "Dikembalikan";
  }

  if (
    status.includes("ditolak") ||
    verifikasi.includes("ditolak")
  ) {
    return "Ditolak";
  }

  if (
    verifikasi === "terverifikasi" ||
    verifikasi === "disetujui" ||
    status === "disetujui"
  ) {
    return "Disetujui";
  }

  return "Menunggu Verifikasi";
}

function getDate(item) {
  return (
    item.tanggalKehilangan ||
    item.tanggal ||
    item.waktu ||
    item.createdAt ||
    ""
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getReportId(item) {
  return (
    item.kodeLaporan ||
    item.nomorLaporan ||
    `LPR-${String(item.id || "").slice(0, 8).toUpperCase()}`
  );
}

function getReporter(item) {
  return (
    item.namaPelapor ||
    item.pelapor?.nama ||
    item.pelapor?.email ||
    item.pelapor ||
    "Tidak diketahui"
  );
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getMatches(item, barang) {
  const kategori = normalize(item.kategori);
  const warna = normalize(item.warna);
  const merek = normalize(item.merek);
  const lokasi = normalize(item.lokasi);

  return barang.filter((candidate) => {
    if (
      String(candidate.id) === String(item.id) ||
      normalize(candidate.tipe) !== "ditemukan" ||
      normalize(candidate.status) === "dikembalikan" ||
      getStatus(candidate) === "Ditolak"
    ) {
      return false;
    }

    let score = 0;

    if (
      kategori &&
      kategori === normalize(candidate.kategori)
    ) {
      score += 35;
    }

    if (warna && warna === normalize(candidate.warna)) {
      score += 20;
    }

    if (merek && merek === normalize(candidate.merek)) {
      score += 25;
    }

    if (lokasi && lokasi === normalize(candidate.lokasi)) {
      score += 20;
    }

    return score >= 55;
  });
}

function StatusBadge({ status }) {
  const styles = {
    "Menunggu Verifikasi": "pending",
    Disetujui: "approved",
    Ditolak: "rejected",
    Dikembalikan: "returned",
  };

  const icons = {
    "Menunggu Verifikasi": "schedule",
    Disetujui: "check_circle",
    Ditolak: "cancel",
    Dikembalikan: "task_alt",
  };

  return (
    <span className={`vl-status ${styles[status] || ""}`}>
      <Icon name={icons[status] || "info"} size={14} />
      {status}
    </span>
  );
}

function FotoBarang({ item }) {
  const [error, setError] = useState(false);

  const foto =
    item.gambar ||
    item.foto ||
    item.image ||
    item.imageUrl;

  return (
    <div className="vl-photo">
      {foto && !error ? (
        <img
          src={foto}
          alt={item.nama || "Foto barang"}
          onError={() => setError(true)}
        />
      ) : (
        <Icon name="inventory_2" size={24} />
      )}
    </div>
  );
}

export default function VerifikasiLaporan({
  barang = [],
  onNavigate = () => {},
  onVerifyReport,
  onReturnReport,
  onDashboard,
}) {
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("terbaru");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const reports = useMemo(() => {
    return barang.filter(
      (item) => normalize(item.tipe) === "hilang"
    );
  }, [barang]);

  const counts = useMemo(() => {
    return {
      Semua: reports.length,
      "Menunggu Verifikasi": reports.filter(
        (item) => getStatus(item) === "Menunggu Verifikasi"
      ).length,
      Disetujui: reports.filter(
        (item) => getStatus(item) === "Disetujui"
      ).length,
      Ditolak: reports.filter(
        (item) => getStatus(item) === "Ditolak"
      ).length,
      Dikembalikan: reports.filter(
        (item) => getStatus(item) === "Dikembalikan"
      ).length,
    };
  }, [reports]);

  const filtered = useMemo(() => {
    const keyword = normalize(search);

    return reports
      .filter((item) => {
        const statusValid =
          filter === "Semua" ||
          getStatus(item) === filter;

        const text = normalize(
          [
            item.nama,
            getReportId(item),
            getReporter(item),
            item.lokasi,
            item.kategori,
          ].join(" ")
        );

        return statusValid && text.includes(keyword);
      })
      .sort((a, b) => {
        const dateA =
          new Date(getDate(a)).getTime() || 0;

        const dateB =
          new Date(getDate(b)).getTime() || 0;

        return sort === "terbaru"
          ? dateB - dateA
          : dateA - dateB;
      });
  }, [reports, search, filter, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;

  const visibleReports = filtered.slice(
    start,
    start + PAGE_SIZE
  );

  const selectedReport = selected
    ? reports.find(
        (item) => String(item.id) === String(selected)
      )
    : null;

  const selectedMatches = selectedReport
    ? getMatches(selectedReport, barang)
    : [];

  function changeFilter(value) {
    setFilter(value);
    setPage(1);
  }

  function openReview(item) {
    setSelected(item.id);
    setError("");
    setMessage("");
  }

  async function verify(approved) {
    if (!selectedReport || busy) return;

    if (typeof onVerifyReport !== "function") {
      setError("Fungsi verifikasi belum terhubung.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const result = await onVerifyReport(
        selectedReport.id,
        approved
      );

      if (result === false) {
        throw new Error("Verifikasi laporan gagal.");
      }

      setMessage(
        approved
          ? "Laporan berhasil disetujui."
          : "Laporan berhasil ditolak."
      );

      setSelected(null);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  async function returnReport() {
    if (!selectedReport || busy) return;

    if (typeof onReturnReport !== "function") {
      setError("Pencatatan penyerahan belum terhubung.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const result = await onReturnReport(
        selectedReport.id
      );

      if (result === false) {
        throw new Error("Pencatatan penyerahan gagal.");
      }

      setMessage("Penyerahan barang berhasil dicatat.");
      setSelected(null);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="vl-page">
      {/* BREADCRUMB DAN JUDUL */}

      <div className="vl-heading">
        <div className="vl-breadcrumb">
          <button
            onClick={() =>
              onDashboard
                ? onDashboard()
                : onNavigate("admin")
            }
          >
            Dashboard
          </button>

          <Icon name="chevron_right" size={16} />

          <strong>Verifikasi Laporan</strong>
        </div>

        <h1>Verifikasi Laporan</h1>

        <p>
          Tinjau laporan kehilangan dan catat penyerahan
          barang kepada pemilik.
        </p>
      </div>

      {/* NOTIFIKASI */}

      {message && (
        <div className="vl-success">
          <Icon name="check_circle" />
          {message}

          <button
            onClick={() => setMessage("")}
            aria-label="Tutup notifikasi"
          >
            <Icon name="close" />
          </button>
        </div>
      )}

      {/* FILTER STATUS */}

      <div className="vl-tabs">
        {FILTERS.map((tab) => (
          <button
            key={tab}
            className={
              filter === tab ? "vl-tab active" : "vl-tab"
            }
            onClick={() => changeFilter(tab)}
          >
            {tab}
            <span>{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* PENCARIAN DAN PENGURUTAN */}

      <div className="vl-toolbar">
        <div className="vl-search">
          <Icon name="search" />

          <input
            type="search"
            placeholder="Cari laporan atau nama barang..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="vl-controls">
          <label htmlFor="vl-sort">Urutkan:</label>

          <select
            id="vl-sort"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
          </select>

          <div className="vl-result-count">
            <Icon name="filter_list" size={18} />
            {filtered.length} laporan ditemukan
          </div>
        </div>
      </div>

      {/* TABEL LAPORAN */}

      <div className="vl-table-card">
        <div className="vl-table-scroll">
          <table className="vl-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama Barang &amp; ID</th>
                <th>Pelapor &amp; Lokasi</th>
                <th>Tanggal Hilang</th>
                <th>Kecocokan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {visibleReports.map((item) => {
                const matches = getMatches(item, barang);
                const status = getStatus(item);

                return (
                  <tr key={item.id}>
                    <td>
                      <FotoBarang item={item} />
                    </td>

                    <td>
                      <div className="vl-item-name">
                        {item.nama || "Tanpa nama"}
                      </div>

                      <div className="vl-report-id">
                        #{getReportId(item)}
                      </div>
                    </td>

                    <td>
                      <div className="vl-reporter">
                        {getReporter(item)}
                      </div>

                      <div className="vl-location">
                        <Icon name="location_on" size={14} />
                        {item.lokasi || "-"}
                      </div>
                    </td>

                    <td className="vl-date">
                      {formatDate(getDate(item))}
                    </td>

                    <td>
                      <span
                        className={`vl-match ${
                          matches.length > 0
                            ? "has-match"
                            : ""
                        }`}
                      >
                        {matches.length > 0 ? (
                          <>
                            <Icon
                              name="auto_awesome"
                              size={14}
                            />
                            {matches.length} kecocokan
                          </>
                        ) : (
                          "Belum ada kecocokan"
                        )}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={status} />
                    </td>

                    <td>
                      <button
                        className={`vl-review ${
                          status === "Menunggu Verifikasi"
                            ? "waiting"
                            : ""
                        }`}
                        onClick={() => openReview(item)}
                      >
                        <Icon name="visibility" size={16} />
                        Tinjau
                      </button>
                    </td>
                  </tr>
                );
              })}

              {visibleReports.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="vl-empty">
                      <div className="vl-empty-icon">
                        <Icon name="search_off" size={34} />
                      </div>

                      <h3>Tidak ada laporan ditemukan</h3>

                      <p>
                        Belum ada laporan yang sesuai dengan
                        filter atau pencarian.
                      </p>

                      <button
                        className="vl-primary"
                        onClick={() => {
                          setFilter("Semua");
                          setSearch("");
                          setPage(1);
                        }}
                      >
                        Reset Filter
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="vl-pagination">
          <span>
            Menampilkan{" "}
            <strong>
              {filtered.length === 0 ? 0 : start + 1}-
              {Math.min(
                start + PAGE_SIZE,
                filtered.length
              )}
            </strong>{" "}
            dari <strong>{filtered.length}</strong> laporan
          </span>

          <div className="vl-page-buttons">
            <button
              disabled={currentPage <= 1}
              onClick={() =>
                setPage(Math.max(1, currentPage - 1))
              }
            >
              Sebelumnya
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .filter(
                (number) =>
                  Math.abs(number - currentPage) <= 1 ||
                  number === 1 ||
                  number === totalPages
              )
              .map((number) => (
                <button
                  key={number}
                  className={
                    number === currentPage ? "active" : ""
                  }
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}

            <button
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage(
                  Math.min(totalPages, currentPage + 1)
                )
              }
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* MODAL TINJAU LAPORAN */}

      {selectedReport && (
        <div
          className="vl-modal-overlay"
          onClick={() => !busy && setSelected(null)}
        >
          <div
            className="vl-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vl-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vl-modal-heading">
              <div>
                <h2 id="vl-modal-title">
                  Tinjau Laporan
                </h2>

                <p>#{getReportId(selectedReport)}</p>
              </div>

              <button
                className="vl-close"
                disabled={busy}
                onClick={() => setSelected(null)}
                aria-label="Tutup"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            <div className="vl-modal-summary">
              <FotoBarang
                key={selectedReport.id}
                item={selectedReport}
              />

              <div>
                <h3>{selectedReport.nama}</h3>

                <StatusBadge
                  status={getStatus(selectedReport)}
                />
              </div>
            </div>

            <div className="vl-detail-grid">
              {[
                ["Pelapor", getReporter(selectedReport)],
                ["Kategori", selectedReport.kategori],
                ["Lokasi", selectedReport.lokasi],
                [
                  "Tanggal Hilang",
                  formatDate(getDate(selectedReport)),
                ],
                ["Warna", selectedReport.warna],
                ["Merek", selectedReport.merek],
                ["Rentang Waktu", selectedReport.rentangWaktu],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value || "-"}</strong>
                </div>
              ))}
            </div>

            <div className="vl-description">
              <h4>Ciri-ciri Barang</h4>

              <p>
                {selectedReport.ciri ||
                  selectedReport.deskripsi ||
                  "Tidak ada keterangan tambahan."}
              </p>
            </div>

            <div className="vl-matches-panel">
              <h4>
                <Icon name="auto_awesome" size={20} />
                Rekomendasi Kecocokan (
                {selectedMatches.length})
              </h4>

              {selectedMatches.length === 0 ? (
                <p>
                  Belum ditemukan barang yang cocok.
                </p>
              ) : (
                selectedMatches.map((item) => (
                  <div
                    className="vl-match-row"
                    key={item.id}
                  >
                    <FotoBarang item={item} />

                    <div>
                      <strong>{item.nama}</strong>
                      <p>{item.lokasi}</p>
                    </div>
                  </div>
                ))
              )}

              <small>
                Kecocokan dihitung berdasarkan atribut
                barang dan bukan bukti kepemilikan.
              </small>
            </div>

            {error && (
              <div className="vl-error">{error}</div>
            )}

            <div className="vl-modal-actions">
              <button
                className="vl-secondary"
                disabled={busy}
                onClick={() => setSelected(null)}
              >
                Tutup
              </button>

              {getStatus(selectedReport) ===
                "Menunggu Verifikasi" && (
                <>
                  <button
                    className="vl-danger"
                    disabled={busy}
                    onClick={() => verify(false)}
                  >
                    <Icon name="close" size={18} />
                    Tolak Laporan
                  </button>

                  <button
                    className="vl-primary"
                    disabled={busy}
                    onClick={() => verify(true)}
                  >
                    <Icon name="check_circle" size={18} />
                    {busy
                      ? "Memproses..."
                      : "Setujui Laporan"}
                  </button>
                </>
              )}

              {getStatus(selectedReport) === "Disetujui" &&
                typeof onReturnReport === "function" && (
                  <button
                    className="vl-primary"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Pastikan barang sudah diserahkan kepada pemilik yang sah. Lanjutkan?"
                        )
                      ) {
                        returnReport();
                      }
                    }}
                  >
                    <Icon name="task_alt" size={18} />
                    Catat Penyerahan
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
