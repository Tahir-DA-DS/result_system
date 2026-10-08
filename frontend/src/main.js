// App start: styles, slow-server banner, offline support, router.
import './styles/main.css';
import { startRouter } from './router.js';

const banner = document.getElementById('banner');
addEventListener('api:slow', e => {
  banner.hidden = !e.detail;
  banner.textContent = 'Waking up the server… the first request after a quiet period can take up to a minute.';
});

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js');
startRouter();
