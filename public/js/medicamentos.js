const apiBase = '/api/medicamentos';

let editingId = null;

async function fetchMedicamentos() {
  const res = await fetch(apiBase);
  const data = await res.json();
  return data.success ? data.data : [];
}

function renderTable(meds) {
  const tbody = document.querySelector('#medicamentos-table tbody');
  tbody.innerHTML = '';
  meds.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${m.nombre || ''}</td>
      <td>${m.nombre_generico || ''}</td>
      <td>${m.precio_venta ?? ''}</td>
      <td>${m.stock_minimo ?? ''}</td>
      <td>${m.estado || ''}</td>
      <td>
        <button class="btn-edit btn btn-sm btn-outline-secondary" data-id="${m.id}">Editar</button>
        <button class="btn-delete btn btn-sm btn-outline-danger" data-id="${m.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // attach delete handlers
  document.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if (!confirm('Eliminar medicamento id ' + id + '?')) return;
    await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
    loadAndRender();
  }));

  // attach edit handlers
  document.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    await enterEditMode(id);
  }));
}

async function enterEditMode(id) {
  try {
    const res = await fetch(`${apiBase}/${id}`);
    const data = await res.json();
    if (!data.success) return alert('No se pudo obtener el medicamento');
    const m = data.data;
    // populate form
    document.getElementById('medicamento-id').value = m.id;
    document.getElementById('medicamento-nombre').value = m.nombre || '';
    document.getElementById('medicamento-nombre-generico').value = m.nombre_generico || '';
    document.getElementById('medicamento-precio-compra').value = m.precio_compra ?? '';
    document.getElementById('medicamento-precio-venta').value = m.precio_venta ?? '';

    editingId = m.id;
    document.getElementById('medicamento-submit').textContent = 'Actualizar';
    document.getElementById('medicamento-cancel').classList.remove('d-none');
  } catch (err) {
    console.error(err);
    alert('Error al cargar datos');
  }
}

function exitEditMode() {
  editingId = null;
  const form = document.getElementById('medicamento-form');
  form.reset();
  document.getElementById('medicamento-id').value = '';
  document.getElementById('medicamento-submit').textContent = 'Crear';
  document.getElementById('medicamento-cancel').classList.add('d-none');
}

async function loadAndRender() {
  const meds = await fetchMedicamentos();
  renderTable(meds);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('medicamento-form');
  const cancelBtn = document.getElementById('medicamento-cancel');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const body = Object.fromEntries(formData.entries());
      // Convert numeric fields
      if (body.precio_compra) body.precio_compra = parseFloat(body.precio_compra);
      if (body.precio_venta) body.precio_venta = parseFloat(body.precio_venta);
      if (body.stock_minimo) body.stock_minimo = parseInt(body.stock_minimo, 10);

      try {
        if (editingId || body.id) {
          const id = editingId || body.id;
          const res = await fetch(`${apiBase}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!data.success) return alert('Error: ' + (data.error || 'No actualizado'));
          exitEditMode();
          loadAndRender();
        } else {
          const res = await fetch(apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!data.success) return alert('Error: ' + (data.error || 'No creado'));
          form.reset();
          loadAndRender();
        }
      } catch (err) {
        console.error(err);
        alert('Error de red');
      }
    });

    cancelBtn.addEventListener('click', () => exitEditMode());
  }

  loadAndRender();
});
