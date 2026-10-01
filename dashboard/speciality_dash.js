import { initStorage, getSpecialties, saveSpecialty } from './storage.js';

// 1. AÑADIDO 'async' AQUÍ PARA PODER USAR await
document.addEventListener('DOMContentLoaded', async () => {
  await initStorage();

  // 1. CAPTURA DE ELEMENTOS DOM
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const mobileScrim = document.getElementById('mobile-scrim');
  const logout = document.getElementById('logout');
  const navLinks = [...document.querySelectorAll('.sidebar .nav-link:not(.nav-link--button)')];

  const specialtyFormView = document.getElementById('specialty-form-view');
  const specialtyListing = document.getElementById('specialty-listing');
  const specialtyForm = document.getElementById('specialty-form');
  const specialtyName = document.getElementById('specialty-name');
  const specialtyDescription = document.getElementById('specialty-description');
  const specialtyStatus = document.getElementById('specialty-status');
  const specialtyTableBody = document.getElementById('specialty-table-body');
  
  // Elementos de paginación
  const prevBtn = document.querySelector('.pagination button[aria-label="Página anterior"]');
  const nextBtn = document.querySelector('.pagination button[aria-label="Página siguiente"]');
  const resultsCount = document.getElementById('results-count');

  // Botones de control de vistas (Añadido)
  const btnNewSpecialty = document.getElementById('new-specialty');
  const btnCancelSpecialty = document.getElementById('cancel-specialty');
  const btnFormBack = document.getElementById('form-back-link');

  // 2. ESTADO
  let currentPage = 1;
  const itemsPerPage = 5;
  const isMobile = () => window.matchMedia('(max-width: 700px)').matches;

  // 3. FUNCIONES DE INTERFAZ
  const updateActiveLink = () => {
    const activeLink = navLinks.find((link) => {
      const destination = new URL(link.href, window.location.origin);
      return destination.pathname === window.location.pathname && destination.hash === window.location.hash;
    });

    if (!activeLink) return;
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link === activeLink);
      if (link === activeLink) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const createSpecialtyRow = ({ name, description, status }) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="doctor-name">
          <span class="avatar avatar--james">${name.charAt(0).toUpperCase()}</span>
          <strong>${name}</strong>
        </div>
      </td>
      <td>${description}</td>
      <td>
        <span class="availability ${status === 'active' ? 'availability--active' : 'availability--leave'}">
          <i></i>${status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td>
        <button class="row-action" type="button" data-action="edit" aria-label="Editar">✎</button>
        <button class="row-action" type="button" data-action="delete" aria-label="Eliminar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3" /></svg>
        </button>
      </td>
    `;
    return row;
  };

  const renderTable = () => {
    const specialties = getSpecialties();
    const totalItems = specialties.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = specialties.slice(startIndex, startIndex + itemsPerPage);

    if (specialtyTableBody) {
        specialtyTableBody.innerHTML = '';
        paginatedItems.forEach(sp => specialtyTableBody.append(createSpecialtyRow(sp)));
    }

    if (resultsCount) {
        const currentEnd = Math.min(startIndex + itemsPerPage, totalItems);
        resultsCount.textContent = `Mostrando ${totalItems === 0 ? 0 : startIndex + 1} a ${currentEnd} de ${totalItems} resultados`;
    }
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  };

  // Función para alternar entre tabla y formulario
  const toggleViews = (showForm) => {
    if (specialtyFormView && specialtyListing) {
      specialtyFormView.hidden = !showForm;
      specialtyListing.hidden = showForm;
    }
  };

  // 4. EVENTOS DE UI Y ALMACENAMIENTO
  window.addEventListener('hashchange', updateActiveLink);

  // Eventos para abrir/cerrar el formulario
  if (btnNewSpecialty) {
    btnNewSpecialty.addEventListener('click', () => {
      if(specialtyForm) specialtyForm.reset();
      toggleViews(true);
    });
  }

  if (btnCancelSpecialty) btnCancelSpecialty.addEventListener('click', () => toggleViews(false));
  if (btnFormBack) btnFormBack.addEventListener('click', () => toggleViews(false));

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(getSpecialties().length / itemsPerPage);
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });
  }

  if (specialtyForm) {
    specialtyForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const newSpecialty = {
        name: specialtyName.value.trim(),
        description: specialtyDescription.value.trim(),
        status: specialtyStatus?.value || 'active',
      };

      saveSpecialty(newSpecialty);
      specialtyForm.reset();
      
      currentPage = 1; 
      renderTable();
      toggleViews(false);
    });
  }

  // Sidebar Mobile Toggle
  const setMenuOpen = (open) => {
    if (sidebar && mobileScrim && menuToggle) {
        sidebar.classList.toggle('is-open', open);
        mobileScrim.classList.toggle('is-visible', open);
        mobileScrim.setAttribute('aria-hidden', String(!open));
        menuToggle.setAttribute('aria-expanded', String(open));
    }
  };

  if (menuToggle) menuToggle.addEventListener('click', () => { if (isMobile()) setMenuOpen(!sidebar.classList.contains('is-open')); });
  if (sidebarClose) sidebarClose.addEventListener('click', () => setMenuOpen(false));
  if (mobileScrim) mobileScrim.addEventListener('click', () => setMenuOpen(false));
  
  if (logout) {
      logout.addEventListener('click', () => {
        sessionStorage.removeItem('medportal-authenticated');
        window.location.href = '../login/index.html';
      });
  }

  // 5. INICIALIZACIÓN
  updateActiveLink();
  renderTable();
});