document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const passwordToggle = document.getElementById('password-toggle');
  const status = document.getElementById('form-status');

  passwordToggle.addEventListener('click', () => {
    const showingPassword = password.type === 'text';
    password.type = showingPassword ? 'password' : 'text';
    passwordToggle.classList.toggle('is-visible', !showingPassword);
    passwordToggle.setAttribute('aria-label', showingPassword ? 'Mostrar contraseña' : 'Ocultar contraseña');
    passwordToggle.setAttribute('aria-pressed', String(!showingPassword));
  });

  const setError = (input, message) => {
    const group = input.closest('.field-group');
    group.querySelector('.input-wrap').classList.toggle('is-invalid', Boolean(message));
    group.querySelector('.field-error').textContent = message;
  };

  [username, password].forEach((input) => {
    input.addEventListener('input', () => {
      setError(input, '');
      status.textContent = '';
      status.classList.remove('is-success');
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const usernameValue = username.value.trim();
    const passwordValue = password.value;
    let valid = true;

    if (!usernameValue) { setError(username, 'Ingresá tu usuario.'); valid = false; }
    if (!passwordValue) { setError(password, 'Ingresá tu contraseña.'); valid = false; }
    if (!valid) return;

    if (usernameValue === 'admin' && passwordValue === 'password') {
      sessionStorage.setItem('medportal-authenticated', 'true');
      status.textContent = 'Acceso validado. Cargando portal…';
      status.classList.add('is-success');
      window.setTimeout(() => { window.location.href = '../dashboard/index.html'; }, 250);
      return;
    }

    setError(password, 'Revisá tus credenciales e intentá nuevamente.');
    status.textContent = 'El usuario o la contraseña no son correctos.';
  });
});
