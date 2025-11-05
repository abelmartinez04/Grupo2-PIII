const apiBase = '/api/medicamentos';

async function fetchMedicamentos() {
  const res = await fetch(apiBase);
  const data = await res.json();
  return data.success ? data.data : [];
}

function renderTable(meds) {
  const tbody = document.querySelector('#medicamentos-table tbody');
  tbody.innerHTML = '';

  meds.forEach(m => {
    const estadoClass =
      m.estado_stock === 'Agotado' ? 'text-danger fw-bold' :
      m.estado_stock === 'Stock Bajo' ? 'text-warning fw-bold' :
      'text-success fw-bold';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${m.nombre}</td>
      <td>${m.nombre_generico || ''}</td>
      <td>${m.categoria || ''}</td>
      <td>${m.stock_total ?? 0}</td>
      <td class="${estadoClass}">${m.estado_stock}</td>
      <td>${m.precio_venta?.toFixed(2) ?? ''}</td>
      <td>
        <button class="btn btn-sm btn-warning btn-editar" data-id="${m.id}">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${m.id}">
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
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      openEditModal(id);
    });
  });

  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      deleteMedicamento(id);
    });
  });
}


async function loadAndRender() {
  const meds = await fetchMedicamentos();
  renderTable(meds);
}

// 🟩 Crear nuevo medicamento con lote
document.getElementById('btn-nuevo').addEventListener('click', openCreateModal);

async function openCreateModal() {
  // Obtener proveedores activos
  const proveedoresRes = await fetch('/api/proveedores');
  const proveedoresData = await proveedoresRes.json();
  const proveedores = proveedoresData.success ? proveedoresData.data : [];

  // Obtener categorías activas
  const categoriasRes = await fetch('/api/categorias');
  const categoriasData = await categoriasRes.json();
  const categorias = categoriasData.success ? categoriasData.data : [];

  // Construir opciones de proveedor
  const opcionesProveedor = proveedores.length
    ? proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')
    : '<option value="">No hay proveedores activos</option>';

  // Construir opciones de categoría
  const opcionesCategoria = categorias.length
    ? categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')
    : '<option value="">No hay categorías activas</option>';

  const formHtml = `
    <div class="p-2 text-start">
      <input id="nombre" class="form-control mb-2" placeholder="Nombre del medicamento">
      <input id="nombre_generico" class="form-control mb-2" placeholder="Nombre genérico">
      
      <label class="form-label">Categoría</label>
      <select id="categoria_id" class="form-select mb-2">
        <option value="">Seleccione una categoría</option>
        ${opcionesCategoria}
      </select>

      <input id="numero_lote" class="form-control mb-2" placeholder="Número de lote">
      <input id="cantidad" type="number" class="form-control mb-2" placeholder="Cantidad">
      <input id="precio_compra" type="number" step="0.01" class="form-control mb-2" placeholder="Precio compra">
      <input id="precio_venta" type="number" step="0.01" class="form-control mb-2" placeholder="Precio venta">

      <label class="form-label">Proveedor</label>
      <select id="proveedor_id" class="form-select mb-2">
        <option value="">Seleccione un proveedor</option>
        ${opcionesProveedor}
      </select>

      <label class="form-label">Fecha de vencimiento</label>
      <input id="fecha_vencimiento" type="date" class="form-control mb-2">
    </div>
  `;

  alertify.confirm(
    'Registrar nuevo medicamento',
    formHtml,
    async function () {
      const body = {
        nombre: document.getElementById('nombre').value.trim(),
        nombre_generico: document.getElementById('nombre_generico').value.trim(),
        categoria_id: parseInt(document.getElementById('categoria_id').value),
        numero_lote: document.getElementById('numero_lote').value.trim(),
        cantidad: parseInt(document.getElementById('cantidad').value),
        precio_compra: parseFloat(document.getElementById('precio_compra').value),
        precio_venta: parseFloat(document.getElementById('precio_venta').value),
        proveedor_id: parseInt(document.getElementById('proveedor_id').value),
        fecha_vencimiento: document.getElementById('fecha_vencimiento').value
      };

      if (!body.nombre || !body.numero_lote || isNaN(body.cantidad) || isNaN(body.proveedor_id)) {
        return alertify.alert('Campos requeridos', 'Debes llenar todos los campos obligatorios.');
      }

      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        alertify.success('Medicamento registrado con éxito');
        loadAndRender();
      } else {
        alertify.error(data.error || 'Error al registrar');
      }
    },
    function () {
      alertify.message('Cancelado');
    }
  ).set('labels', { ok: 'Guardar', cancel: 'Cancelar' });
}

async function openEditModal(id) {
  const res = await fetch(`${apiBase}/${id}`);
  const data = await res.json();
  if (!data.success) return alertify.error('Error al obtener los datos');

  const m = data.data;

  // Obtener listas de categorías y proveedores
  const [categoriasRes, proveedoresRes] = await Promise.all([
    fetch('/api/categorias'),
    fetch('/api/proveedores')
  ]);

  const categoriasData = await categoriasRes.json();
  const proveedoresData = await proveedoresRes.json();

  const categorias = categoriasData.success ? categoriasData.data : [];
  const proveedores = proveedoresData.success ? proveedoresData.data : [];

  const opcionesCategoria = categorias.map(c => 
    `<option value="${c.id}" ${c.id === m.categoria_id ? 'selected' : ''}>${c.nombre}</option>`
  ).join('');

  const opcionesProveedor = proveedores.map(p => 
    `<option value="${p.id}" ${p.id === m.proveedor_id ? 'selected' : ''}>${p.nombre}</option>`
  ).join('');

  const formHtml = `
    <div class="p-2 text-start">
      <input id="nombre" class="form-control mb-2" value="${m.nombre}" placeholder="Nombre del medicamento">
      <input id="nombre_generico" class="form-control mb-2" value="${m.nombre_generico || ''}" placeholder="Nombre genérico">
      
      <label class="form-label">Categoría</label>
      <select id="categoria_id" class="form-select mb-2">
        ${opcionesCategoria}
      </select>

      <input id="numero_lote" class="form-control mb-2" value="${m.numero_lote || ''}" placeholder="Número de lote">
      <input id="cantidad" type="number" class="form-control mb-2" value="${m.cantidad || 0}" placeholder="Cantidad">
      <input id="precio_compra" type="number" step="0.01" class="form-control mb-2" value="${m.precio_compra || 0}" placeholder="Precio compra">
      <input id="precio_venta" type="number" step="0.01" class="form-control mb-2" value="${m.precio_venta || 0}" placeholder="Precio venta">

      <label class="form-label">Proveedor</label>
      <select id="proveedor_id" class="form-select mb-2">
        ${opcionesProveedor}
      </select>

      <label class="form-label">Fecha de vencimiento</label>
      <input id="fecha_vencimiento" type="date" class="form-control mb-2" value="${m.fecha_vencimiento ? m.fecha_vencimiento.split('T')[0] : ''}">
    </div>
  `;

  alertify.confirm(
    'Editar medicamento',
    formHtml,
    async function () {
      const body = {
        nombre: document.getElementById('nombre').value.trim(),
        nombre_generico: document.getElementById('nombre_generico').value.trim(),
        categoria_id: parseInt(document.getElementById('categoria_id').value),
        numero_lote: document.getElementById('numero_lote').value.trim(),
        cantidad: parseInt(document.getElementById('cantidad').value),
        precio_compra: parseFloat(document.getElementById('precio_compra').value),
        precio_venta: parseFloat(document.getElementById('precio_venta').value),
        proveedor_id: parseInt(document.getElementById('proveedor_id').value),
        fecha_vencimiento: document.getElementById('fecha_vencimiento').value
      };

      const updateRes = await fetch(`${apiBase}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const updateData = await updateRes.json();
      if (updateData.success) {
        alertify.success('Medicamento actualizado con éxito');
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


async function deleteMedicamento(id) {
  alertify.confirm(
    'Eliminar medicamento',
    '¿Seguro que deseas eliminar este medicamento?',
    async function () {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alertify.success('Eliminado correctamente');
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
