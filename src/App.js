import React, { useEffect, useState } from "react";
import "./App.css";
import Chat from "./Chat";
import ChatList from "./ChatList";
import Login from "./Login";

const apiBaseUrl = "http://localhost:3000/api";

const App = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch(`${apiBaseUrl}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setUser(data.user);
        } catch (error) {
          console.error("Ошибка при получении данных пользователя:", error);
        }
      }
    };

    fetchUser();
  }, [token]);

  const handleAuthenticated = (accessToken) => {
    setToken(accessToken);
  };

  if (!token) {
    return <Login onAuthenticated={handleAuthenticated} />;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App" style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ flex: 1 }}>
        <ChatList token={token} user={user} onSelectChat={setSelectedChatId} />
      </div>
      <div style={{ flex: 3 }}>
        {selectedChatId && (
          <Chat token={token} chatSessionId={selectedChatId} user={user} />
        )}
      </div>
    </div>
  );
};

export default App;
