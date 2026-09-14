/* GEDEP — conexão compartilhada do Hub
 * Não armazena tokens permanentes. O login é renovado pelo Google quando necessário.
 */
(function () {
  'use strict';

  window.GEDEP_CONFIG = Object.freeze({
    clientId: '747581420442-rkcu9ohb5llcd9g8uirqdnssgisund0u.apps.googleusercontent.com',
    spreadsheetId: '1N-v2Cd-V0TEnfq0GwtYhW_m5N8_QMNbn6nr4u0iH4_E',
    scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets'
  });

  let tokenClient = null;
  let accessToken = null;

  function setStatus(text, error) {
    const el = document.getElementById('gedep-auth-status');
    if (el) {
      el.textContent = text || '';
      el.className = error ? 'gedep-auth-error' : 'gedep-auth-ok';
    }
  }

  function updateUi(email) {
    const logged = Boolean(email);
    document.querySelectorAll('[data-gedep-login]').forEach(el => el.classList.toggle('hidden', logged));
    document.querySelectorAll('[data-gedep-logout]').forEach(el => el.classList.toggle('hidden', !logged));
    document.querySelectorAll('[data-gedep-user]').forEach(el => el.textContent = email || 'Não conectado');
  }

  function saveSession(email) {
    if (email) gedepSessionStorage.setItem('gedep_email', email);
    else gedepSessionStorage.removeItem('gedep_email');
    updateUi(email);
  }

  async function getUserInfo(token) {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('Não foi possível confirmar a conta Google.');
    return response.json();
  }

  function login() {
    setStatus('Carregando autenticação...');
    if (!window.google || !google.accounts || !google.accounts.oauth2) {
      setStatus('A autenticação Google ainda está carregando. Tente novamente.', true);
      return;
    }
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GEDEP_CONFIG.clientId,
      scope: GEDEP_CONFIG.scope,
      callback: async function (response) {
        if (response.error) {
          setStatus('Login cancelado ou recusado.', true);
          return;
        }
        try {
          accessToken = response.access_token;
          const user = await getUserInfo(accessToken);
          const email = String(user.email || '').toLowerCase();
          if (!email) throw new Error('A conta Google não retornou um e-mail.');
          saveSession(email);
          setStatus('Conectado.');
        } catch (error) {
          setStatus(error.message || 'Falha ao confirmar o login.', true);
        }
      }
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  function logout() {
    if (accessToken && window.google && google.accounts && google.accounts.oauth2) {
      google.accounts.oauth2.revoke(accessToken);
    }
    accessToken = null;
    saveSession(null);
    setStatus('Desconectado.');
  }

  function init() {
    const email = gedepSessionStorage.getItem('gedep_email') || '';
    updateUi(email);
    document.querySelectorAll('[data-gedep-login]').forEach(el => el.addEventListener('click', login));
    document.querySelectorAll('[data-gedep-logout]').forEach(el => el.addEventListener('click', logout));
  }

  window.gedepSharedLogin = login;
  window.gedepSharedLogout = logout;
  window.gedepSharedGetEmail = () => gedepSessionStorage.getItem('gedep_email') || '';
  window.gedepSharedGetToken = () => accessToken;
  window.addEventListener('DOMContentLoaded', init);
})();
