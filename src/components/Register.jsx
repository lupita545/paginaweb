import React, { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        correo: '',
        contrasena: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const insertIndexedDB = (data) => {
        let request = indexedDB.open("database", 1);
        request.onupgradeneeded = event => {
            let db = event.target.result;
            if (!db.objectStoreNames.contains("libros")) {
                db.createObjectStore("libros", { autoIncrement: true });
            }
        };
        request.onsuccess = event => {
            let db = event.target.result;
            let transaction = db.transaction("libros", "readwrite");
            let store = transaction.objectStore("libros");
            let resultado = store.add(data);
            resultado.onsuccess = () => {
                console.log("Usuario registrado en IndexedDB", data);
            };
            resultado.onerror = event2 => {
                console.error("Error al insertar en IndexedDB", event2.target.error);
            };
        };
        request.onerror = event => {
            console.error("Error al abrir IndexedDB", event.target.error);
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const subscription = localStorage.getItem('subscription') ? JSON.parse(localStorage.getItem('subscription')) : null;
        const userData = { ...formData, subscription };

        try {
            const response = await fetch('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (response.ok) {
                console.log('El usuario se creó en MongoDB');
                alert('Tu registro fue exitoso:)'); // ✅ Se agregó el alert cuando el registro es exitoso
            } else {
                console.error('Error al crear el usuario');
            }
        } catch (error) {
            console.error('No hay conexión, se guardó en IndexedDB.');
            insertIndexedDB(userData);
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then(sw => {
                    sw.sync.register("syncUsers");
                });
            }
            alert('No hay conexión. Usuario registrado en IndexedDB.'); // ✅ Se agregó el alert en caso de error
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Registro de usuarios</h2>
            <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
            <input type="text" name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} required />
            <input type="email" name="correo" placeholder="Correo electrónico" value={formData.correo} onChange={handleChange} required />
            <input type="password" name="contrasena" placeholder="Contraseña" value={formData.contrasena} onChange={handleChange} required />
            <button type="submit">Registrar</button>
        </form>
    );
};

export default Register;
