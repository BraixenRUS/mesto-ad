// Показывает текст ошибки под полем ввода и красит рамку в красный
const showInputError = (
  formElement,
  inputElement,
  errorMessage,
  inputErrorClass,
  errorClass
) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(errorClass);
};

// Убирает текст ошибки и красную рамку
const hideInputError = (
  formElement,
  inputElement,
  inputErrorClass,
  errorClass
) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(inputErrorClass);
  errorElement.classList.remove(errorClass);
  errorElement.textContent = "";
};

// Основная функция проверки поля
const checkInputValidity = (
  formElement,
  inputElement,
  inputErrorClass,
  errorClass
) => {
  // 1. Проверяем паттерн (regex)
  if (inputElement.validity.patternMismatch) {
    // Если не совпал, берем текст ошибки из data-атрибута HTML
    inputElement.setCustomValidity(inputElement.dataset.errorMessage);
  } else {
    inputElement.setCustomValidity("");
  }

  // 2. Если есть хоть какая-то ошибка валидации
  if (!inputElement.validity.valid) {
    showInputError(
      formElement,
      inputElement,
      inputElement.validationMessage, // Стандартное браузерное сообщение
      inputErrorClass,
      errorClass
    );
  } else {
    hideInputError(formElement, inputElement, inputErrorClass, errorClass);
  }
};

// Проверяет, есть ли в списке полей хоть одно невалидное
const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => {
    return !inputElement.validity.valid;
  });
};

// Блокирует кнопку сабмита
const disableSubmitButton = (button, inactiveButtonClass) => {
  button.classList.add(inactiveButtonClass);
  button.disabled = true;
};

// Разблокирует кнопку сабмита
const enableSubmitButton = (button, inactiveButtonClass) => {
  button.classList.remove(inactiveButtonClass);
  button.disabled = false;
};

// Переключает состояние кнопки в зависимости от валидности полей
const toggleButtonState = (inputList, buttonElement, inactiveButtonClass) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, inactiveButtonClass);
  } else {
    enableSubmitButton(buttonElement, inactiveButtonClass);
  }
};

// Вешает слушатели 'input' на все поля формы
const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector)
  );
  const buttonElement = formElement.querySelector(
    settings.submitButtonSelector
  );

  // Сразу проверяем кнопку при открытии
  toggleButtonState(inputList, buttonElement, settings.inactiveButtonClass);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", function () {
      checkInputValidity(
        formElement,
        inputElement,
        settings.inputErrorClass,
        settings.errorClass
      );
      // При каждом символе проверяем, можно ли разблокировать кнопку
      toggleButtonState(inputList, buttonElement, settings.inactiveButtonClass);
    });
  });
};

// Экспорт: Включает валидацию для всех форм на странице
export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((formElement) => {
    formElement.addEventListener("submit", (evt) => {
      evt.preventDefault();
    });
    setEventListeners(formElement, settings);
  });
};

// Экспорт: Очищает ошибки формы (нужно при повторном открытии попапа)
export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector)
  );
  const buttonElement = formElement.querySelector(
    settings.submitButtonSelector
  );

  inputList.forEach((inputElement) => {
    hideInputError(
      formElement,
      inputElement,
      settings.inputErrorClass,
      settings.errorClass
    );
  });

  // При открытии кнопка всегда должна быть неактивна (если данные не заполнены)
  disableSubmitButton(buttonElement, settings.inactiveButtonClass);
};
