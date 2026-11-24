import { useMemo, useState } from "react";

const KEY_ITEMS = "findit_barang_final_v1";

const buttonStyle = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  borderRadius: 7,
  padding: "7px 10px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
};

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #dbe2ea",
  borderRadius: 8,
  background: "white",
  minWidth: 130,
};

function labelStatus(item) {
  const status = String(item.status || "");
  const verifikasi = String(item.statusVerifikasi || "");
  if (status === "Ditutup" || status === "Selesai" || verifikasi === "Ditutup") return "Selesai";
  if (status === "Dikembalikan") return "Dikembalikan";
  if (verifikasi === "Menunggu Verifikasi") return "Menunggu Verifikasi";
  return status || verifikasi || "-";
}

function tanggal(item) {
  const raw = item.tanggalLaporan || item.waktu || item.tanggal;
  if (!raw) return "-";
  const d = new Date(raw);
  return Number.isNaN(d.getTime())
    ? String(raw)
    : d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export default function DataBarang({
  barang = [],
  klaim = [],
  onDetail,
  onUpdateItem,
  onDeleteItem,
  onInputBarang,
}) {
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("");
  const [kategori, setKategori] = useState("");
  const [status, setStatus] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const kategoriList = [...new Set(
    barang.map(x => x.kategori).filter(Boolean)
  )];

  const filtered = useMemo(() => {
    return barang.filter((item) => {
      const teks = [
        item.nama, item.id, item.kodeLaporan,
        item.kategori, item.lokasi, item.namaPelapor
      ].join(" ").toLowerCase();

      if (search && !teks.includes(search.toLowerCase())) return false;
      if (jenis && item.tipe !== jenis) return false;
      if (kategori && item.kategori !== kategori) return false;
      if (status && labelStatus(item) !== status) return false;

      return true;
    });
  }, [barang, search, jenis, kategori, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);

  function simpanLokal(next) {
    localStorage.setItem(KEY_ITEMS, JSON.stringify(next));
    window.location.reload();
  }

  async function updateItem(updated) {
    if (typeof onUpdateItem === "function") {
      const result = await onUpdateItem(updated);
      if (result === false) throw new Error("Perubahan dibatalkan.");
    } else {
      const next = barang.map(item =>
        String(item.id) === String(updated.id) ? updated : item
      );
      simpanLokal(next);
    }
  }

  function mulaiEdit(item) {
    setEditItem(item);
    setForm({
      nama: item.nama || "",
      kategori: item.kategori || "",
      warna: item.warna || "",
      merek: item.merek || "",
      lokasi: item.lokasi || "",
      tempat: item.tempat || "",
    });
    setError("");
  }

  async function simpanEdit(event) {
    event.preventDefault();
    if (!form.nama.trim()) {
      setError("Nama barang wajib diisi.");
      return;
    }

    try {
      await updateItem({ ...editItem, ...form, nama: form.nama.trim() });
      setEditItem(null);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function selesai(item) {
    if (!window.confirm(`Tandai laporan "${item.nama}" sebagai selesai?`)) return;

    try {
      await updateItem({
        ...item,
        status: "Ditutup",
        statusVerifikasi: "Ditutup",
        tanggalDitutup: new Date().toISOString(),
      });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function hapus(item) {
    if (!window.confirm(`Hapus "${item.nama}" secara permanen?`)) return;

    const terkait = klaim.some(k =>
      String(k.barangId || "") === String(item.id) ||
      String(k.laporanId || "") === String(item.id)
    );

    if (terkait) {
      setError("Barang memiliki klaim terkait dan tidak bisa dihapus.");
      return;
    }

    try {
      if (typeof onDeleteItem === "function") {
        const result = await onDeleteItem(item.id);
        if (result === false) throw new Error("Penghapusan dibatalkan.");
      } else {
        simpanLokal(barang.filter(x => String(x.id) !== String(item.id)));
      }
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section style={{ width: "100%" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 12,
        marginBottom: 20
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Data Barang</h1>
          <p style={{ margin: "7px 0 0", color: "#64748b" }}>
            Kelola seluruh laporan barang hilang dan ditemukan.
          </p>
        </div>
        <button
          onClick={onInputBarang}
          style={{ ...buttonStyle, background: "#3064ae",
            color: "white", padding: "12px 18px" }}
        >
          + Input Barang Temuan
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: "#b91c1c", fontWeight: 600 }}>
          {error}
        </p>
      )}

      <div style={{
        background: "white", border: "1px solid #e2e8f0",
        borderRadius: 15, padding: 22
      }}>
        <h2 style={{ marginTop: 0 }}>Daftar Barang ({filtered.length})</h2>

        <div style={{
          display: "flex", flexWrap: "wrap", gap: 10,
          marginBottom: 20
        }}>
          <input
            placeholder="Cari barang atau ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, flex: "1 1 200px" }}
          />

          <select value={jenis}
            onChange={e => { setJenis(e.target.value); setPage(1); }}
            style={inputStyle}>
            <option value="">Semua Jenis</option>
            <option value="HILANG">Hilang</option>
            <option value="DITEMUKAN">Ditemukan</option>
          </select>

          <select value={kategori}
            onChange={e => { setKategori(e.target.value); setPage(1); }}
            style={inputStyle}>
            <option value="">Semua Kategori</option>
            {kategoriList.map(k => <option key={k}>{k}</option>)}
          </select>

          <select value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            style={inputStyle}>
            <option value="">Semua Status</option>
            {[
              "Hilang", "Ditemukan", "Menunggu Verifikasi",
              "Dalam Verifikasi", "Dikembalikan", "Selesai", "Ditolak"
            ].map(s => <option key={s}>{s}</option>)}
          </select>

          <button style={buttonStyle} onClick={() => {
            setSearch(""); setJenis(""); setKategori("");
            setStatus(""); setPage(1);
          }}>
            Reset
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse",
            minWidth: 1050, fontSize: 13
          }}>
            <thead style={{ background: "#f1f4f8" }}>
              <tr>
                {[
                  "Foto", "Nama Barang & ID", "Jenis", "Kategori",
                  "Pelapor / Penemu", "Tanggal", "Status", "Aksi"
                ].map(h => (
                  <th key={h} style={{
                    padding: 13, textAlign: "left",
                    whiteSpace: "nowrap"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(item => {
                const selesaiStatus = ["Selesai", "Dikembalikan"]
                  .includes(labelStatus(item));
                const foto = item.gambar || item.foto || item.image;
                const pelapor = item.namaPelapor || item.namaPenemu ||
                  (typeof item.pelapor === "string"
                    ? item.pelapor.split("@")[0]
                    : item.pelapor?.nama) || "-";

                return (
                  <tr key={item.id} style={{
                    borderBottom: "1px solid #e2e8f0"
                  }}>
                    <td style={{ padding: 12 }}>
                      {foto ? (
                        <img src={foto} alt=""
                          style={{ width: 48, height: 48,
                            borderRadius: 8, objectFit: "cover" }} />
                      ) : "📦"}
                    </td>
                    <td style={{ padding: 12 }}>
                      <strong>{item.nama || "-"}</strong>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>
                        {item.kodeLaporan || item.id}
                      </div>
                    </td>
                    <td style={{ padding: 12 }}>
                      {item.tipe === "HILANG" ? "Hilang" : "Ditemukan"}
                    </td>
                    <td style={{ padding: 12 }}>{item.kategori || "-"}</td>
                    <td style={{ padding: 12 }}>
                      <strong>{pelapor}</strong>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>
                        {item.lokasi || "-"}
                      </div>
                    </td>
                    <td style={{ padding: 12, whiteSpace: "nowrap" }}>
                      {tanggal(item)}
                    </td>
                    <td style={{ padding: 12 }}>{labelStatus(item)}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{
                        display: "flex", gap: 5, alignItems: "center"
                      }}>
                        <button style={buttonStyle}
                          onClick={() => onDetail?.(item)}>
                          Detail
                        </button>
                        <button style={buttonStyle}
                          onClick={() => mulaiEdit(item)}>
                          Edit
                        </button>
                        <button
                          style={{ ...buttonStyle, color: "#15803d" }}
                          disabled={selesaiStatus}
                          onClick={() => selesai(item)}>
                          ✓ Selesai
                        </button>
                        <button
                          style={{ ...buttonStyle, color: "#dc2626" }}
                          onClick={() => hapus(item)}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 28, textAlign: "center" }}>
                  Tidak ada barang yang sesuai filter.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: 20, display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <span>Menampilkan {visible.length} dari {filtered.length} barang</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={buttonStyle}
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}>
              Sebelumnya
            </button>
            <span style={{ padding: 9 }}>
              {currentPage} / {totalPages}
            </span>
            <button style={buttonStyle}
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}>
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {editItem && (
        <div style={{
          position: "fixed", inset: 0, background: "#0008",
          display: "grid", placeItems: "center", zIndex: 9999,
          padding: 16
        }}>
          <form onSubmit={simpanEdit} style={{
            background: "white", padding: 24,
            borderRadius: 14, width: "min(480px, 100%)",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <h2>Edit Barang</h2>
            {[
              ["nama", "Nama Barang"],
              ["kategori", "Kategori"],
              ["warna", "Warna"],
              ["merek", "Merek"],
              ["lokasi", "Lokasi"],
              ["tempat", "Tempat Penitipan"]
            ].map(([key, label]) => (
              <label key={key} style={{
                display: "block", marginBottom: 12
              }}>
                <span>{label}</span>
                <input
                  required={key === "nama"}
                  style={{ ...inputStyle, display: "block",
                    width: "100%", marginTop: 5 }}
                  value={form[key] || ""}
                  onChange={e => setForm({
                    ...form, [key]: e.target.value
                  })}
                />
              </label>
            ))}
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button style={buttonStyle} type="button"
                onClick={() => { setEditItem(null); setError(""); }}>
                Batal
              </button>
              <button style={{
                ...buttonStyle, background: "#3064ae", color: "white"
              }} type="submit">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
