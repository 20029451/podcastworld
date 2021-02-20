'use strict';

const logoutEl = document.getElementById('logout');

if(logoutEl) {
  logoutEl.addEventListener('click', () => {
    fetch('/sessions/current', { method: 'DELETE' })
    .then(() => window.location = '/'); //Provare a sostituire /login con /
  });
  //logoutEl.style.display = none;
}
