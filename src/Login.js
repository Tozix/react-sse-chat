import axios from "axios";
import React, { useState } from "react";

const apiBaseUrl = "http://localhost:3000/api";

const Login = ({ onAuthenticated }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${apiBaseUrl}/auth/login`,
        credentials
      );
      const { accessToken } = response.data; // Используем accessToken из ответа
      onAuthenticated(accessToken); // Передаём accessToken в родительский компонент
    } catch (error) {
      console.error(
        "Ошибка при авторизации:",
        error.response?.data?.error || error.message
      );
    }
  };

  return (
    <div className="login-container">
      <h2>Вход в систему</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default Login;
