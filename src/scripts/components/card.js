// Получаем разметку из HTML-тега <template>
const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

// Основная функция создания карточки
// data - объект с данными карточки (имя, ссылка, лайки, владелец)
// functions - объект с функциями-обработчиками (клик по картинке, лайк, удаление, инфо)
// userId - ID текущего пользователя (чтобы понять, можно ли удалять карточку)
export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick },
  userId
) => {
  const cardElement = getTemplate();
  
  // Находим элементы внутри карточки
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info"
  );
  const cardImage = cardElement.querySelector(".card__image");
  const likeCounter = cardElement.querySelector(".card__like-count");

  // Заполняем контентом
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  // Логика лайков:
  // 1. Ставим счетчик
  likeCounter.textContent = data.likes.length;
  // 2. Проверяем, лайкал ли я эту карточку раньше
  const isLiked = data.likes.some((user) => user._id === userId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }
  // 3. Вешаем слушатель клика
  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon(likeButton, data._id, likeCounter)
    );
  }

  // Логика кнопки удаления:
  // Если я не владелец карточки -> скрываем корзину
  if (data.owner._id !== userId) {
    deleteButton.style.display = "none";
  } else {
    // Иначе вешаем слушатель на удаление
    if (onDeleteCard) {
      deleteButton.addEventListener("click", () =>
        onDeleteCard(cardElement, data._id)
      );
    }
  }

  // Слушатель на кнопку информации (доп. фича)
  if (onInfoClick && infoButton) {
    infoButton.addEventListener("click", () => onInfoClick(data));
  }

  // Слушатель на клик по картинке (открытие попапа)
  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};

// Переключает класс лайка (визуально закрашивает/снимает)
export const toggleLikeState = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};
