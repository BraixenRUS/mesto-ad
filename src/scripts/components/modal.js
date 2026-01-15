// Обработчик нажатия Esc
const handleEscClose = (evt) => {
  if (evt.key === "Escape") {
    // Ищем открытый попап и закрываем его
    const openedPopup = document.querySelector(".popup_is-opened");
    if (openedPopup) {
      closeModalWindow(openedPopup);
    }
  }
};

// Функция открытия попапа
export const openModalWindow = (modalElement) => {
  modalElement.classList.add("popup_is-opened");
  // Вешаем слушатель Esc только когда попап открыт
  document.addEventListener("keyup", handleEscClose);
};

// Функция закрытия попапа
export const closeModalWindow = (modalElement) => {
  modalElement.classList.remove("popup_is-opened");
  // Удаляем слушатель Esc, чтобы не висел в памяти
  document.removeEventListener("keyup", handleEscClose);
};

// Вешает обработчики закрытия: на крестик и на оверлей (фон)
export const setCloseModalWindowEventListeners = (modalElement) => {
  const closeButton = modalElement.querySelector(".popup__close");

  closeButton.addEventListener("click", () => {
    closeModalWindow(modalElement);
  });

  modalElement.addEventListener("mousedown", (evt) => {
    // Проверяем, что клик был именно по оверлею, а не внутри формы
    if (evt.target.classList.contains("popup")) {
      closeModalWindow(modalElement);
    }
  });
};
