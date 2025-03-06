// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const keys = require('../src/keys.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos Mongo
const uri = 'mongodb+srv://lupi11:lupi11@cluster0.35uvk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.info('Conexión exitosa a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definición del esquema de usuario
const userSchema = new mongoose.Schema({
    nombre: String,
    apellidos: String,
    correo: String,
    contrasena: String,
    subscription: {
        endpoint: { type: String, required: true },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true }
        }
    }
});
const Usuario = mongoose.model('Usuario', userSchema);

// Ruta para registrar un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
    const { nombre, apellidos, correo, contrasena, subscription } = req.body;
    const nuevoUsuario = new Usuario({ nombre, apellidos, correo, contrasena, subscription });
    try {
        await nuevoUsuario.save();
        res.status(201).send('Usuario registrado');
    } catch (error) {
        console.error('Error al registrar al usuario', error);
        res.status(400).send('Error al crear al usuario');
    }
});

// Ruta para iniciar sesión
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const usuario = await Usuario.findOne({ correo });
        if (!usuario || usuario.contrasena !== contrasena) {
            return res.status(401).send('Credenciales incorrectas');
        }
        res.status(200).send({ message: 'Inicio de sesión correcto', usuario });
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Guardar una suscripción de notificaciones push
app.post('/save-subs', async (req, res) => {
    try {
        const subscription = req.body.subscription;
        const newSubscription = new Subscription(subscription);
        await newSubscription.save();
        res.status(201).json({ message: 'Suscripción guardada exitosamente' });
    } catch (error) {
        console.error('Error al guardar', error);
        res.status(500).json({ error: 'Error al guardar', details: error });
    }
});

// Configuración de web-push
webpush.setVapidDetails('mailto:prueba@gmail.com', keys.publicKey, keys.privateKey);

// Inicio del servidor
app.listen(PORT, () => {
    console.info(`Servidor ejecutándose en el puerto ${PORT}`);
});
