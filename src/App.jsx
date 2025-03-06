import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const App = () => {
  const [isLogin, setIsLogin] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div>
      {isLogin ? (
        <>
          <Login />
          <p>
            ¿No tienes una cuenta? 
            <span className="link" onClick={toggleForm}> Registrarse</span>
          </p>
        </>
      ) : (
        <>
          <Register />
          <p>
            ¿tienes una cuenta? 
            <span className="link" onClick={toggleForm}> Iniciar Sesión</span>
          </p>
        </>
      )}
    </div>
  );
};

export default App;


