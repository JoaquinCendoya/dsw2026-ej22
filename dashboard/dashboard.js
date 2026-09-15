document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const mobileScrim = document.getElementById('mobile-scrim');
  const logout = document.getElementById('logout');
  const search = document.getElementById('doctor-search');
  const rows = [...document.querySelectorAll('#doctor-table-body tr')];
  const resultsCount = document.getElementById('results-count');
  const toast = document.getElementById('toast');
  let toastTimer;

  const isMobile = () => window.matchMedia('(max-width: 700px)').matches;

  const closeMenu = () => {
    sidebar.classList.remove('is-open');
    mobileScrim.classList.remove('is-visible');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    if (!isMobile()) return;
    const open = sidebar.classList.toggle('is-open');
    mobileScrim.classList.toggle('is-visible', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  sidebarClose.addEventListener('click', closeMenu);
  mobileScrim.addEventListener('click', closeMenu);
  window.addEventListener('resize', () => { if (!isMobile()) closeMenu(); });
  document.querySelectorAll('.sidebar .nav-link:not(.nav-link--button)').forEach((link) => {
    link.addEventListener('click', () => { if (isMobile()) closeMenu(); });
  });

  logout.addEventListener('click', () => {
    sessionStorage.removeItem('medportal-authenticated');
    window.location.href = '../login/index.html';
  });

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3000);
  };

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      showToast(button.dataset.action === 'doctor' ? 'El formulario para agregar un doctor estará disponible próximamente.' : 'El formulario para agregar una especialidad estará disponible próximamente.');
    });
  });

  document.querySelectorAll('.row-action').forEach((button) => {
    button.addEventListener('click', () => showToast(`Acciones del profesional: ${button.closest('tr').querySelector('strong').textContent}`));
  });

  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    let visibleRows = 0;
    rows.forEach((row) => {
      const matches = row.dataset.doctor.includes(query);
      row.hidden = !matches;
      if (matches) visibleRows += 1;
    });
    resultsCount.textContent = query ? `Mostrando ${visibleRows} resultado${visibleRows === 1 ? '' : 's'} de 124` : 'Mostrando 1 a 3 de 124 resultados';
  });
});
