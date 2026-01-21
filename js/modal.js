import {
    DateUtils
} from './state.js'

import {
    createArrow
} from './calculator.js'

import { compressImage } from './utils/image-uploader.js'

export class ModalManager {
    constructor(productsDB, renderAllProducts) {
        this.productsDB = productsDB;
        this.renderAllProducts = renderAllProducts;

        this.modal = document.getElementById('modal');
        this.backdrop = document.getElementById('backdrop');
        this.modalRemove = document.getElementById('modal-remove');
        this.backdropRemove = document.getElementById('remove-backdrop');
        this.modalReturn = document.getElementById('modal-return');
        this.backdropReturn = document.getElementById('return-backdrop');

        this.currentProductId = null;
        this.currentCard = null;
        this.scrollPosition = 0;

        this.init()
    }

    init() {
        this.validateElements();
        this.bindEvents();
        console.log('ModalManager инициализирован')
    }

    validateElements() {
        const elements = [
            { el: this.modal, name: 'modal' },
            { el: this.backdrop, name: 'backdrop' },
            { el: this.modalRemove, name: 'modalRemove' },
            { el: this.backdropRemove, name: 'backdropRemove' },
            { el: this.modalReturn, name: 'modalReturn' },
            { el: this.backdropReturn, name: 'backdropReturn' },
        ];

        elements.forEach(({el, name}) => {
            if(!el) {
                console.error(`${name} не найдено`)
            }
        });
    }

    bindEvents() {
        document.addEventListener('click', (e) => this.handleDocumnetClick(e))

        this.backdrop.addEventListener('click', () => this.closeModal())
        this.backdropRemove.addEventListener('click', () => this.closeModalRemove())
        this.backdropReturn.addEventListener('click', () => this.closeModalReturn())

        this.modalRemove.addEventListener('click', (e) => this.handleRemoveModalClick(e))

        this.modal.addEventListener('click', (e) => this.handleModalClick)

        this.modal.addEventListener('submit', (e) => this.handleModalSubmit)
    }

    async handleDocumnetClick(e) {
        const card = e.target.closest('.section__item')
        if (!card) return

        const id = +card.dataset.productId
        const product = await productsDB.getProductById(id)
        
        if (!product) {
            console.error('Product не найден')
            return
        }

        this.scrollPosition = e.pageY - e.clientY
        document.body.classList.add('no-scroll')

        if (e.target.closest('.section__btn-remove')) { 
            this.openRemoveModal(product, id)
        } else if (e.target.closest('.section--archive')) {
            this.openReturnModal(product, id)
        } else {
            this.openEditModal(product, id, card)
        }
    }

    openEditModal(product, id, card) {
        const arrow = createArrow()
        const html = this.toModalComponent(product, id)

        this.modal.innerHTML = html
        this.modal.classList.add('open')
        this.modal.prepend(arrow)

        this.currentCard = card;
        this.currentProductId = id;

        arrow.addEventListener('click', (e) => {
            e.preventDefault()
            this.closeModal(card)
        })
    }

    openRemoveModal(product, id) {
        const html = createModalRemoveComponent(product, id)
        this.modalRemove.innerHTML = html
        this.modalRemove.classList.add('open-remove')
        this.currentProductId = id
    }

    openModalReturn(product, id) {
        const arrow = createArrow()

        this.modalReturn.innerHTML = createModalReturnComponent(product, id)
        this.modalReturn.classList.add('open-return')
        modalReturn.prepend(arrow)

        this.currentProductId = id
        this.currentCard = document.querySelector(`[data-product-id="${id}"]`)

        arrow.addEventListener('click', (e) => {
            e.preventDefault()
            this.closeModalReturn()
        // modalReturn.classList.remove('open-return')
        // document.body.classList.remove('no-scroll');
        // window.scrollTo(0, window.scrollPosition)
        // document.querySelector(`[data-product-id="${id}"]`).focus()
        })
    }

    closeModal() {
        this.modal.classList.remove('open')
        document.body.classList.remove('no-scroll')
        window.scrollTo(0, this.scrollPosition)

        if (this.currentCard) this.currentCard.focus()
    }
    
    closeModalRemove() {
        this.modalRemove.classList.remove('open-remove')
        document.body.classList.remove('no-scroll');
        window.scrollTo(0, this.scrollPosition)
    }

    closeModalReturn() {
        this.modalReturn.classList.remove('open-return')
        document.body.classList.remove('no-scroll');
        window.scrollTo(0, this.scrollPosition)

        if (this.currentCard) {
            this.currentCard.focus()
        }
    }

    async handleRemoveModalClick(e) {
        const cancel = e.target.closest('.cancel')
            // if (cancel) {
            //   const id = document.querySelector('#ok-one').dataset.rem
            //   document.querySelector(`[data-product-id="${id}"]`).focus()
            //   closeModalRemove()
            //   return
            // }
        
        if (e.target.classList.contains('cancel')) {
            this.closeModalRemove()
            return
        }

        if (e.target.classList.contains('ok')) {
            const id = e.target.dataset.rem

            if (id) {
                await this.productsDB.deleteProduct(+id)
                await this.renderAllProducts()
                this.closeModalRemove()
            }
        }
            // const ok = e.target.closest('#ok-one')
            // const products = await productsDB.getAllProducts()
        
            // if (ok) {
            //   const id = +ok.dataset.rem
            //   const product = products.find(prod => prod.id === id)
            //   console.log(product)
        
            //   if (product) {
            //     removeProduct(product.id)
            //   }
            //   return
            // }
            // return
    }
}


export function toModalComponent(card, id) {
    return `
    <h2 class="modal__title">${card.name}</h2>
    <div class="image-preview" id="preview-${card.id}" tabindex="0">
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
    <input class="input-field modal__date-production" id="modal-date-production" type="date" name="dateProd" data-id="${id}" max="${DateUtils.getTodayDateString()}" value="${card.productionDate}" style="width: 100%;" required>
    <div class="modal__auto-calc">
    <label class="modal__label" for="auto">Автоматический расчет по</label>
    <select class="input-field modal__select" id="auto" style="width: 100%;">
    <option value="" disabled selected>Выберите вариант</option>
    <option value="day">дням</option>
    <option value="month">месяцам</option>
    </select>
    <button class="modal__calculator"><img class="modal__img" src="img/calculator.svg" alt="Калькулятор"></button>
    </div>
    <button class="btn modal__button--calc">Автоматический расчет</button>
    <label class="modal__label" for="modal-date">Дата окончания срока</label>
    <input class="input-field modal__end-date" id="modal-date" type="date" name="date" data-id="${id}" min="${DateUtils.getTomorrowDateString()}" value="${card.expiryDate}" style="width: 100%;" required>
    <button class="btn modal__button" type="submit">Сохранить изменения</button>
    <button class="btn modal__push-archive">Добавить в архив</button>
    `
}

export function createModalRemoveComponent(card, id) {
    return `
    <h2 class="modal-remove__title">${card.name}</h2>
    <p class="modal-remove__descr">Вы действительно хотите удалить продукт?</p>
    <div class="modal-remove__buttons">
      <button class="btn modal-remove__btn cancel">Отмена</button>
      <button class="btn modal-remove__btn ok" data-rem="${id}" id="ok-one">Да</button>
    </div>
    `
}

export function createModalRemoveAllComponent(section) {
    return `
    <p class="modal-remove__descr">Вы действительно хотите удалить все продукты в секции "${section}"?</p>
    <div class="modal-remove__buttons">
      <button class="btn modal-remove__btn cancel">Отмена</button>
      <button class="btn modal-remove__btn ok" id="ok-all">Да</button>
    </div>
    `
}

export function openModalReturn(product, id, modalReturn) {
    const arrow = createArrow()

    modalReturn.innerHTML = createModalReturnComponent(product, id)
    modalReturn.classList.add('open-return')

    modalReturn.prepend(arrow)
    arrow.addEventListener('click', (e) => {
    e.preventDefault()
    modalReturn.classList.remove('open-return')
    document.body.classList.remove('no-scroll');
    window.scrollTo(0, window.scrollPosition)
    document.querySelector(`[data-product-id="${id}"]`).focus()
    })
}

function createModalReturnComponent(product, id) {
    return `
    <h2 class="modal__title">${product.name}</h2>
    <div class="image-preview" id="preview-${product.id}" tabindex="0">
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
    <input class="input-field modal-return__prod-date" id="modal-return-date-prod" type="date" name="dateProd" data-modal="${id}" max="${DateUtils.getTodayDateString()}" style="width: 100%;" required>
    <div class="modal-return__auto-calc">
    <label class="modal-return__label" for="return-auto">Автоматический расчет по</label>
    <select class="input-field modal-return__select" id="return-auto" style="width: 100%;">
    <option value="" disabled selected>Выберите вариант</option>
    <option value="day">дням</option>
    <option value="month">месяцам</option>
    </select>
    <button class="modal__calculator"><img class="modal__img" src="img/calculator.svg" alt="Калькулятор"></button>
    </div>
    <button class="btn modal-return__button--calc">Автоматический расчет</button>
    <label class="modal-return__label" for="modal-return-date">Дата окончания срока</label>
    <input class="input-field modal-return__end-date" id="modal-return-date" type="date" name="date" data-modal="${id}" min="${DateUtils.getTomorrowDateString()}" style="width: 100%;" required>
    <button class="btn modal-return__button" type="submit">Вернуть из архива</button>
    `

}







