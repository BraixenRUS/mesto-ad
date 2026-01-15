/*
Файл index.js является точкой входа в наше приложение.
Он связывает всё воедино: API, карточки, валидацию и попапы.
*/

import { createCardElement, toggleLikeState } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  fetchCards,
  fetchUserInfo,
  updateUserData,
  updateUserAvatar,
  createNewCard,
  removeCard,
  toggleCardLike,
} from "./components/api.js";

// --- DOM узлы (элементы интерфейса) ---
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);
const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");
const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

// Доп. элементы для удаления и инфо
const deletePopup = document.querySelector(".popup_type_remove-card");
const deleteForm = deletePopup.querySelector(".popup__form");
const infoPopup = document.querySelector(".popup_type_info");
const infoTitle = infoPopup.querySelector(".popup__title");
const infoContent = infoPopup.querySelector(".popup__info");
const infoFansList = infoPopup.querySelector(".popup__list");

// Шаблоны
const infoTemplate = document.querySelector(
  "#popup-info-definition-template"
).content;
const userBadgeTemplate = document.querySelector(
  "#popup-info-user-preview-template"
).content;

// Глобальные переменные для ID пользователя и удаляемой карточки
let currentUserId = null;
let cardIdToDelete = null;
let cardElementToDelete = null;

// Настройки валидации (классы из CSS)
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// --- Вспомогательные функции ---

// Меняет текст кнопки во время загрузки (Сохранить -> Сохранение...)
function setButtonState(button, isLoading, defaultText = "Сохранить") {
  if (isLoading) {
    button.textContent = "Сохранение...";
  } else {
    button.textContent = defaultText;
  }
}

// Форматирует дату из строки в читаемый вид (напр. "15 января 2024")
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Создает строчку информации для попапа (Термин: Описание)
const createInfoItem = (label, value) => {
  const item = infoTemplate.cloneNode(true);
  item.querySelector(".popup__info-term").textContent = label;
  item.querySelector(".popup__info-description").textContent = value;
  return item;
};

// --- Обработчики событий (Handlers) ---

// Клик по картинке (открытие превью)
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// Клик по лайку
const handleLikeClick = (likeButton, cardId, counterElement) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  // Отправляем запрос
  toggleCardLike(cardId, isLiked)
    .then((updatedCard) => {
      // Если успешно - обновляем UI
      toggleLikeState(likeButton);
      counterElement.textContent = updatedCard.likes.length;
    })
    .catch((err) => console.log(err));
};

// Клик по корзине (открывает подтверждение)
const handleDeleteClick = (cardElement, cardId) => {
  cardIdToDelete = cardId;
  cardElementToDelete = cardElement;
  openModalWindow(deletePopup);
};

// Клик по кнопке инфо (заполняет и открывает попап)
const handleInfoClick = (cardData) => {
  infoTitle.textContent = cardData.name;
  infoContent.innerHTML = "";
  infoFansList.innerHTML = "";

  // Добавляем дату, владельца и кол-во лайков
  infoContent.append(
    createInfoItem("Дата создания:", formatDate(cardData.createdAt))
  );
  infoContent.append(createInfoItem("Владелец:", cardData.owner.name));
  infoContent.append(
    createInfoItem("Количество лайков:", cardData.likes.length)
  );

  // Добавляем список лайкнувших
  cardData.likes.forEach((user) => {
    const badge = userBadgeTemplate.cloneNode(true);
    badge.querySelector(".popup__list-item").textContent = user.name;
    infoFansList.append(badge);
  });

  openModalWindow(infoPopup);
};

// Сабмит формы профиля
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitBtn = profileForm.querySelector(".popup__button");
  setButtonState(submitBtn, true);

  updateUserData(profileTitleInput.value, profileDescriptionInput.value)
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => setButtonState(submitBtn, false));
};

// Сабмит формы аватара
const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitBtn = avatarForm.querySelector(".popup__button");
  setButtonState(submitBtn, true);

  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => setButtonState(submitBtn, false));
};

// Сабмит новой карточки
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitBtn = cardForm.querySelector(".popup__button");
  setButtonState(submitBtn, true, "Создать");

  createNewCard(cardNameInput.value, cardLinkInput.value)
    .then((cardData) => {
      const newCard = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeClick,
          onDeleteCard: handleDeleteClick,
          onInfoClick: handleInfoClick,
        },
        currentUserId
      );
      placesWrap.prepend(newCard); // Добавляем в начало списка
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => console.log(err))
    .finally(() => setButtonState(submitBtn, false, "Создать"));
};

// Подтверждение удаления карточки
const handleDeleteConfirm = (evt) => {
  evt.preventDefault();
  if (!cardIdToDelete || !cardElementToDelete) return;

  const submitBtn = deleteForm.querySelector(".popup__button");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Удаление...";

  removeCard(cardIdToDelete)
    .then(() => {
      cardElementToDelete.remove();
      closeModalWindow(deletePopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      submitBtn.textContent = originalText;
    });
};

// --- Слушатели событий (Listeners) ---

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
deleteForm.addEventListener("submit", handleDeleteConfirm);

// Открытие редактора профиля
openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig); // Очищаем старые ошибки
  openModalWindow(profileFormModalWindow);
});

// Открытие редактора аватара
profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

// Открытие создания карточки
openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

// Настройка закрытия всех попапов (крестик, оверлей)
document.querySelectorAll(".popup").forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// --- Инициализация приложения (Загрузка данных) ---

// Ждем выполнения обоих запросов (юзер + карточки)
Promise.all([fetchUserInfo(), fetchCards()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    // 1. Заполняем профиль
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    // 2. Рисуем карточки
    cards.forEach((cardData) => {
      const card = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeClick,
          onDeleteCard: handleDeleteClick,
          onInfoClick: handleInfoClick,
        },
        currentUserId
      );
      placesWrap.append(card);
    });
  })
  .catch((err) => console.log(err));

// Включаем валидацию
enableValidation(validationConfig);
