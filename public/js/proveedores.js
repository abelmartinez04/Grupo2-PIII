document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#proveedores-table tbody");
  const btnNuevo = document.querySelector("#btn-nuevo");

  const cargarProveedores = async () => {
    const res = await fetch("/api/proveedores");
    const data = await res.json();

    tableBody.innerHTML = "";
    if (data.success) {
      data.data.forEach((p) => {
        tableBody.innerHTML += `
          <tr>
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.rnc || "-"}</td>
            <td>${p.telefono || "-"}</td>
            <td>${p.email || "-"}</td>
            <td>${p.estado}</td>
            <td>
              <button class="btn btn-sm btn-primary editar" data-id="${
                p.id
              }"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-danger eliminar" data-id="${
                p.id
              }"><i class="bi bi-trash"></i></button>
            </td>
          </tr>`;
      });
    } else {
      alertify.error("Error al cargar proveedores");
    }
  };

  cargarProveedores();

  // Crear nuevo proveedor
  btnNuevo.addEventListener("click", () => {
    mostrarFormularioProveedor("Nuevo proveedor", {}, async (proveedor) => {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proveedor),
      });
      const data = await res.json();
      if (data.success) {
        alertify.success("Proveedor agregado");
        cargarProveedores();
      } else alertify.error(data.error);
    });
  });

  // Editar / eliminar
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.classList.contains("eliminar")) {
      alertify.confirm(
        "Eliminar proveedor",
        "¿Seguro que deseas eliminarlo?",
        async function () {
          try {
            const res = await fetch(`/api/proveedores/${id}`, {
              method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
              alertify.success("Proveedor eliminado");
              cargarProveedores();
            } else {
              alertify.error(data.error);
            }
          } catch (err) {
            alertify.error("Error en la petición");
            console.error(err);
          }
        },
        function () {
          alertify.message("Acción cancelada");
        }
      );
    }

    if (btn.classList.contains("editar")) {
      // obtener proveedor actual
      const res = await fetch("/api/proveedores");
      const data = await res.json();
      const proveedor = data.data.find((p) => p.id == id);

      mostrarFormularioProveedor(
        "Editar proveedor",
        proveedor,
        async (nuevo) => {
          const res = await fetch(`/api/proveedores/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevo),
          });
          const data = await res.json();
          if (data.success) {
            alertify.success("Proveedor actualizado");
            cargarProveedores();
          } else alertify.error(data.error);
        }
      );
    }
  });

  // Función para mostrar formulario con alertify
  function mostrarFormularioProveedor(titulo, proveedor = {}, onSubmit) {
    const html = `
    <div class="form-group">
      <label>Nombre</label>
      <input id="nombre" class="form-control" value="${proveedor.nombre || ""}">
    </div>
    <div class="form-group mt-2">
      <label>RNC</label>
      <input id="rnc" class="form-control" value="${proveedor.rnc || ""}">
    </div>
    <div class="form-group mt-2">
      <label>Teléfono</label>
      <input id="telefono" class="form-control" value="${
        proveedor.telefono || ""
      }">
    </div>
    <div class="form-group mt-2">
      <label>Email</label>
      <input id="email" class="form-control" value="${proveedor.email || ""}">
    </div>
    <div class="form-group mt-2">
      <label>Estado</label>
      <select id="estado" class="form-select">
        <option value="activo" ${
          proveedor.estado === "activo" ? "selected" : ""
        }>Activo</option>
        <option value="inactivo" ${
          proveedor.estado === "inactivo" ? "selected" : ""
        }>Inactivo</option>
      </select>
    </div>
  `;

    alertify.confirm(
      titulo,
      html,
      function () {
        const nuevoProveedor = {
          nombre: document.getElementById("nombre").value.trim(),
          rnc: document.getElementById("rnc").value.trim(),
          telefono: document.getElementById("telefono").value.trim(),
          email: document.getElementById("email").value.trim(),
          estado: document.getElementById("estado").value,
        };

        if (!nuevoProveedor.nombre)
          return alertify.error("El nombre es obligatorio");

        onSubmit(nuevoProveedor);
      },
      function () {
        alertify.message("Acción cancelada");
      }
    );
  }
});
