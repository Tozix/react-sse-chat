import { fetchEventSource } from "@microsoft/fetch-event-source";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import ChatCreator from "./ChatCreator";

const apiBaseUrl = "http://localhost:3000/api";

const ChatList = ({ token, user, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [availableChats, setAvailableChats] = useState([]);

  const fetchChats = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/chat/active-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (user.role === "CURATOR") {
        setChats(response.data.filter((chat) => chat.curatorId === user.id));
        setAvailableChats(
          response.data.filter((chat) => chat.curatorId == null)
        );
      } else {
        setChats(response.data.filter((chat) => chat.userId === user.id));
      }
    } catch (error) {
      console.error("Ошибка при получении списка чатов:", error);
    }
  }, [token, user]);

  const joinChat = async (chatId) => {
    try {
      await axios.post(
        `${apiBaseUrl}/chat/join`,
        { chatSessionId: chatId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchChats();
      onSelectChat(chatId);
    } catch (error) {
      console.error("Ошибка при присоединении к чату:", error);
    }
  };

  useEffect(() => {
    fetchChats();

    const controller = new AbortController();
    fetchEventSource(`${apiBaseUrl}/chat/updates`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      onmessage(event) {
        try {
          const update = JSON.parse(event.data);
          if (
            ["newMessage", "chatCurated", "newCuratedChat", "newChat"].includes(
              update.type
            )
          ) {
            fetchChats();
          }
        } catch (error) {
          console.error("Ошибка при обработке SSE сообщения:", error);
        }
      },
    });

    return () => controller.abort();
  }, [fetchChats, token, user.id]);

  return (
    <div>
      {user.role !== "CURATOR" && (
        <ChatCreator
          token={token}
          onChatCreated={fetchChats}
          onSelectChat={onSelectChat}
        />
      )}
      <h2>Активные чаты</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat.id}>
            Чат с{" "}
            {user.role === "CURATOR"
              ? chat.user.email
              : chat.curator
              ? chat.curator.email
              : "Куратор не назначен"}{" "}
            - сообщений: {chat.messageCount}
            <button onClick={() => onSelectChat(chat.id)}>Открыть чат</button>
          </li>
        ))}
      </ul>
      {user.role === "CURATOR" && (
        <>
          <h2>Доступные чаты</h2>
          <ul>
            {availableChats.map((chat) => (
              <li key={chat.id}>
                Чат с {chat.user.email}
                <button onClick={() => joinChat(chat.id)}>
                  Присоединиться
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ChatList;
