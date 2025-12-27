
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA installability
function showUpdateBanner() {
  const id = 'ls-update-banner';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.textContent = `#${id}{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:9999;background:#1b1b1b;color:#fff;border:1px solid #2a2a2a;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.4);padding:12px 14px;display:flex;gap:10px;align-items:center;font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}#${id} .btn{padding:8px 10px;border-radius:8px;border:none;cursor:pointer}#${id} .primary{background:#E50914;color:#fff}#${id} .ghost{background:transparent;color:#cfcfcf}`;
  document.head.appendChild(style);
  const bar = document.createElement('div');
  bar.id = id;
  bar.innerHTML = `<span>New version available</span><button class="btn primary" id="ls-update-reload">Reload</button><button class="btn ghost" id="ls-update-dismiss">Dismiss</button>`;
  document.body.appendChild(bar);
  document.getElementById('ls-update-reload')?.addEventListener('click', () => window.location.reload());
  document.getElementById('ls-update-dismiss')?.addEventListener('click', () => bar.remove());
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const ver = (import.meta as any).env?.VITE_BUILD_VERSION || Date.now().toString();
    const swUrl = `/sw.js?v=${ver}`;
    navigator.serviceWorker.register(swUrl).then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    }).catch(() => {});

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // When the new SW takes control, reload to get fresh content
      window.location.reload();
    });
  });
}
