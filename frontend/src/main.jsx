
import React from "react";
import ReactDOM from "react-dom/client";

// Komponen utama aplikasi FindIt
import App from "./App.jsx";

// CSS utama seluruh aplikasi
import "../styles.css";

// Menjalankan semua halaman melalui App.jsx
ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
