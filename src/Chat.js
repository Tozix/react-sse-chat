import { fetchEventSource } from "@microsoft/fetch-event-source";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Chat.css";

const apiBaseUrl = "http://localhost:3000/api";

const Chat = ({ token, chatSessionId, user }) => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Отправка сообщения
  const sendMessage = async () => {
    if (message.trim() && chatSessionId) {
      try {
        await axios.post(
          `${apiBaseUrl}/chat/send`,
          { chatSessionId, message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("");
      } catch (error) {
        console.error(
          "Ошибка при отправке сообщения:",
          error.response?.data?.error || error.message
        );
      }
    }
  };

  // Подключение к SSE для получения сообщений
  useEffect(() => {
    if (chatSessionId) {
      // Загружаем историю чата
      const fetchChatHistory = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/chat/history/${chatSessionId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setChatMessages(response.data); // Предполагается, что сервер возвращает массив сообщений
        } catch (error) {
          console.error("Ошибка при получении истории чата:", error);
        }
      };

      fetchChatHistory();

      const controller = new AbortController();
      const { signal } = controller;

      fetchEventSource(`${apiBaseUrl}/chat/events/${chatSessionId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        onmessage(event) {
          try {
            const data = JSON.parse(event.data);
            console.log("data", data);
            setChatMessages((prev) => [...prev, data.message]); // Добавляем только новые сообщения
          } catch (error) {
            console.error("Ошибка при получении сообщения:", error);
          }
        },
        signal,
      });

      return () => {
        controller.abort(); // Отменяем подписку при размонтировании компонента
      };
    }
  }, [token, chatSessionId, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  return (
    <div className="chat-container">
      <div className="messages">
        {chatMessages.map((msg, index) => (
          <div key={index} className="message">
            <strong>
              {msg.senderId === user.id ? "Вы" : msg.senderEmail}:
            </strong>{" "}
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {chatSessionId && (
        <div className="message-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Отправить</button>
        </div>
      )}
    </div>
  );
};

export default Chat;
