// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import keys from './keys.json';

navigator.serviceWorker.register('./sw.js', { type: 'module' })
    .then(registro => {
        console.log("Service Worker registrado");
        if (Notification.permission === 'denied' || Notification.permission === 'default') {
            Notification.requestPermission(permission => {
                if (permission === 'granted') {
                    registro.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: keys.publicKey
                    })
                    .then(res => res.toJSON())
                    .then(async json => {
                        console.log(json);
                        localStorage.setItem('subscription', JSON.stringify(json));
                    });
                }
            });
        }
    })
    .catch(error => {
        console.log("Error registrando service", error);
    });

    let db = window.indexedDB.open('database');
db.onupgradeneeded = event => {
  let result = event.target.result;
  result.createObjectStore('libros', { autoIncrement: true });
};

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
