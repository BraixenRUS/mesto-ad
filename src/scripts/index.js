/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getCardList,
  getUserInfo,
  setUserInfo,
  setUserAvatar,
  setUserCards,
  deleteUserCards,
  changeLikeCardStatus,
} from "./components/api.js";

// ---------- DOM узлы  ----------
const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalUsersList = cardInfoModalWindow.querySelector(".popup__list");

const cardInfoDefinitionTemplate = document.querySelector(
  "#popup-info-definition-template"
).content;
const cardInfoUserPreviewTemplate = document.querySelector(
  "#popup-info-user-preview-template"
).content;

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

const cardDeleteModalWindow = document.querySelector(".popup_type_remove-card");
const cardFormDeleteModalWindow =
  cardDeleteModalWindow.querySelector(".popup__form");
const cardFormModalWindowButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const profileFormButton = profileForm.querySelector(".popup__button");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarFormButton = avatarForm.querySelector(".popup__button");

// ---------- Утилиты ----------
const likesCount = function (card, value) {
  card.querySelector(".card__like-count").textContent = value;
};

const changeTextOnButton = function (formButton, text) {
  formButton.textContent = text;
};

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

// ---------- Вариант 1: инфо по карточке ----------
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (label, value) => {
  const infoElement = cardInfoDefinitionTemplate.cloneNode(true);
  infoElement.querySelector(".popup__info-term").textContent = label;
  infoElement.querySelector(".popup__info-description").textContent = value;
  return infoElement;
};

const handleInfoClick = (cardId) => {
  // Для корректного вывода берём актуальные данные с сервера
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) return;

      cardInfoModalTitle.textContent = cardData.name;

      // чистим старое
      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalUsersList.innerHTML = "";

      // наполняем информацию
      cardInfoModalInfoList.append(
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt)))
      );
      cardInfoModalInfoList.append(
        createInfoString("Владелец:", cardData.owner.name)
      );
      cardInfoModalInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      // список лайкнувших
      cardData.likes.forEach((user) => {
        const userElement = cardInfoUserPreviewTemplate.cloneNode(true);
        userElement.querySelector(".popup__list-item").textContent = user.name;
        cardInfoModalUsersList.append(userElement);
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// ---------- Попап картинки ----------
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// ---------- Формы ----------
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  changeTextOnButton(profileFormButton, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;

      changeTextOnButton(profileFormButton, "Сохранить");
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      changeTextOnButton(profileFormButton, "Сохранить");
      console.log(err);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  changeTextOnButton(avatarFormButton, "Сохранение...");

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

      changeTextOnButton(avatarFormButton, "Сохранить");
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      closeModalWindow(avatarFormModalWindow);
      changeTextOnButton(avatarFormButton, "Сохранить");
      console.log(err);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  changeTextOnButton(cardFormModalWindowButton, "Создание...");

  setUserCards({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((data) => {
      placesWrap.prepend(
        createCardElement(
          data,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: (likedBtn) => handleCardLike(likedBtn, data._id),
            onDeleteCard: (cardElement) => handleCardDelete(cardElement, data._id),
            onInfoClick: () => handleInfoClick(data._id), // вариант 1
          }
        )
      );

      changeTextOnButton(cardFormModalWindowButton, "Создать");
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      changeTextOnButton(cardFormModalWindowButton, "Создать");
      console.log(err);
    });
};

const handleCardDelete = (cardElement, cardId) => {
  openModalWindow(cardDeleteModalWindow);

  const submitHandler = (e) => {
    e.preventDefault();

    const btn = cardFormDeleteModalWindow.querySelector(".popup__button");
    changeTextOnButton(btn, "Удаление...");

    deleteUserCards(cardId)
      .then(() => {
        closeModalWindow(cardDeleteModalWindow);
        cardElement.remove();
        changeTextOnButton(btn, "Да");
      })
      .catch((err) => {
        console.log(err);
        changeTextOnButton(btn, "Да");
      })
      .finally(() => {
        // чтобы обработчики не копились при удалении нескольких карточек
        cardFormDeleteModalWindow.removeEventListener("submit", submitHandler);
      });
  };

  cardFormDeleteModalWindow.addEventListener("submit", submitHandler);
};

const handleCardLike = (likeButton, cardId) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((data) => {
      if (data.likes.length === 0) {
        likeButton.classList.remove("card__like-button_is-active");
        likesCount(likeButton.parentElement, "");
      } else {
        likesCount(likeButton.parentElement, data.likes.length);
        likeButton.classList.toggle("card__like-button_is-active");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// ---------- EventListeners ----------
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  openModalWindow(profileFormModalWindow);
  clearValidation(profileForm, validationSettings);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();

  openModalWindow(avatarFormModalWindow);
  clearValidation(avatarForm, validationSettings);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();

  openModalWindow(cardFormModalWindow);
  clearValidation(cardForm, validationSettings);
});

// Закрытие всех попапов (крестик/оверлей/Esc)
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// ---------- Инициализация ----------
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    cards.forEach((data) => {
      const card = createCardElement(data, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: (likedBtn) => handleCardLike(likedBtn, data._id),
        onDeleteCard: (cardElement) => handleCardDelete(cardElement, data._id),
        onInfoClick: () => handleInfoClick(data._id), // вариант 1
      });

      // Если карточка не моя — скрываем кнопку удаления
      if (data.owner._id !== userData._id) {
        const deleteButton = card.querySelector(".card__control-button_type_delete");
        if (deleteButton) deleteButton.remove();
      }

      placesWrap.append(card);

      // активный лайк, если пользователь уже лайкал
      if (data.likes.find((u) => u._id === userData._id)) {
        card
          .querySelector(".card__like-button")
          .classList.add("card__like-button_is-active");
      }

      // счётчик лайков
      likesCount(card, data.likes.length > 0 ? data.likes.length : "");
    });

    profileDescription.textContent = userData.about;
    profileTitle.textContent = userData.name;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
  })
  .catch((err) => {
    console.log(err);
  });
