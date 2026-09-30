document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const mobileScrim = document.getElementById('mobile-scrim');
  const logout = document.getElementById('logout');
  const specialtyListing = document.getElementById('specialty-listing');
  const specialtyFormView = document.getElementById('specialty-form-view');
  const specialtyForm = document.getElementById('specialty-form');
  const specialtyName = document.getElementById('specialty-name');
  const specialtyDescription = document.getElementById('specialty-description');
  const specialtyStatus = document.getElementById('specialty-status');
  const specialtyFormTitle = document.getElementById('specialty-form-title');
  const formModeLabel = document.getElementById('form-mode-label');
  const saveSpecialtyLabel = document.getElementById('save-specialty-label');
  const specialtyTableBody = document.getElementById('specialty-table-body');
  const specialtySearch = document.getElementById('specialty-search');
  const specialtyCount = document.getElementById('specialty-count');
  const totalSpecialties = document.getElementById('total-specialties');
  const newSpecialtyCount = document.getElementById('new-specialty-count');
  const latestNewSpecialty = document.getElementById('latest-new-specialty');
  const storageKey = 'medportal-specialties';
  const deletedStorageKey = 'medportal-deleted-specialties';
  const isMobile = () => window.matchMedia('(max-width: 700px)').matches;
  const navLinks = [...document.querySelectorAll('.sidebar .nav-link:not(.nav-link--button)')];
  const readArray = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };
  const writeArray = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };
  let savedSpecialties = readArray(storageKey);
  let removedSpecialties = readArray(deletedStorageKey);
  let editingRow = null;
  let formReturnTarget = null;

  const removedSpecialtyKeys = new Set(removedSpecialties);
  specialtyTableBody.querySelectorAll('tr').forEach((row) => {
    const key = JSON.stringify([row.querySelector('strong')?.textContent ?? '', row.cells[1]?.textContent ?? '']);
    if (removedSpecialtyKeys.has(key)) row.remove();
  });

  const updateActiveLink = () => {
    const activeLink = navLinks.find((link) => {
      const destination = new URL(link.href);
      return destination.pathname === window.location.pathname && destination.hash === window.location.hash;
    });

    if (!activeLink) return;
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link === activeLink);
      if (link === activeLink) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  updateActiveLink();
  window.addEventListener('hashchange', updateActiveLink);

  const createSpecialtyRow = ({ name, description, status }) => {
    const row = document.createElement('tr');
    row.dataset.savedSpecialty = 'true';
    const nameCell = document.createElement('td');
    const nameWrap = document.createElement('div');
    const avatar = document.createElement('span');
    const nameText = document.createElement('strong');
    nameWrap.className = 'doctor-name';
    avatar.className = 'avatar avatar--james';
    avatar.textContent = name.trim().charAt(0).toUpperCase();
    nameText.textContent = name;
    nameWrap.append(avatar, nameText);
    nameCell.append(nameWrap);

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = description;
    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `availability ${status === 'active' ? 'availability--active' : 'availability--leave'}`;
    const indicator = document.createElement('i');
    badge.append(indicator, document.createTextNode(status === 'active' ? 'Active' : 'Inactive'));
    statusCell.append(badge);
    const actionsCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'row-action';
    editButton.dataset.action = 'edit';
    editButton.textContent = '✎';
    editButton.setAttribute('aria-label', `Editar ${name}`);
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'row-action';
    deleteButton.dataset.action = 'delete';
    deleteButton.setAttribute('aria-label', `Eliminar ${name}`);
    const deleteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    deleteIcon.setAttribute('viewBox', '0 0 24 24');
    deleteIcon.setAttribute('aria-hidden', 'true');
    const deletePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    deletePath.setAttribute('d', 'M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3');
    deleteIcon.append(deletePath);
    deleteButton.append(deleteIcon);
    actionsCell.append(editButton, deleteButton);
    row.append(nameCell, descriptionCell, statusCell, actionsCell);
    return row;
  };

  const appendSpecialtyRow = (specialty, prepend = false) => {
    const row = createSpecialtyRow(specialty);
    if (prepend) specialtyTableBody.prepend(row);
    else specialtyTableBody.append(row);
    return row;
  };

  const updateSpecialtyCounts = () => {
    const rows = [...specialtyTableBody.rows];
    const totalCount = rows.length;
    const visibleCount = rows.filter((row) => !row.hidden).length;
    const now = new Date();
    const addedThisMonth = savedSpecialties
      .filter((specialty) => {
        if (!specialty.createdAt) return false;
        const createdAt = new Date(specialty.createdAt);
        return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
      })
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
    specialtyCount.textContent = specialtySearch.value.trim()
      ? `Mostrando ${visibleCount} de ${totalCount} especialidades`
      : `Mostrando ${totalCount} de ${totalCount}`;
    totalSpecialties.textContent = String(totalCount);
    newSpecialtyCount.textContent = String(addedThisMonth.length).padStart(2, '0');
    latestNewSpecialty.textContent = addedThisMonth[0]?.name ?? 'Sin nuevas';
  };

  const applySpecialtySearch = () => {
    const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const query = normalize(specialtySearch.value.trim());
    [...specialtyTableBody.rows].forEach((row) => {
      row.hidden = !normalize(`${row.cells[0].textContent} ${row.cells[1].textContent}`).includes(query);
    });
    updateSpecialtyCounts();
  };

  savedSpecialties.forEach((specialty) => appendSpecialtyRow(specialty));
  updateSpecialtyCounts();
  specialtySearch.addEventListener('input', applySpecialtySearch);

  const closeSpecialtyForm = () => {
    specialtyFormView.hidden = true;
    specialtyListing.hidden = false;
    const focusTarget = formReturnTarget?.isConnected ? formReturnTarget : document.getElementById('new-specialty');
    editingRow = null;
    formReturnTarget = null;
    focusTarget.focus();
  };

  const openSpecialtyForm = (specialty = null, row = null, returnTarget = null) => {
    editingRow = row;
    formReturnTarget = returnTarget ?? document.getElementById('new-specialty');
    specialtyForm.reset();
    specialtyName.value = specialty?.name ?? '';
    specialtyDescription.value = specialty?.description ?? '';
    specialtyStatus.value = specialty?.status ?? 'active';
    const editing = Boolean(row);
    specialtyFormTitle.textContent = editing ? 'Editar Especialidad' : 'Registrar Nueva Especialidad';
    formModeLabel.textContent = editing ? 'Editar Especialidad' : 'Agregar Nueva Especialidad';
    saveSpecialtyLabel.textContent = editing ? 'Guardar Cambios' : 'Guardar Especialidad';
    specialtyListing.hidden = true;
    specialtyFormView.hidden = false;
    specialtyName.focus();
  };

  document.getElementById('new-specialty').addEventListener('click', () => openSpecialtyForm());
  document.getElementById('cancel-specialty').addEventListener('click', closeSpecialtyForm);
  document.getElementById('form-back-link').addEventListener('click', closeSpecialtyForm);

  specialtyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const specialty = {
      name: specialtyName.value.trim(),
      description: specialtyDescription.value.trim(),
      status: specialtyStatus.value,
    };

    if (editingRow) {
      const original = {
        name: editingRow.querySelector('strong')?.textContent ?? '',
        description: editingRow.cells[1]?.textContent ?? '',
        status: editingRow.querySelector('.availability--active') ? 'active' : 'inactive',
      };

      if (editingRow.dataset.savedSpecialty) {
        const index = savedSpecialties.findIndex((item) => item.name === original.name && item.description === original.description && item.status === original.status);
        if (index !== -1) {
          savedSpecialties[index] = { ...specialty, ...(savedSpecialties[index].createdAt ? { createdAt: savedSpecialties[index].createdAt } : {}) };
        }
        else savedSpecialties.unshift(specialty);
      } else {
        const originalKey = JSON.stringify([original.name, original.description]);
        if (!removedSpecialties.includes(originalKey)) removedSpecialties.push(originalKey);
        savedSpecialties.unshift(specialty);
        writeArray(deletedStorageKey, removedSpecialties);
      }

      writeArray(storageKey, savedSpecialties);
      const updatedRow = createSpecialtyRow(specialty);
      editingRow.replaceWith(updatedRow);
      formReturnTarget = updatedRow.querySelector('[data-action="edit"]');
    } else {
      specialty.createdAt = new Date().toISOString();
      savedSpecialties.unshift(specialty);
      writeArray(storageKey, savedSpecialties);
      formReturnTarget = appendSpecialtyRow(specialty, true).querySelector('[data-action="edit"]');
    }

    applySpecialtySearch();
    closeSpecialtyForm();
  });

  specialtyTableBody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || !specialtyTableBody.contains(button)) return;

    const row = button.closest('tr');
    const name = row.querySelector('strong')?.textContent ?? '';
    const description = row.cells[1]?.textContent ?? '';

    if (button.dataset.action === 'edit') {
      const status = row.querySelector('.availability--active') ? 'active' : 'inactive';
      openSpecialtyForm({ name, description, status }, row, button);
      return;
    }
    if (button.dataset.action !== 'delete') return;

    if (row.dataset.savedSpecialty) {
      const status = row.querySelector('.availability--active') ? 'active' : 'inactive';
      const index = savedSpecialties.findIndex((item) => item.name === name && item.description === description && item.status === status);
      if (index !== -1) savedSpecialties.splice(index, 1);
      writeArray(storageKey, savedSpecialties);
    } else {
      const key = JSON.stringify([name, description]);
      if (!removedSpecialties.includes(key)) removedSpecialties.push(key);
      writeArray(deletedStorageKey, removedSpecialties);
    }

    row.remove();
    applySpecialtySearch();
  });

  const setMenuOpen = (open) => {
    sidebar.classList.toggle('is-open', open);
    mobileScrim.classList.toggle('is-visible', open);
    mobileScrim.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
  };

  menuToggle.addEventListener('click', () => {
    if (isMobile()) setMenuOpen(!sidebar.classList.contains('is-open'));
  });

  sidebarClose.addEventListener('click', () => setMenuOpen(false));
  mobileScrim.addEventListener('click', () => setMenuOpen(false));

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (isMobile()) setMenuOpen(false);
    });
  });

  window.addEventListener('resize', () => {
    if (!isMobile()) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
      setMenuOpen(false);
      menuToggle.focus();
    } else if (event.key === 'Escape' && !specialtyFormView.hidden) {
      closeSpecialtyForm();
    }
  });

  logout.addEventListener('click', () => {
    sessionStorage.removeItem('medportal-authenticated');
    window.location.href = '../login/index.html';
  });
});
