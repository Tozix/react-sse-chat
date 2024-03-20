import axios from "axios";
import React, { useEffect, useState } from "react";
const apiBaseUrl = "http://localhost:3000/api";

const ChatList = ({ token, onSelectChat }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [availableChats, setAvailableChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const [activeResponse, availableResponse] = await Promise.all([
          axios.get(`${apiBaseUrl}/chat/active-for-curator`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiBaseUrl}/chat/available-for-curator`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setActiveChats(activeResponse.data);
        setAvailableChats(availableResponse.data);
      } catch (error) {
        console.error("Ошибка при получении списка чатов:", error);
      }
    };

    fetchChats();
  }, [token]);

  return (
    <div>
      <h2>Активные чаты</h2>
      <ul>
        {activeChats.map((chat) => (
          <li key={chat.id}>
            Чат с {chat.user.email}
            <button onClick={() => onSelectChat(chat.id)}>Открыть чат</button>
          </li>
        ))}
      </ul>
      <h2>Доступные чаты</h2>
      <ul>
        {availableChats.map((chat) => (
          <li key={chat.id}>
            Чат с {chat.user.email}
            <button onClick={() => onSelectChat(chat.id)}>
              Присоединиться
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
