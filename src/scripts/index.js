import "../pages/index.css"; // Подключение стилей для сборки
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCardFromServer,
  changeLikeCardStatus,
} from "./components/api.js";
import {
  createCardElement,
  deleteCard,
  likeCard,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import {
  enableValidation,
  clearValidation,
  disableSubmitButton,
  enableSubmitButton,
} from "./components/validation.js";

// --- КОНФИГ ВАЛИДАЦИИ ---
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// --- DOM ЭЛЕМЕНТЫ ---
const placesWrap = document.querySelector(".places__list");

// Попап профиля
const profilePopup = document.querySelector(".popup_type_edit");
const profileForm = profilePopup.querySelector(".popup__form");
const nameInput = profileForm.querySelector(".popup__input_type_name");
const jobInput = profileForm.querySelector(".popup__input_type_description");
const profileEditBtn = document.querySelector(".profile__edit-button");
const profileSubmitBtn = profileForm.querySelector(".popup__button");

// Данные профиля на странице
const profileTitle = document.querySelector(".profile__title");
const profileDesc = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

// Попап новой карточки
const newCardPopup = document.querySelector(".popup_type_new-card");
const newCardForm = newCardPopup.querySelector(".popup__form");
const cardNameInput = newCardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = newCardForm.querySelector(".popup__input_type_url");
const newCardBtn = document.querySelector(".profile__add-button");
const newCardSubmitBtn = newCardForm.querySelector(".popup__button");

// Попап картинки
const imagePopup = document.querySelector(".popup_type_image");
const popupImage = imagePopup.querySelector(".popup__image");
const popupCaption = imagePopup.querySelector(".popup__caption");

// Попап аватара
const avatarPopup = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarPopup.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitBtn = avatarForm.querySelector(".popup__button");

// Попап подтверждения удаления
const confirmPopup = document.querySelector(".popup_type_remove-card");
const confirmForm = confirmPopup.querySelector(".popup__form");
const confirmBtn = confirmForm.querySelector(".popup__button");

// Попап статистики (лого)
const statsPopup = document.querySelector(".popup_type_info");
const statsTitle = statsPopup.querySelector(".popup__title");
const statsInfoList = statsPopup.querySelector(".popup__info");
const statsText = statsPopup.querySelector(".popup__text");
const statsUserList = statsPopup.querySelector(".popup__list");
const logoElement = document.querySelector(".header__logo");

// Переменные состояния
let myUserId = null;
let cardIdToDelete = null;
let cardElementToDelete = null;

// --- ФУНКЦИИ ---

// Открытие картинки
const handlePreviewPicture = ({ name, link }) => {
  popupImage.src = link;
  popupImage.alt = name;
  popupCaption.textContent = name;
  openModalWindow(imagePopup);
};

// Сабмит профиля
const handleProfileSubmit = (evt) => {
  evt.preventDefault();
  const defaultText = profileSubmitBtn.textContent;
  profileSubmitBtn.textContent = "Сохранение...";
  disableSubmitButton(profileSubmitBtn, validationConfig);

  setUserInfo({
    name: nameInput.value,
    about: jobInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDesc.textContent = userData.about;
      closeModalWindow(profilePopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      profileSubmitBtn.textContent = defaultText;
      enableSubmitButton(profileSubmitBtn, validationConfig);
    });
};

// Сабмит аватара
const handleAvatarSubmit = (evt) => {
  evt.preventDefault();
  const defaultText = avatarSubmitBtn.textContent;
  avatarSubmitBtn.textContent = "Сохранение...";
  disableSubmitButton(avatarSubmitBtn, validationConfig);

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarPopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      avatarSubmitBtn.textContent = defaultText;
      enableSubmitButton(avatarSubmitBtn, validationConfig);
    });
};

// Лайк карточки
const handleLikeCard = (cardId, likeButton) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      const counter = likeButton.parentElement.querySelector(".card__like-count");
      if (counter) {
        counter.textContent = updatedCard.likes.length;
      }
      likeCard(likeButton);
    })
    .catch((err) => console.log(err));
};

// Сабмит новой карточки
const handleCardSubmit = (evt) => {
  evt.preventDefault();
  const defaultText = newCardSubmitBtn.textContent;
  newCardSubmitBtn.textContent = "Создание...";
  disableSubmitButton(newCardSubmitBtn, validationConfig);

  addCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((cardData) => {
      const newCardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteClick,
        },
        myUserId
      );
      placesWrap.prepend(newCardElement);
      closeModalWindow(newCardPopup);
      newCardForm.reset();
    })
    .catch((err) => console.log(err))
    .finally(() => {
      newCardSubmitBtn.textContent = defaultText;
      enableSubmitButton(newCardSubmitBtn, validationConfig);
    });
};

// Клик по корзине (открываем подтверждение)
const handleDeleteClick = (cardId, cardElement) => {
  cardIdToDelete = cardId;
  cardElementToDelete = cardElement;
  openModalWindow(confirmPopup);
};

// Сабмит удаления карточки
const handleConfirmDelete = (evt) => {
  evt.preventDefault();
  const defaultText = confirmBtn.textContent;
  confirmBtn.textContent = "Удаление...";
  disableSubmitButton(confirmBtn, validationConfig);

  deleteCardFromServer(cardIdToDelete)
    .then(() => {
      deleteCard(cardElementToDelete);
      closeModalWindow(confirmPopup);
      cardIdToDelete = null;
      cardElementToDelete = null;
    })
    .catch((err) => console.log(err))
    .finally(() => {
      confirmBtn.textContent = defaultText;
      enableSubmitButton(confirmBtn, validationConfig);
    });
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (СТАТИСТИКА) ---
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createStatItem = (term, desc) => {
  const tpl = document.getElementById("popup-info-definition-template");
  const item = tpl.content.cloneNode(true);
  item.querySelector(".popup__info-term").textContent = term;
  item.querySelector(".popup__info-description").textContent = desc;
  return item;
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      statsInfoList.innerHTML = "";
      statsUserList.innerHTML = "";

      if (cards.length === 0) return;

      // Сортировка по дате для поиска первой и последней
      // (хотя сервер обычно возвращает в хронологическом порядке, проверим)
      let firstCard = cards[0];
      let lastCard = cards[0];

      const usersMap = {};

      cards.forEach((card) => {
        const cDate = new Date(card.createdAt);
        if (cDate < new Date(firstCard.createdAt)) firstCard = card;
        if (cDate > new Date(lastCard.createdAt)) lastCard = card;

        // Считаем пользователей
        const uId = card.owner._id;
        if (!usersMap[uId]) {
          usersMap[uId] = { name: card.owner.name, count: 0 };
        }
        usersMap[uId].count++;
      });

      const usersArr = Object.values(usersMap);
      let maxCards = 0;
      usersArr.forEach((u) => {
        if (u.count > maxCards) maxCards = u.count;
      });

      // Заполняем попап
      statsTitle.textContent = "Статистика пользователей";
      statsInfoList.append(createStatItem("Всего карточек:", cards.length));
      statsInfoList.append(
        createStatItem("Первая создана:", formatDate(new Date(firstCard.createdAt)))
      );
      statsInfoList.append(
        createStatItem("Последняя создана:", formatDate(new Date(lastCard.createdAt)))
      );
      statsInfoList.append(
        createStatItem("Всего пользователей:", usersArr.length)
      );
      statsInfoList.append(
        createStatItem("Максимум карточек от одного:", maxCards)
      );

      statsText.textContent = "Все пользователи:";
      const userTpl = document.getElementById("popup-info-user-preview-template");
      usersArr.forEach((user) => {
        const li = userTpl.content
          .cloneNode(true)
          .querySelector(".popup__list-item");
        li.textContent = user.name;
        statsUserList.append(li);
      });

      openModalWindow(statsPopup);
    })
    .catch((err) => console.log(err));
};

// --- СЛУШАТЕЛИ ---

profileForm.addEventListener("submit", handleProfileSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
newCardForm.addEventListener("submit", handleCardSubmit);
confirmForm.addEventListener("submit", handleConfirmDelete);
logoElement.addEventListener("click", handleLogoClick);

profileEditBtn.addEventListener("click", () => {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDesc.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profilePopup);
});

newCardBtn.addEventListener("click", () => {
  newCardForm.reset();
  clearValidation(newCardForm, validationConfig);
  openModalWindow(newCardPopup);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarPopup);
});

// Закрытие всех попапов
document.querySelectorAll(".popup").forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Включение валидации
enableValidation(validationConfig);

// --- ЗАГРУЗКА ДАННЫХ ---
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    myUserId = userData._id;

    // Отрисовка профиля
    profileTitle.textContent = userData.name;
    profileDesc.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    // Отрисовка карточек
    cards.forEach((card) => {
      const cardEl = createCardElement(
        card,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteClick,
        },
        myUserId
      );
      placesWrap.append(cardEl);
    });
  })
  .catch((err) => {
    console.log("Ошибка инициализации:", err);
  });
