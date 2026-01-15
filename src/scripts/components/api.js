// Конфиг с адресом сервера и токеном
const apiConfig = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
  headers: {
    authorization: "edded6d7-9924-4602-932a-1740102b3dcf",
    "Content-Type": "application/json",
  },
};

// Проверка ответа сервера
const checkResponse = (res) => {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Ошибка: ${res.status}`);
};

// Универсальный запрос
const request = (endpoint, options = {}) => {
  return fetch(`${apiConfig.baseUrl}${endpoint}`, {
    headers: apiConfig.headers,
    ...options,
  }).then(checkResponse);
};

// ===== Экспорты под твой index.js =====

// GET /users/me
export const getUserInfo = () => {
  return request("/users/me");
};

// GET /cards
export const getCardList = () => {
  return request("/cards");
};

// PATCH /users/me
export const setUserInfo = ({ name, about }) => {
  return request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });
};

// PATCH /users/me/avatar
export const setUserAvatar = ({ avatar }) => {
  return request("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });
};

// POST /cards
export const setUserCards = ({ name, link }) => {
  return request("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });
};

// DELETE /cards/:cardId
export const deleteUserCards = (cardId) => {
  return request(`/cards/${cardId}`, {
    method: "DELETE",
  });
};

// PUT/DELETE /cards/likes/:cardId
export const changeLikeCardStatus = (cardId, isLiked) => {
  return request(`/cards/likes/${cardId}`, {
    method: isLiked ? "DELETE" : "PUT",
  });
};
