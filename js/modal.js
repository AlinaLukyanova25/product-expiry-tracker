import {
  DateUtils,
  showError,
  clearError
} from './utils/date-utils.js';

import { createArrow } from './utils/dom-utils.js';

import { compressImage } from './utils/image-uploader.js';

export class ModalManager {
  constructor(productsDB, renderAllProducts, calendar) {
    this.productsDB = productsDB;
    this.renderAllProducts = renderAllProducts;
    this.calendar = calendar;

    this.modal = document.getElementById('modal');
    this.backdrop = document.getElementById('backdrop');
    this.modalRemove = document.getElementById('modal-remove');
    this.backdropRemove = document.getElementById('remove-backdrop');
    this.modalReturn = document.getElementById('modal-return');
    this.backdropReturn = document.getElementById('return-backdrop');

    this.currentCard = null;

    this.currentRemoveContext = null;
    this.currentSection = null;

    this.scrollPosition = 0;

    this.init();
  }

  init() {
    this.validateElements();
    this.bindEvents();
    console.log('ModalManager инициализирован');
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
        console.error(`${name} не найдено`);
      }
    });
  }

  bindEvents() {
    document.addEventListener('click', (e) => this.handleDocumnetClick(e));

    this.backdrop.addEventListener('click', () => this.closeModal());
    this.backdropRemove.addEventListener('click', () => this.closeModalRemove());
    this.backdropReturn.addEventListener('click', () => this.closeModalReturn());

    this.modalRemove.addEventListener('click', (e) => this.handleRemoveModalClick(e));

    this.modal.addEventListener('click', (e) => this.handleModalClick(e));

    this.modal.addEventListener('submit', (e) => this.handleModalSubmit(e));

    this.modalReturn.addEventListener('click', (e) => this.handleReturnModalClick(e));

    this.modalReturn.addEventListener('submit', (e) => this.handleReturnModalSubmit(e));
  }

  async handleDocumnetClick(e) {
    const card = e.target.closest('.section__item');
    if (!card) return;

    const id = +card.dataset.productId;
    const product = await this.productsDB.getProductById(id);
        
    if (!product) {
      console.error('Product не найден');
      return;
    }

    this.scrollPosition = e.pageY - e.clientY;
    document.body.classList.add('no-scroll');

    if (e.target.closest('.section__btn-remove')) { 
      this.openSingleRemoveModal(product, id);
    } else if (e.target.closest('.section--archive')) {
      this.openReturnModal(product, id);
    } else {
      this.openEditModal(product, id, card);
    }
  }

  openEditModal(product, id, card) {
    const arrow = createArrow();
    const html = this.toModalComponent(product, id);

    this.modal.innerHTML = html;
    this.modal.classList.add('open');
    this.modal.prepend(arrow);

    this.currentCard = card;

    arrow.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeModal(card);
    });
  }

  openSingleRemoveModal(product, id) {
    this.currentRemoveContext = 'single';
    this.productIdToRemove = id;

    const html = this.createModalRemoveComponent(product, id);
    this.modalRemove.innerHTML = html;
    this.modalRemove.classList.add('open-remove');
  }

  openRemoveAllModal(sectionElement, scrollPosition = 0) {
    this.currentRemoveContext = 'all';
    this.currentSection = sectionElement;
    this.scrollPosition = scrollPosition;

    const sectionTitle = sectionElement.querySelector('h2').innerHTML;
    const html = this.createModalRemoveAllComponent(sectionTitle);
    this.modalRemove.innerHTML = html;
    this.modalRemove.classList.add('open-remove');
  }

  openReturnModal(product, id) {
    const arrow = createArrow();

    this.modalReturn.innerHTML = this.createModalReturnComponent(product, id);
    this.modalReturn.classList.add('open-return');
    this.modalReturn.prepend(arrow);

    this.currentCard = document.querySelector(`[data-product-id="${id}"]`);

    arrow.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeModalReturn();
    });
  }

  closeModal() {
    this.modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
    window.scrollTo(0, this.scrollPosition);

    if (this.currentCard) this.currentCard.focus();
  }
    
  closeModalRemove() {
    this.modalRemove.classList.remove('open-remove');
    document.body.classList.remove('no-scroll');
    window.scrollTo(0, this.scrollPosition);

    this.currentRemoveContext = null;
    this.currentSection = null;
    this.productIdToRemove = null;
  }

  closeModalReturn() {
    this.modalReturn.classList.remove('open-return');
    document.body.classList.remove('no-scroll');
    window.scrollTo(0, this.scrollPosition);

    if (this.currentCard) {
      this.currentCard.focus();
    }
  }

  async handleRemoveModalClick(e) {
        
    if (e.target.classList.contains('cancel')) {
      this.closeModalRemove();
      return;
    }

    if (e.target.classList.contains('ok')) {
      if (this.currentRemoveContext === 'single') {
        await this.handleSingleProductRemove();
      } else if (this.currentRemoveContext === 'all') {
        await this.handleAllProductsRemove();
      }
      this.closeModalRemove();
      await this.calendar.update()
    }
  }

  async handleSingleProductRemove() {
    if (this.productIdToRemove) {
      await this.productsDB.deleteProduct(+this.productIdToRemove);
      await this.renderAllProducts();
    }
  }

  async handleAllProductsRemove() {
    if (!this.currentSection) return;

    const products = await this.productsDB.getAllProducts();
    const productCards = this.currentSection.querySelectorAll('li');

    for (const card of productCards) {
      const id = +card.dataset.productId;
      const product = products.find(prod => prod.id = id);
      if (product) {
        await this.productsDB.deleteProduct(id);
      }
    }
    await this.renderAllProducts();
  }

  async handleModalClick(e) {
    if (e.target.closest('.image-preview')) { 
      await this.downloadImage(e, this.modal);
      return;
    }

    if (e.target.closest('.modal__push-archive')) {
      await this.pushToArchive(e);
      return;
    }

    if (e.target.closest('.modal__button--calc')) {
      await this.autoCalculate(e, this.modal);
      return;
    }
  }
    
  async handleReturnModalClick(e) {
    if (e.target.closest('.image-preview')) {
      await this.downloadImage(e, this.modalReturn);
      return;
    }

    if (e.target.closest('.modal-return__button--calc')) {
      await this.autoCalculate(e, this.modalReturn);
      return;
    }
  }

  async downloadImage(e, modal) {
    const modalDateInput = modal.date;
    if (!modalDateInput) return;

    const id = +modalDateInput.dataset.id;
    const product = await this.productsDB.getProductById(id);

    if (!product) {
      console.warn('Продукт не найден');
      return;
    }

    const preview = modal.querySelector('.image-preview');
        
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
        
      input.onchange = async function (event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
          alert('Выберите файл для изображения!');
          return;
        }
                  
        if (file.size > 5 * 1024 * 1024) {
          alert('Изображение слишком большое. Максимум 5МВ');
          return;
        }
        
        const reader = new FileReader();
        
        reader.onload = async function (e) {
          try {
            const compressedImage = await compressImage(e.target.result);
                
            if (!preview.querySelector('img')) {
              preview.innerHTML = `<img src="${compressedImage}" alt="${product.name}">`;
            } else {
              preview.querySelector('img').src = compressedImage;
            }
                    
          } catch (error) {
            console.error('Ошибка при обработке фото:', error);
          }
                
        };
                  
        reader.onerror = (error) => {
          console.error('Ошибка при чтении файла:', error);
        };
        
        reader.readAsDataURL(file);
                  
        setTimeout(() => input.remove(), 100);
      };
        
      input.click();
                
    } catch(error) {
      console.error('Ошибка при загрузке фото:', error);
    }
  }

  async handleModalSubmit(e) {
    e.preventDefault();

    const modalDateInput = document.getElementById('modal-date');
    const id = +modalDateInput.dataset.id;
    const newDateExpiry = modalDateInput.value;
    let newDateProduction = modal.dateProd.value;

    console.log('Изменяем продукт с id:', id, 'Новая дата:', newDateExpiry);

    const productToUpdate = await this.productsDB.getProductById(id);
    const oldDate = productToUpdate.productionDate;

    if (productToUpdate) {
        
      if (oldDate === newDateProduction) {
        let date = new Date(newDateExpiry);
        date.setDate(date.getDate() - productToUpdate.shelfLife);
        if (date > new Date()) {
          showError(this.modal.dateProd, 'Неправильная дата изготовления');
          return;
        } else {
          clearError(this.modal.dateProd);
        }
        newDateProduction = date.toISOString().split('T')[0];
      }
              
      productToUpdate.productionDate = newDateProduction;
      productToUpdate.expiryDate = newDateExpiry;
      productToUpdate.shelfLife = (new Date(newDateExpiry) - new Date(newDateProduction)) / 86400000;
              
      console.log('Продукт обновлен:', productToUpdate);

      const modalImage = this.modal.querySelector('.image-preview img');
      if (modalImage && modalImage.src !== productToUpdate.image) {
        productToUpdate.image = modalImage.src;
      }
      await this.productsDB.updateProduct(productToUpdate);
      await this.renderAllProducts();
      this.closeModal(); 
      await this.calendar.update()

      this.clearSearch();
    } else {
      console.error('Продукт не найден с id:', id);
    }
  }

  async handleReturnModalSubmit(e) {
    e.preventDefault();

    const modalDateInput = document.getElementById('modal-return-date');
    const dateProdInput = document.getElementById('modal-return-date-prod');
    const id = +modalDateInput.dataset.id;
    const product = await this.productsDB.getProductById(id);
            
    if (!product) {
      console.warn('Продукт не найден');
      return;
    }

    product.productionDate = dateProdInput.value;
    product.expiryDate = modalDateInput.value;
    product.shelfLife = (new Date(modalDateInput.value) - new Date(dateProdInput.value)) / 86400000;
    product.inArchive = false;
        
    const modalImage = this.modalReturn.querySelector('.image-preview img');
    if (modalImage && modalImage.src !== product.image) {
      product.image = this.modalReturn.querySelector('.image-preview img').src;
    }
        
    await this.productsDB.updateProduct(product);
        
    await this.renderAllProducts();
        
    this.closeModalReturn();

    await this.calendar.update()
  }

  async pushToArchive(e) {
    e.preventDefault();

    const modalDateInput = document.getElementById('modal-date');
    const id = +modalDateInput.dataset.id;
    const product = await this.productsDB.getProductById(id);
        
    if (product) {
      product.inArchive = true;
        
      console.log('Продукт обновлен:', product);
        
      await this.productsDB.updateProduct(product);
        
      await this.renderAllProducts();
        
      this.closeModal();
    }
  }

  async autoCalculate(e, modal) {
    e.preventDefault();

    const modalDateInput = modal.date;
    const id = +modalDateInput.dataset.id;
    const product = await this.productsDB.getProductById(id);
    const modalSelect = modal.querySelector('select');

    if (modalSelect.value === 'day') {
      let date = new Date(modal.dateProd.value);
            
      date.setDate(date.getDate() + product.shelfLife);
            
      modalDateInput.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    if (modalSelect.value === 'month') {
      const startDate = new Date(modal.dateProd.value);

      const months = (new Date(product.expiryDate) - new Date(product.productionDate)) / 86400000 / 30;
      
      startDate.setMonth(startDate.getMonth() + Math.round(months));
      
      modalDateInput.value = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
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
    `;
  }

  createModalRemoveComponent(card, id) {
    return `
    <h2 class="modal-remove__title">${card.name}</h2>
    <p class="modal-remove__descr">Вы действительно хотите удалить продукт?</p>
    <div class="modal-remove__buttons">
      <button class="btn modal-remove__btn cancel">Отмена</button>
      <button class="btn modal-remove__btn ok" data-rem="${id}" id="ok-one">Да</button>
    </div>
    `;
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
    <input class="input-field modal-return__end-date" id="modal-return-date" type="date" name="date" data-modal="${id}" data-id="${id}" min="${DateUtils.getTomorrowDateString()}" style="width: 100%;" required>
    <button class="btn modal-return__button" type="submit">Вернуть из архива</button>
    `;
  }

  createModalRemoveAllComponent(section) {
    return `
    <p class="modal-remove__descr">Вы действительно хотите удалить все продукты в секции "${section}"?</p>
    <div class="modal-remove__buttons">
      <button class="btn modal-remove__btn cancel">Отмена</button>
      <button class="btn modal-remove__btn ok" id="ok-all">Да</button>
    </div>
    `;
  }

  clearSearch() {
    document.querySelectorAll('section').forEach(element => {
      if (element.style.display !== 'none' && element.className !== 'calendar') {
        document.getElementById('search').value = '';
      }
    });
  }
}