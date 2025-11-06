// public/js/alertas.js

async function obtenerAlertas() {
  try {
    const res = await fetch("/api/alertas");
    const data = await res.json();

    if (!data.success) return;

    renderAlertasEnTabla(data.data);

    data.data.forEach(a => {
      if (a.tipo === "stock_bajo") {
        alertify.error(`⚠️ ${a.mensaje}`);
      } else if (a.tipo === "vencimiento") {
        alertify.warning(`⏰ ${a.mensaje}`);
      }
    });

  } catch (error) {
    console.error("Error al obtener alertas:", error);
  }
}

function renderAlertasEnTabla(alertas) {
  const tbody = document.querySelector("#alertas-table tbody");
  if (!tbody) return;

  tbody.innerHTML = alertas.length === 0
    ? `<tr><td colspan="4">Sin alertas activas</td></tr>`
    : alertas.map(a => `
      <tr>
        <td>${a.id}</td>
        <td>${a.mensaje}</td>
        <td><span class="badge bg-${
          a.tipo === "stock_bajo"
            ? "danger"
            : a.tipo === "vencimiento"
            ? "warning text-dark"
            : "secondary"
        }">${a.tipo}</span></td>
        <td>${new Date(a.fecha_generacion).toLocaleString()}</td>
      </tr>
    `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  obtenerAlertas();
  setInterval(obtenerAlertas, 60000);
});
