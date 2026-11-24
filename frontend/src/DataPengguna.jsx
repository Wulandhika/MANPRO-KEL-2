import { useMemo, useState } from "react";
import "./DataPengguna.css";

const PAGE_SIZE = 8;
const KEY_ACCOUNTS = "findit_akun_demo_v1";
const KEY_SETTINGS = "findit_admin_user_settings_v1";

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function Icon({ name }) {
  return (
    <span className="material-symbols-outlined">
      {name}
    </span>
  );
}

function initials(name) {
  return String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(x => x[0])
    .join("")
    .toUpperCase();
}

function tanggal(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) + " WIB";
}

export default function DataPengguna({
  barang = [],
  admin = null,
  onDashboard = () => {}
}) {
  const [accounts] = useState(() => read(KEY_ACCOUNTS, []));
  const [settings, setSettings] = useState(
    () => read(KEY_SETTINGS, {})
  );
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editRole, setEditRole] = useState("user");
  const [message, setMessage] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const currentAdmin = String(
    admin?.email || "admin@findit.test"
  ).toLowerCase();

  const users = useMemo(() => {
    const map = new Map();

    function add(data) {
      const email = String(data.email || "").toLowerCase();
      if (!email.includes("@")) return;

      const old = map.get(email) || {};
      map.set(email, {
        email,
        nama: data.nama || old.nama || email.split("@")[0],
        nomorInduk: data.nomorInduk || old.nomorInduk || "",
        role: data.role || old.role || "user",
        status: data.status || old.status || "Aktif",
        lastLogin: data.lastLogin || old.lastLogin || "",
        jumlah: old.jumlah || 0
      });
    }

    add({
      nama: admin?.nama || "Admin FindIt",
      email: currentAdmin,
      nomorInduk: admin?.nomorInduk,
      role: "admin",
      lastLogin: admin?.lastLogin
    });

    add({
      nama: "Dimas Fauzi",
      email: "demo@findit.test",
      role: "user"
    });

    if (Array.isArray(accounts)) {
      accounts.forEach(a => add({
        email: a.email,
        nama: a.nama || a.name,
        nomorInduk: a.nomorInduk || a.nim || a.nip,
        role: a.role,
        status: a.status,
        lastLogin: a.lastLogin || a.lastLoginAt
      }));
    }

    barang.forEach(item => {
      const p = item.pelapor;
      const email = String(
        typeof p === "string" ? p : p?.email || ""
      ).toLowerCase();

      if (!email.includes("@")) return;

      if (!map.has(email)) {
        add({
          email,
          nama: item.namaPelapor ||
            item.namaPenemu ||
            (typeof p === "object" ? p?.nama : "") ||
            email.split("@")[0]
        });
      }

      map.get(email).jumlah += 1;
    });

    return [...map.values()].map(u => ({
      ...u,
      ...settings[u.email],
      email: u.email,
      jumlah: u.jumlah
    })).sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  }, [accounts, barang, admin, currentAdmin, settings]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase().trim();
    const text = [
      u.nama, u.email, u.nomorInduk
    ].join(" ").toLowerCase();

    return (!q || text.includes(q)) &&
      (!role || u.role === role) &&
      (!status || u.status === status);
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function update(email, changes) {
    const next = {
      ...settings,
      [email]: {
        ...(settings[email] || {}),
        ...changes
      }
    };
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(next));
    setSettings(next);
  }

  function saveRole() {
    if (!editing || editing.email === currentAdmin) return;
    update(editing.email, { role: editRole });
    setMessage("Role tampilan berhasil diperbarui.");
    setEditing(null);
  }

  function changeStatus(u) {
    if (u.email === currentAdmin) return;

    setConfirmError("");
    setConfirmUser(u);
  }

  function closeConfirm() {
    if (confirmLoading) return;

    setConfirmUser(null);
    setConfirmError("");
  }

  async function confirmStatusChange() {
    if (!confirmUser || confirmLoading) return;

    if (confirmUser.email === currentAdmin) {
      setConfirmError(
        "Akun admin yang sedang digunakan tidak dapat dinonaktifkan."
      );
      return;
    }

    const next =
      confirmUser.status === "Aktif" ? "Nonaktif" : "Aktif";

    try {
      setConfirmLoading(true);
      setConfirmError("");

      update(confirmUser.email, { status: next });

      setMessage(
        `Status ${confirmUser.nama} berhasil diubah menjadi ${next}.`
      );

      setConfirmUser(null);
    } catch (err) {
      setConfirmError(
        err?.message || "Gagal mengubah status pengguna."
      );
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <section className="dp-page">
      <div className="dp-heading">
        <div className="dp-breadcrumb">
          <button onClick={onDashboard}>Dashboard</button>
          <Icon name="chevron_right" />
          <span>Data Pengguna</span>
        </div>
        <h1>Data Pengguna</h1>
        <p>Kelola akun mahasiswa, dosen, dan staf yang menggunakan FindIt.</p>
      </div>

      {message && (
        <div className="dp-message">{message}</div>
      )}

      <div className="dp-filters">
        <div className="dp-search">
          <Icon name="search" />
          <input
            placeholder="Cari nama, NIM/NIP, atau email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button
              type="button"
              className="dp-clear-search"
              title="Hapus pencarian"
              aria-label="Hapus pencarian"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              <Icon name="close" />
            </button>
          )}
        </div>
        <select value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}>
          <option value="">Semua Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
        <button className="dp-reset" onClick={() => {
          setSearch(""); setRole(""); setStatus(""); setPage(1);
        }}>
          <Icon name="restart_alt" /> Reset
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="dp-empty-state">
          <div className="dp-empty-icon">
            <Icon name="person_search" />
          </div>

          <h2>Pengguna tidak ditemukan</h2>

          <p>
            Tidak ada data pengguna yang cocok dengan
            {search.trim() ? (
              <>
                {" "}kata kunci pencarian{" "}
                <strong>"{search.trim()}"</strong>
              </>
            ) : (
              " filter yang dipilih"
            )}
            . Silakan periksa kembali ejaan atau atur
            ulang filter pencarian.
          </p>

          <button
            type="button"
            className="dp-empty-reset"
            onClick={() => {
              setSearch("");
              setRole("");
              setStatus("");
              setPage(1);
            }}
          >
            <Icon name="refresh" />
            Atur Ulang Filter &amp; Pencarian
          </button>
        </div>
      ) : (
      <div className="dp-card">
        <div className="dp-scroll">
          <table className="dp-table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>NIM / NIP</th>
                <th>Role</th>
                <th>Jumlah Laporan</th>
                <th>Status</th>
                <th>Terakhir Masuk</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u, i) => (
                <tr key={u.email}>
                  <td>
                    <div className="dp-person">
                      <span className={
                        "dp-avatar " + (u.role === "admin" ? "dp-admin" : "")
                      }>
                        {initials(u.nama)}
                      </span>
                      <span>
                        <strong>{u.nama}</strong>
                        <small>{u.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>{u.nomorInduk || "-"}</td>
                  <td>
                    <span className="dp-role">
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>{u.jumlah} laporan</td>
                  <td>
                    <span className={
                      "dp-status " +
                      (u.status === "Aktif" ? "dp-active" : "dp-inactive")
                    }>
                      ● {u.status}
                    </span>
                  </td>
                  <td>{tanggal(u.lastLogin)}</td>
                  <td>
                    <div className="dp-actions">
                      <button title="Lihat Detail"
                        onClick={() => setDetail(u)}>
                        <Icon name="visibility" />
                      </button>
                      <button title="Ubah Role"
                        disabled={u.email === currentAdmin}
                        onClick={() => {
                          setEditing(u); setEditRole(u.role);
                        }}>
                        <Icon name="manage_accounts" />
                      </button>
                      <button
                        title={u.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                        disabled={u.email === currentAdmin}
                        onClick={() => changeStatus(u)}>
                        <Icon name={
                          u.status === "Aktif" ? "block" : "check_circle"
                        } />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={7} className="dp-empty">
                    Tidak ada pengguna yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="dp-footer">
          <span>
            Menampilkan {filtered.length ? start + 1 : 0}–
            {Math.min(start + PAGE_SIZE, filtered.length)}
            {" "}dari {filtered.length} pengguna
          </span>
          <div className="dp-pagination">
            <button disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}>‹ Prev</button>
            <span>{currentPage} / {pages}</span>
            <button disabled={currentPage === pages}
              onClick={() => setPage(currentPage + 1)}>Next ›</button>
          </div>
        </footer>
      </div>
      )}

            {confirmUser && (
        <div
          className="dp-confirm-overlay"
          onClick={closeConfirm}
        >
          <section
            className="dp-confirm-modal dp-confirm-deactivate"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dp-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="dp-confirm-close"
              title="Tutup"
              aria-label="Tutup modal"
              disabled={confirmLoading}
              onClick={closeConfirm}
            >
              <Icon name="close" />
            </button>

            <div className="dp-confirm-icon">
              <Icon
                name={
                  confirmUser.status === "Aktif"
                    ? "block"
                    : "check_circle"
                }
              />
            </div>

            <h2 id="dp-confirm-title">
              {confirmUser.status === "Aktif"
                ? "Nonaktifkan Pengguna?"
                : "Aktifkan Pengguna?"}
            </h2>

            <div className="dp-confirm-profile">
              <div className="dp-confirm-avatar">
                {initials(confirmUser.nama)}
              </div>

              <div className="dp-confirm-profile-info">
                <div className="dp-confirm-user-name">
                  <strong>{confirmUser.nama}</strong>
                  <span>
                    {confirmUser.role === "admin"
                      ? "Admin"
                      : "User"}
                  </span>
                </div>

                <small>{confirmUser.email}</small>

                <p>
                  {confirmUser.nomorInduk
                    ? `NIM/NIP: ${confirmUser.nomorInduk}`
                    : "NIM/NIP: -"}
                </p>
              </div>
            </div>

            <p className="dp-confirm-description">
              {confirmUser.status === "Aktif"
                ? "Nonaktifkan pengguna ini? Pengguna tidak akan bisa masuk sampai diaktifkan kembali."
                : "Aktifkan kembali pengguna ini? Status akun akan diubah menjadi aktif."}
            </p>

            {confirmError && (
              <div className="dp-confirm-error" role="alert">
                {confirmError}
              </div>
            )}

            <div className="dp-confirm-buttons">
              <button
                type="button"
                className="dp-confirm-cancel"
                onClick={closeConfirm}
                disabled={confirmLoading}
              >
                Batal
              </button>

              <button
                type="button"
                className={
                  confirmUser.status === "Aktif"
                    ? "dp-confirm-danger"
                    : "dp-confirm-success"
                }
                disabled={confirmLoading}
                onClick={confirmStatusChange}
              >
                <Icon
                  name={
                    confirmUser.status === "Aktif"
                      ? "person_off"
                      : "person_add"
                  }
                />

                {confirmLoading
                  ? "Memproses..."
                  : confirmUser.status === "Aktif"
                    ? "Nonaktifkan"
                    : "Aktifkan"}
              </button>
            </div>
          </section>
        </div>
      )}
      {(detail || editing) && (
        <div className="dp-overlay"
          onClick={() => { setDetail(null); setEditing(null); }}>
          <div className="dp-modal"
            onClick={e => e.stopPropagation()}>
            <h2>{detail ? "Detail Pengguna" : "Ubah Role Pengguna"}</h2>
            {detail ? (
              <div className="dp-detail">
                <p><b>Nama:</b> {detail.nama}</p>
                <p><b>Email:</b> {detail.email}</p>
                <p><b>NIM/NIP:</b> {detail.nomorInduk || "-"}</p>
                <p><b>Role:</b> {detail.role}</p>
                <p><b>Status:</b> {detail.status}</p>
                <p><b>Laporan:</b> {detail.jumlah}</p>
                <p><b>Terakhir Masuk:</b> {tanggal(detail.lastLogin)}</p>
              </div>
            ) : (
              <label className="dp-edit-field">
                Role untuk {editing?.nama}
                <select value={editRole}
                  onChange={e => setEditRole(e.target.value)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}
            <div className="dp-modal-actions">
              <button onClick={() => {
                setDetail(null); setEditing(null);
              }}>Tutup</button>
              {editing && (
                <button className="dp-save"
                  onClick={saveRole}>Simpan</button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


