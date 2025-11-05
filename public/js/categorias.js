const apiBase = '/api/categorias';

async function fetchCategorias() {
  const res = await fetch(apiBase);
  const data = await res.json();
  return data.success ? data.data : [];
}

function renderTable(categorias) {
  const tbody = document.querySelector('#categorias-table tbody');
  tbody.innerHTML = '';

  categorias.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>${c.descripcion || ''}</td>
      <td>
        <button class="btn btn-sm btn-warning btn-editar" data-id="${c.id}">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${c.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  addEventListeners();
}

function addEventListeners() {
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => deleteCategoria(btn.dataset.id));
  });
}

async function loadAndRender() {
  const categorias = await fetchCategorias();
  renderTable(categorias);
}

// 🟩 Crear nueva categoría
document.getElementById('btn-nueva').addEventListener('click', openCreateModal);

function openCreateModal() {
  const formHtml = `
    <div class="p-2 text-start">
      <input id="nombre" class="form-control mb-2" placeholder="Nombre de la categoría">
      <textarea id="descripcion" class="form-control mb-2" placeholder="Descripción"></textarea>
    </div>
  `;

  alertify.confirm(
    'Nueva categoría',
    formHtml,
    async function () {
      const body = {
        nombre: document.getElementById('nombre').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
      };

      if (!body.nombre) {
        return alertify.alert('Error', 'El nombre es obligatorio.');
      }

      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        alertify.success('Categoría creada');
        loadAndRender();
      } else {
        alertify.error(data.error || 'Error al crear');
      }
    },
    function () {
      alertify.message('Cancelado');
    }
  ).set('labels', { ok: 'Guardar', cancel: 'Cancelar' });
}

// 🟨 Editar categoría
async function openEditModal(id) {
  const res = await fetch(`${apiBase}/${id}`);
  const data = await res.json();
  if (!data.success) return alertify.error('No se pudo obtener la categoría');

  const c = data.data;

  const formHtml = `
    <div class="p-2 text-start">
      <input id="nombre" class="form-control mb-2" value="${c.nombre}" placeholder="Nombre de la categoría">
      <textarea id="descripcion" class="form-control mb-2" placeholder="Descripción">${c.descripcion || ''}</textarea>
    </div>
  `;

  alertify.confirm(
    'Editar categoría',
    formHtml,
    async function () {
      const body = {
        nombre: document.getElementById('nombre').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
      };

      const updateRes = await fetch(`${apiBase}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const updateData = await updateRes.json();
      if (updateData.success) {
        alertify.success('Categoría actualizada');
        loadAndRender();
      } else {
        alertify.error(updateData.error || 'Error al actualizar');
      }
    },
    function () {
      alertify.message('Cancelado');
    }
  ).set('labels', { ok: 'Guardar cambios', cancel: 'Cancelar' });
}

// 🟥 Eliminar categoría
async function deleteCategoria(id) {
  alertify.confirm(
    'Eliminar categoría',
    '¿Seguro que deseas eliminar esta categoría?',
    async function () {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        alertify.success('Eliminada correctamente');
        loadAndRender();
      } else {
        alertify.error(data.error || 'Error al eliminar');
      }
    },
    function () {
      alertify.message('Cancelado');
    }
  );
}

document.addEventListener('DOMContentLoaded', loadAndRender);
