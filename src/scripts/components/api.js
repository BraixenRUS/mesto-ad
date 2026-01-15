// Конфиг с адресом сервера и токеном (чтобы не писать их каждый раз)
const apiConfig = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
  headers: {
    authorization: "edded6d7-9924-4602-932a-1740102b3dcf",
    "Content-Type": "application/json",
  },
};

// Функция-помощник: проверяет ответ сервера.
// Если ok (200-299), то возвращает JSON, иначе формирует ошибку.
const checkResponse = (res) => {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Ошибка: ${res.status}`);
};

// Универсальная функция запроса.
// Принимает хвост URL и параметры, добавляет заголовки и проверяет ответ.
const request = (endpoint, options) => {
  return fetch(`${apiConfig.baseUrl}${endpoint}`, {
    headers: apiConfig.headers,
    ...options,
  }).then(checkResponse);
};

// 1. Получение данных пользователя (имя, описание, аватар)
export const fetchUserInfo = () => {
  return request(`/users/me`);
};

// 2. Получение списка карточек с сервера
export const fetchCards = () => {
  return request(`/cards`);
};

// 3. Редактирование профиля (отправляем новые имя и описание)
export const updateUserData = (name, about) => {
  return request(`/users/me`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
      about,
    }),
  });
};

// 4. Обновление аватарки
export const updateUserAvatar = (avatarLink) => {
  return request(`/users/me/avatar`, {
    method: "PATCH",
    body: JSON.stringify({
      avatar: avatarLink,
    }),
  });
};

// 5. Добавление новой карточки
export const createNewCard = (name, link) => {
  return request(`/cards`, {
    method: "POST",
    body: JSON.stringify({
      name,
      link,
    }),
  });
};

// 6. Удаление карточки по её ID
export const removeCard = (cardId) => {
  return request(`/cards/${cardId}`, {
    method: "DELETE",
  });
};

// 7. Постановка и снятие лайка
// Если isLiked === true, значит лайк уже стоит и его надо убрать (DELETE)
export const toggleCardLike = (cardId, isLiked) => {
  return request(`/cards/likes/${cardId}`, {
    method: isLiked ? "DELETE" : "PUT",
  });
};
