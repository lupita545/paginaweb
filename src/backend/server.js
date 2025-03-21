// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import {fileURLToPath} from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import webpush from 'web-push';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar claves VAPID desde JSON o variables de entorno
let keys = {};
try {
  const keysPath = path.resolve('src/keys.json');
  keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
} catch (error) {
  console.error('No se pudo cargar keys.');
}

// Configurar las claves
const publicKey = process.env.VAPID_PUBLIC_KEY || keys.publicKey;
const privateKey = process.env.VAPID_PRIVATE_KEY || keys.privateKey;

if (!publicKey || !privateKey) {
  console.error('claves VAPID no encontradas.');
  process.exit(1);
}
webpush.setVapidDetails('mailto:prueba@gmail.com', publicKey, privateKey);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos Mongo
const uri = 'mongodb+srv://jime123:jime123@cluster0.vj37dkd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
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

// Enviar notificación push
app.post('/sendPush/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar usuario por ID
    const usuario = await Usuario.findById(id);
    if (!usuario || !usuario.subscription) {
      return res.status(404).json({ error: 'Usuario no encontrado o sin suscripción' });
    }

    const payload = JSON.stringify({
      title: "Notificación",
      body: "Hola bienvenido"
    });

    // Enviar la notificación
    await webpush.sendNotification(usuario.subscription, payload);

    res.json({ mensaje: "Notificación enviada correctamente" });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).json({ mensaje: "No se pudo enviar la notificación", details: error.message });
  }
});
  
  const clientBuildPath = path.join(__dirname, '../../build');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.error('Error: No se encontró la carpeta build');
  }
  
  // Iniciar servidor
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  
  