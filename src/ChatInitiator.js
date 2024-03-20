import axios from "axios";
import { useEffect } from "react";

const apiBaseUrl = "http://localhost:3000/api";

const ChatInitiator = ({ token, onChatSessionIdReady }) => {
  useEffect(() => {
    const handleChatInitiation = async () => {
      try {
        // Проверяем наличие активного чата
        const response = await axios.get(`${apiBaseUrl}/chat/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Если активный чат есть, устанавливаем его ID
        onChatSessionIdReady(response.data.activeChatId);
      } catch (error) {
        // Проверяем, является ли ошибка отсутствием активного чата (404)
        if (error.response && error.response.status === 404) {
          console.log("Активного чата нет, создаем новый чат");
          // Создаем новый чат
          try {
            const newChatResponse = await axios.post(
              `${apiBaseUrl}/chat/initiate`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            onChatSessionIdReady(newChatResponse.data.chatSessionId);
          } catch (error) {
            console.error("Ошибка при создании нового чата:", error.message);
          }
        } else {
          // Обрабатываем другие типы ошибок
          console.error(
            "Ошибка при получении активного чата:",
            error.response?.data?.error || error.message
          );
        }
      }
    };

    handleChatInitiation();
  }, [token, onChatSessionIdReady]);

  return null;
};

export default ChatInitiator;
