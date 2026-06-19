const API = '/api/entries';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('entry-form');
  const dateInput = document.getElementById('date');
  const nombreInput = document.getElementById('nombre');
  const raceInput = document.getElementById('race');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const formTitle = document.getElementById('form-title');
  const tbody = document.getElementById('entries-table');
  const emptyMsg = document.getElementById('empty-message');
  const entryCount = document.getElementById('entry-count');
  const clearAllBtn = document.getElementById('clear-all');

  const confirmModal = document.getElementById('confirm-modal');
  const clearModal = document.getElementById('clear-modal');
  const confirmDelete = document.getElementById('confirm-delete');
  const cancelDelete = document.getElementById('cancel-delete');
  const confirmClear = document.getElementById('confirm-clear');
  const cancelClear = document.getElementById('cancel-clear');

  let entries = [];
  let editingId = null;
  let deleteTargetId = null;
  let sortKey = 'date';
  let sortDir = 'desc';

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr.slice(0, 10) + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  async function fetchEntries() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Erreur réseau');
      entries = await res.json();
    } catch (err) {
      entries = [];
      console.error('Impossible de charger les données:', err);
    }
    render();
  }

  async function addEntry(date, nombre, race) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, nombre, race })
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout");
      await fetchEntries();
    } catch (err) {
      alert("Erreur : impossible d'ajouter l'entrée");
    }
  }

  async function updateEntry(id, date, nombre, race) {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, nombre, race })
      });
      if (!res.ok) throw new Error('Erreur lors de la modification');
      await fetchEntries();
    } catch (err) {
      alert('Erreur : impossible de modifier lentrée');
    }
  }

  async function deleteEntry(id) {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      await fetchEntries();
    } catch (err) {
      alert('Erreur : impossible de supprimer lentrée');
    }
  }

  async function clearAllEntries() {
    try {
      const res = await fetch(API, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      await fetchEntries();
    } catch (err) {
      alert('Erreur : impossible de tout supprimer');
    }
  }

  function getSortValue(entry, key) {
    if (key === 'date') return entry.date;
    if (key === 'nombre') return entry.nombre;
    if (key === 'race') return entry.race.toLowerCase();
    return '';
  }

  function sortEntries() {
    entries.sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function updateSortIndicators() {
    document.querySelectorAll('thead th.sortable').forEach(th => {
      const key = th.dataset.sort;
      th.classList.toggle('active', key === sortKey);
      const span = th.querySelector('.sort-indicator');
      if (key === sortKey) {
        span.textContent = sortDir === 'asc' ? '▲' : '▼';
      } else {
        span.textContent = '';
      }
    });
  }

  function render() {
    sortEntries();
    updateSortIndicators();
    tbody.innerHTML = '';
    entryCount.textContent = `${entries.length} entrée(s)`;

    if (entries.length === 0) {
      emptyMsg.style.display = 'block';
      clearAllBtn.style.display = 'none';
      return;
    }

    emptyMsg.style.display = 'none';
    clearAllBtn.style.display = 'inline-block';

    entries.forEach(entry => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(entry.date)}</td>
        <td><strong>${entry.nombre}</strong></td>
        <td>${entry.race}</td>
        <td class="actions">
          <button class="btn-icon edit" data-id="${entry.id}">✏️ Modifier</button>
          <button class="btn-icon delete" data-id="${entry.id}">🗑️ Supprimer</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function resetForm() {
    form.reset();
    editingId = null;
    submitBtn.textContent = 'Ajouter';
    formTitle.textContent = 'Ajouter une sortie';
    cancelBtn.style.display = 'none';
    dateInput.value = getToday();
  }

  function fillForm(entry) {
    dateInput.value = entry.date.slice(0, 10);
    nombreInput.value = entry.nombre;
    raceInput.value = entry.race;
    editingId = entry.id;
    submitBtn.textContent = 'Modifier';
    formTitle.textContent = 'Modifier la sortie';
    cancelBtn.style.display = 'inline-block';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = dateInput.value;
    const nombre = parseInt(nombreInput.value, 10);
    const race = raceInput.value;
    if (!date || !nombre || !race) return;

    if (editingId) {
      await updateEntry(editingId, date, nombre, race);
    } else {
      await addEntry(date, nombre, race);
    }
    resetForm();
  });

  cancelBtn.addEventListener('click', resetForm);

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-icon');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.classList.contains('edit')) {
      const entry = entries.find(e => e.id === id);
      if (entry) fillForm(entry);
    } else if (btn.classList.contains('delete')) {
      deleteTargetId = id;
      confirmModal.style.display = 'flex';
    }
  });

  confirmDelete.addEventListener('click', async () => {
    if (deleteTargetId) {
      await deleteEntry(deleteTargetId);
      deleteTargetId = null;
    }
    confirmModal.style.display = 'none';
    if (entries.length === 0) resetForm();
  });

  cancelDelete.addEventListener('click', () => {
    deleteTargetId = null;
    confirmModal.style.display = 'none';
  });

  clearAllBtn.addEventListener('click', () => clearModal.style.display = 'flex');

  confirmClear.addEventListener('click', async () => {
    await clearAllEntries();
    clearModal.style.display = 'none';
    resetForm();
  });

  cancelClear.addEventListener('click', () => clearModal.style.display = 'none');

  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      deleteTargetId = null;
      confirmModal.style.display = 'none';
    }
  });

  clearModal.addEventListener('click', (e) => {
    if (e.target === clearModal) clearModal.style.display = 'none';
  });

  document.querySelectorAll('thead th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortDir = 'asc';
      }
      render();
    });
  });

  dateInput.value = getToday();
  fetchEntries();
});
