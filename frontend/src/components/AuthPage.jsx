
import { useEffect, useState } from "react";
import "./AuthPage.css";

function ambilEmailTersimpan() {
  try {
    return localStorage.getItem("findit_email_diingat") || "";
  } catch {
    return "";
  }
}

function Icon({ name }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true">
      {name}
    </span>
  );
}

function InputSandi({
  id,
  label,
  value,
  onChange,
  terlihat,
  toggle,
  placeholder,
  minLength = 1,
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>

      <div className="auth-password-wrap">
        <input
          id={id}
          type={terlihat ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={minLength}
          placeholder={placeholder}
          autoComplete={
            id === "auth-login-password"
              ? "current-password"
              : "new-password"
          }
          required
        />

        <button
          type="button"
          className="auth-eye"
          aria-label={
            terlihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
          }
          onClick={toggle}
        >
          <Icon
            name={terlihat ? "visibility_off" : "visibility"}
          />
        </button>
      </div>
    </div>
  );
}

export default function AuthPage({
  daftar = false,
  masuk,
  registrasi,
  pergi,
}) {
  const [tab, setTab] = useState(daftar ? "daftar" : "masuk");
  const [pesan, setPesan] = useState("");
  const [fotoAda, setFotoAda] = useState(true);

  const [lihatLogin, setLihatLogin] = useState(false);
  const [lihatDaftar, setLihatDaftar] = useState(false);
  const [lihatKonfirmasi, setLihatKonfirmasi] = useState(false);

  const [login, setLogin] = useState(() => ({
    email: ambilEmailTersimpan(),
    password: "",
    ingat: Boolean(ambilEmailTersimpan()),
  }));

  const [formDaftar, setFormDaftar] = useState({
    nama: "",
    nim: "",
    email: "",
    password: "",
    konfirmasi: "",
  });

  useEffect(() => {
    setTab(daftar ? "daftar" : "masuk");
    setPesan("");
  }, [daftar]);

  function gantiTab(tujuan) {
    setTab(tujuan);
    setPesan("");
    pergi(tujuan === "daftar" ? "daftar" : "masuk");
  }

  function ubahDaftar(kunci, nilai) {
    setFormDaftar((sebelumnya) => ({
      ...sebelumnya,
      [kunci]: nilai,
    }));
  }

  function submit(e) {
    e.preventDefault();
    setPesan("");

    if (tab === "masuk") {
      const email = login.email.trim().toLowerCase();

      try {
        if (login.ingat) {
          localStorage.setItem("findit_email_diingat", email);
        } else {
          localStorage.removeItem("findit_email_diingat");
        }
      } catch {
        // Penyimpanan email bersifat opsional.
      }

      masuk(email, login.password);
      return;
    }

    const nama = formDaftar.nama.trim();
    const nim = formDaftar.nim.trim();
    const email = formDaftar.email.trim().toLowerCase();

    if (formDaftar.password.length < 8) {
      setPesan("Kata sandi harus memiliki minimal 8 karakter.");
      return;
    }

    if (formDaftar.password !== formDaftar.konfirmasi) {
      setPesan("Konfirmasi kata sandi belum sama.");
      return;
    }

    // Registrasi simulasi; password tidak disimpan.
    registrasi(nama, email, nim);
  }

  return (
    <section className="auth-stage">
      <div className="auth-card">

        {/* PANEL KIRI: FOTO UMY */}
        <aside className="auth-visual">
          {fotoAda ? (
            <img
              src="/umy.jpg"
              className="auth-visual-photo"
              alt=""
              aria-hidden="true"
              onError={() => setFotoAda(false)}
            />
          ) : (
            <p className="auth-photo-warning">
              Foto UMY belum ditemukan di frontend/public/umy.jpg.
            </p>
          )}

          <div className="auth-visual-overlay" />

          <div className="auth-visual-content">
            <div className="auth-brand">
              <span className="auth-brand-mark">
                <Icon name="search" />
              </span>

              <span>
                <strong>FindIt</strong>
                <small>SISTEM KAMPUS</small>
              </span>
            </div>

            <div className="auth-visual-message">
              <h2>Temukan kembali barangmu.</h2>

              <p>
                Masuk untuk melaporkan atau mencari barang
                hilang di kampus.
              </p>
            </div>

            <p className="auth-visual-bottom">
              Layanan terpadu kehilangan &amp; temuan
              civitas akademika
            </p>
          </div>
        </aside>

        {/* PANEL KANAN: LOGIN & DAFTAR */}
        <div className="auth-right">
          <div className="auth-form-content">

            <div
              className="auth-tabs"
              role="tablist"
              aria-label="Pilih masuk atau daftar"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "masuk"}
                className={tab === "masuk" ? "selected" : ""}
                onClick={() => gantiTab("masuk")}
              >
                Masuk
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={tab === "daftar"}
                className={tab === "daftar" ? "selected" : ""}
                onClick={() => gantiTab("daftar")}
              >
                Daftar
              </button>
            </div>

            {tab === "masuk" ? (
              <>
                <div className="auth-heading">
                  <h1>Masuk ke Akunmu</h1>
                  <p>
                    Silakan masukkan email dan kata sandi Anda.
                  </p>
                </div>

                <form className="auth-form" onSubmit={submit}>
                  <div className="auth-field">
                    <label htmlFor="auth-login-email">
                      Email Kampus / Pribadi
                    </label>

                    <input
                      id="auth-login-email"
                      type="email"
                      value={login.email}
                      onChange={(e) =>
                        setLogin((v) => ({
                          ...v,
                          email: e.target.value,
                        }))
                      }
                      placeholder="nama@kampus.ac.id"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <InputSandi
                    id="auth-login-password"
                    label="Kata Sandi"
                    value={login.password}
                    onChange={(password) =>
                      setLogin((v) => ({ ...v, password }))
                    }
                    terlihat={lihatLogin}
                    toggle={() => setLihatLogin((v) => !v)}
                    placeholder="Masukkan kata sandi"
                  />

                  <div className="auth-form-options">
                    <label className="auth-remember">
                      <input
                        type="checkbox"
                        checked={login.ingat}
                        onChange={(e) =>
                          setLogin((v) => ({
                            ...v,
                            ingat: e.target.checked,
                          }))
                        }
                      />
                      Ingat saya
                    </label>

                    <button
                      className="auth-link"
                      type="button"
                      onClick={() =>
                        setPesan(
                          "Reset kata sandi belum tersedia pada mode demo. Gunakan akun demo untuk mencoba halaman ini."
                        )
                      }
                    >
                      Lupa kata sandi?
                    </button>
                  </div>

                  {pesan && (
                    <p className="auth-message" role="status">
                      {pesan}
                    </p>
                  )}

                  <button className="auth-submit" type="submit">
                    Masuk
                  </button>
                </form>

                <p className="auth-switch">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => gantiTab("daftar")}
                  >
                    Daftar di sini
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="auth-heading">
                  <h1>Buat Akun Baru</h1>
                  <p>
                    Lengkapi data untuk mendaftar akun FindIt.
                  </p>
                </div>

                <form
                  className="auth-form auth-register-form"
                  onSubmit={submit}
                >
                  <div className="auth-field">
                    <label htmlFor="auth-reg-name">
                      Nama Lengkap
                    </label>

                    <input
                      id="auth-reg-name"
                      value={formDaftar.nama}
                      onChange={(e) =>
                        ubahDaftar("nama", e.target.value)
                      }
                      placeholder="Nama lengkap Anda"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="auth-reg-id">NIM / NIP</label>

                    <input
                      id="auth-reg-id"
                      value={formDaftar.nim}
                      onChange={(e) =>
                        ubahDaftar("nim", e.target.value)
                      }
                      placeholder="Nomor Induk Mahasiswa / Pegawai"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="auth-reg-email">
                      Email (Kampus / Pribadi)
                    </label>

                    <input
                      id="auth-reg-email"
                      type="email"
                      value={formDaftar.email}
                      onChange={(e) =>
                        ubahDaftar("email", e.target.value)
                      }
                      placeholder="nama@kampus.ac.id"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <InputSandi
                    id="auth-reg-password"
                    label="Kata Sandi"
                    value={formDaftar.password}
                    onChange={(nilai) =>
                      ubahDaftar("password", nilai)
                    }
                    terlihat={lihatDaftar}
                    toggle={() => setLihatDaftar((v) => !v)}
                    placeholder="Minimal 8 karakter"
                    minLength={8}
                  />

                  <InputSandi
                    id="auth-reg-confirm"
                    label="Konfirmasi Kata Sandi"
                    value={formDaftar.konfirmasi}
                    onChange={(nilai) =>
                      ubahDaftar("konfirmasi", nilai)
                    }
                    terlihat={lihatKonfirmasi}
                    toggle={() => setLihatKonfirmasi((v) => !v)}
                    placeholder="Ulangi kata sandi"
                    minLength={8}
                  />

                  {pesan && (
                    <p className="auth-message" role="alert">
                      {pesan}
                    </p>
                  )}

                  <button className="auth-submit" type="submit">
                    Daftar
                  </button>
                </form>

                <p className="auth-switch">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => gantiTab("masuk")}
                  >
                    Masuk di sini
                  </button>
                </p>
              </>
            )}

            <details className="auth-demo">
              <summary>Lihat akun demo untuk pengujian</summary>
              <p>
                Pengguna: <strong>demo@findit.test</strong> /
                demo123
              </p>
              <p>
                Admin: <strong>admin@findit.test</strong> /
                admin123
              </p>
              <small>
                Pendaftaran masih simulasi; kata sandi tidak
                disimpan. Centang "Ingat saya" untuk menyimpan
                email saja.
              </small>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
