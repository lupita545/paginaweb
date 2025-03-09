import React, { useState } from 'react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    correo: '',
    contrasena: '',
  });
  const [error, setError] = useState(null); 

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('iniciando sesión con:', credentials);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Error al iniciar');
      }

      const data = await response.json();
      console.log('Inicio de sesión correcto:', data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {}
      <input
        type="email"
        name="correo"
        placeholder="Correo"
        value={credentials.correo}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="contrasena"
        placeholder="Contraseña"
        value={credentials.contrasena}
        onChange={handleChange}
        required
      />
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
};

export default Login;
