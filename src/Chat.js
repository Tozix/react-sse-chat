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

  const markMessageAsRead = useCallback(
    async (messageId) => {
      try {
        await axios.post(
          `${apiBaseUrl}/chat/messages/${messageId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Ошибка при отметке сообщения как прочитанного:", error);
      }
    },
    [token]
  );

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

  useEffect(() => {
    if (chatSessionId) {
      const fetchChatHistory = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/chat/history/${chatSessionId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setChatMessages(response.data);
          response.data.forEach((msg) => {
            console.log("msg", msg);
            if (msg.senderId !== user.id && !msg.isRead) {
              markMessageAsRead(msg.id);
            }
          });
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
          const data = JSON.parse(event.data);

          if (data.type === "newMessage") {
            setChatMessages((prev) => [...prev, data.message]);
            if (data.message.senderId !== user.id) {
              markMessageAsRead(data.message.id);
            }
          } else if (data.type === "messageRead") {
            setChatMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.messageId ? { ...msg, isRead: true } : msg
              )
            );
          }
        },
        signal,
      });

      return () => controller.abort();
    }
  }, [token, chatSessionId, scrollToBottom, markMessageAsRead, user.id]);

  useEffect(() => scrollToBottom(), [chatMessages, scrollToBottom]);

  return (
    <div className="chat-container">
      <div className="messages">
        {chatMessages.map((msg, index) => (
          <div key={index} className="message" style={{ position: "relative" }}>
            <strong>
              {msg.senderId === user.id ? "Вы" : msg.senderEmail}:
            </strong>{" "}
            {msg.content}
            {msg.senderId === user.id && msg.isRead && (
              <span
                className="read-mark"
                style={{ marginLeft: "10px", fontSize: "smaller" }}
              >
                ✔️
              </span>
            )}
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
