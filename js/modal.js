import {
    nextDayString
} from './state.js'

import {
    createArrow,
    dateStartString
} from './calculator.js'


export function toModal(card, id) {
    return `
    <h2 class="modal__title">${card.name}</h2>
    <div class="image-preview" id="preview-${card.id}">
        ${card.image
                ? `<img src="${card.image}" alt="${card.name}">`
                : ''
            }
        </div>
      <input type="file"
        id="file-${card.id}"
        accept="image/*"
        style="display: none;">
    <label class="modal__label" for="modal-date-production">Дата изготовления</label>
    <input class="input-field modal__date-production" id="modal-date-production" type="date" name="dateProd" data-id="${id}" max="${dateStartString}" value="${card.productionDate}" required>
    <div class="modal__auto-calc">
    <label class="modal__label" for="auto">Автоматический расчет по</label>
    <select class="input-field modal__select" id="auto" style="width: 100%;">
    <option value="" disabled selected>Выберите вариант</option>
    <option value="day">дням</option>
    <option value="month">месяцам</option>
    </select>
    <button class="modal__calculator"><img class="modal__img" src="../img/calculator.svg" alt="Калькулятор"></button>
    </div>
    <button class="btn modal__button--calc">Автоматический расчет</button>
    <label class="modal__label" for="modal-date">Дата окончания срока</label>
    <input class="input-field modal__end-date" id="modal-date" type="date" name="date" data-id="${id}" min="${nextDayString}" value="${card.expiryDate}" required>
    <button class="btn modal__button" type="submit">Сохранить изменения</button>
    <button class="btn modal__push-archive">Добавить в архив</button>
    `
}

export function createModalRemove(card, id) {
    return `
    <h2 class="modal-remove__title">${card.name}</h2>
    <p class="modal-remove__descr">Вы действительно хотите удалить продукт?</p>
    <div class="modal-remove__buttons">
      <button class="btn modal-remove__btn cancel">Отмена</button>
      <button class="btn modal-remove__btn ok" data-rem=${id}>Да</button>
    </div>
    `
}

export function createModalRemoveAll(section) {
    return `
    <p class="modal-remove__descr">Вы действительно хотите удалить все продукты в секции "${section}"?</p>
    <div class="modal-remove__buttons">
      <button class="btn modal-remove__btn cancel">Отмена</button>
      <button class="btn modal-remove__btn ok">Да</button>
    </div>
    `
}

export function openModalReturn(product, id, modalReturn) {
    const arrow = createArrow()

    modalReturn.innerHTML = createModalReturn(product, id)
    modalReturn.classList.add('open-return')

    modalReturn.append(arrow)
    arrow.addEventListener('click', (e) => {
      e.preventDefault()
      modalReturn.classList.remove('open-return')
    })
}

function createModalReturn(product, id) {
    return `
    <h2 class="modal__title">${product.name}</h2>
    <div class="image-preview" id="preview-${product.id}">
        ${product.image
                ? `<img src="${product.image}" alt="${product.name}">`
                : ''
            }
        </div>
      <input type="file"
        id="file-${product.id}"
        accept="image/*"
        style="display: none;">
    <label class="modal-return__label" for="modal-return-date-prod">Дата изготовления</label>
    <input class="input-field modal-return__prod-date" id="modal-return-date-prod" type="date" name="dateProd" data-modal="${id}" max="${dateStartString}" required>
    <div class="modal-return__auto-calc">
    <label class="modal-return__label" for="return-auto">Автоматический расчет по</label>
    <select class="input-field modal-return__select" id="return-auto" style="width: 100%;">
    <option value="" disabled selected>Выберите вариант</option>
    <option value="day">дням</option>
    <option value="month">месяцам</option>
    </select>
    <button class="modal__calculator"><img class="modal__img" src="../img/calculator.svg" alt="Калькулятор"></button>
    </div>
    <button class="btn modal-return__button--calc">Автоматический расчет</button>
    <label class="modal-return__label" for="modal-return-date">Дата окончания срока</label>
    <input class="input-field modal-return__end-date" id="modal-return-date" type="date" name="date" data-modal="${id}" min="${nextDayString}" required>
    <button class="btn modal-return__button" type="submit">Вернуть из архива</button>
    `
}