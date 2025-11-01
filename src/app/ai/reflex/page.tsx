"use client";

import React from "react";

export default function ReflexDashboard() {
  // URL pública del dashboard (ajusta según Render o localhost)
  const dashboardURL =
    process.env.NODE_ENV === "production"
      ? "https://omega-ai-server.onrender.com/reports/reflex_dashboard_v15plus.html"
      : "http://localhost:4000/reports/reflex_dashboard_v15plus.html";

  return (
    <div style={{ width: "100%", height: "100vh", background: "#000" }}>
      <iframe
        src={dashboardURL}
        title="Omega Reflex v15+ Dashboard"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </div>
  );
}
