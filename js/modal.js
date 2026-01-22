import {
    DateUtils
} from './state.js'

import {
    createArrow,
    showError,
    clearError
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

        this.modal.addEventListener('click', (e) => this.handleModalClick(e))

        this.modal.addEventListener('submit', (e) => this.handleModalSubmit(e))
    }

    async handleDocumnetClick(e) {
        const card = e.target.closest('.section__item')
        if (!card) return

        const id = +card.dataset.productId
        const product = await this.productsDB.getProductById(id)
        
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

    openReturnModal(product, id) {
        const arrow = createArrow()

        this.modalReturn.innerHTML = this.createModalReturnComponent(product, id)
        this.modalReturn.classList.add('open-return')
        this.modalReturn.prepend(arrow)

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
    }

    async handleModalClick(e) {
        if (e.target.closest('.image-preview')) { 
            await this.downloadImage(e)
        }
    }

    async downloadImage(e) {
        const modalDateInput = document.getElementById('modal-date')
        if (!modalDateInput) return

        const id = +modalDateInput.dataset.id
        const product = await this.productsDB.getProductById(id)

        if (!product) {
        console.warn('Продукт не найден')
        return
        }

        const preview = this.modal.querySelector('.image-preview')
        
        try {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
        
            input.onchange = async function (event) {
            const file = event.target.files[0];
            if (!file) return
        
            if (!file.type.startsWith('image/')) {
              alert('Выберите файл для изображения!')
              return
            }
                  
              if (file.size > 5 * 1024 * 1024) {
              alert('Изображение слишком большое. Максимум 5МВ')
              return
            }
        
          const reader = new FileReader()
        
          reader.onload = async function (e) {
            try {
                const compressedImage = await compressImage(e.target.result)
                
            if (!preview.querySelector('img')) {
                preview.innerHTML = `<img src="${compressedImage}" alt="${product.name}">`
            } else {
                preview.querySelector('img').src = compressedImage
                }
                    
            } catch (error) {
              console.error('Ошибка при обработке фото:', error)
            }
                
          }
                  
            reader.onerror = (error) => {
              console.error('Ошибка при чтении файла:', error)
            }
        
            reader.readAsDataURL(file)
                  
            setTimeout(() => input.remove(), 100)
            }
        
          input.click()
                
            } catch(error) {
                console.error('Ошибка при загрузке фото:', error)
              }
    }

    async handleModalSubmit(e) {
        e.preventDefault()

        const modalDateInput = document.getElementById('modal-date')
        const id = +modalDateInput.dataset.id
        const newDateExpiry = modalDateInput.value
        let newDateProduction = modal.dateProd.value

        console.log('Изменяем продукт с id:', id, 'Новая дата:', newDateExpiry)

        const productToUpdate = await this.productsDB.getProductById(id)
        const oldDate = productToUpdate.productionDate

        if (productToUpdate) {
        
            if (oldDate === newDateProduction) {
            let date = new Date(newDateExpiry)
            date.setDate(date.getDate() - productToUpdate.shelfLife)
            if (date > new Date()) {
                showError(this.modal.dateProd, 'Неправильная дата изготовления')
                return
            } else {
                clearError(this.modal.dateProd)
            }
            newDateProduction = date.toISOString().split('T')[0]
            }
              
            productToUpdate.productionDate = newDateProduction
            productToUpdate.expiryDate = newDateExpiry
            productToUpdate.shelfLife = (new Date(newDateExpiry) - new Date(newDateProduction)) / 86400000
              
            console.log('Продукт обновлен:', productToUpdate)

            const modalImage = this.modal.querySelector('.image-preview img')
            if (modalImage && modalImage.src !== productToUpdate.image) {
                productToUpdate.image = modalImage.src
            }
            await this.productsDB.updateProduct(productToUpdate)
            await this.renderAllProducts()
            this.closeModal()     

            this.clearSearch()
        } else {
            console.error('Продукт не найден с id:', id)
        }
    }

    toModalComponent(card, id) {
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

    createModalRemoveComponent(card, id) {
    return `
    <h2 class="modal-remove__title">${card.name}</h2>
    <p class="modal-remove__descr">Вы действительно хотите удалить продукт?</p>
    <div class="modal-remove__buttons">
      <button class="btn modal-remove__btn cancel">Отмена</button>
      <button class="btn modal-remove__btn ok" data-rem="${id}" id="ok-one">Да</button>
    </div>
    `
    }

    createModalReturnComponent(product, id) {
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

    clearSearch() {
        document.querySelectorAll('section').forEach(element => {
            if (element.style.display !== 'none' && element.className !== 'calendar') {
                document.getElementById('search').value = ''
            }
        });
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

export function createModalRemoveAllComponent(section) {
    return `
    <p class="modal-remove__descr">Вы действительно хотите удалить все продукты в секции "${section}"?</p>
    <div class="modal-remove__buttons">
      <button class="btn modal-remove__btn cancel">Отмена</button>
      <button class="btn modal-remove__btn ok" id="ok-all">Да</button>
    </div>
    `
}







