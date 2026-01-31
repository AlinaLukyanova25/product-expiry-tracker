import { productsDB } from './storage.js';

import { productCategoryTranslation } from './products.js';

import {formatDateCard, DateUtils} from './utils/date-utils.js';

import { elementCheck, createArrow } from './utils/dom-utils.js';

export class ExpiryCalendar {
  constructor(productsDB) {
    this.currentDate = new Date();
    this.productsDB = productsDB;
    this.products = [];
    this.currentSelectedDate = null;
    this.currentModalProducts = null;
    this.init();

    this.modalContainer = document.querySelector('.modal-calendar');
    this.modalContainer.addEventListener('click', async (e) => {
      if (e.target.closest('.modal-calendar__close')) {
        this.closeModal();
      }
      if (e.target.closest('.calendar-item')) {
        await this.openModalProduct(e);
      }
    });
  }

  async init() {
    await this.loadProducts();
    this.renderCalendar();
    this.setupEventListeners();
  }

  async loadProducts() {
    try {
      const collection = await this.productsDB.getAllProducts();
      this.products = Array.from(collection);
    } catch {
      console.error('Ошибка загрузки продуктов для календаря: ', error);
      this.products = [];
    }
  }

  async update() {
    await this.loadProducts();
    this.renderCalendar();
  }

  updateMonthHeader() {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const currentMonthEl = document.getElementById('current-month');
    elementCheck(currentMonthEl, 'заголовок календаря');
    const monthName = monthNames[this.currentDate.getMonth()];
    const year = this.currentDate.getFullYear();
    currentMonthEl.textContent = `${monthName} ${year}`;
  }

  renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    elementCheck(calendarEl, 'календарь');
    calendarEl.innerHTML = '';

    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const dayInMonth = lastDay.getDate();

    const startingDay = firstDay.getDay();
    const startOffset = startingDay === 0 ? 6 : startingDay - 1;

    for (let i = 0; i < startOffset; i++) {
      const lastMonthFirstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), (0 - (startOffset -1)) + i);
      const day = lastMonthFirstDay.getDate();
            
      const dayEl = this.createDayComponent(lastMonthFirstDay, day, true);
            
      calendarEl.insertAdjacentHTML('beforeend', dayEl);
    }

    for (let day = 1; day <= dayInMonth; day++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            
      const dayEl = this.createDayComponent(date, day);
            
      calendarEl.insertAdjacentHTML('beforeend', dayEl);
    }

    const endingDay = lastDay.getDay();
    const endOffset = endingDay === 0 ? 6 : endingDay - 1;

    const nextMonthDays = 6 - endOffset;
    if (nextMonthDays > 0) {
      for (let i = 0; i < nextMonthDays; i++) {
        const nextMonthFirstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, i + 1);
        const day = nextMonthFirstDay.getDate();
                
        const dayEl = this.createDayComponent(nextMonthFirstDay, day, true);
                
        calendarEl.insertAdjacentHTML('beforeend', dayEl);
      }
    }

    this.updateMonthHeader();
    this.attachEventListeners();
  }

  createDayComponent(date, dayNumber, nextMonth = false) {
    if (!date) {
      return `
            <div tabindex="0" class="calendar__day empty" style="color: gray;">
            ${dayNumber}
            </div>
            `;
    }

    const today = new Date();

    const expiryCount = this.countProductsBeforeDate(date);

    const dateString = this.formatDateToString(date);
        
    return `
        <div tabindex="0"
        ${nextMonth
    ? 'class="calendar__day empty" style="color: gray;"'
    : (date.getDate() === today.getDate()
                && date.getMonth() === today.getMonth()
                && date.getFullYear() === today.getFullYear()
    ) ? 'class="calendar__day today"'
      : 'class="calendar__day"'
}
        data-date="${dateString}"
        >
        ${dayNumber}
        ${expiryCount > 0
    ? `<span class="expiry-badge" ${this.definesColorsComponent(date)}>${expiryCount}</span>`
    : ''
}
        </div>
        `;
  }

  formatDateToString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  attachEventListeners() {
    document.addEventListener('click', (e) => {
      const dayEl = e.target.closest('.calendar__day');
      if (dayEl) {
        const date = new Date(dayEl.dataset.date);
        this.handleDayClick(date);
      }
    });
  }

  countProductsBeforeDate(date) {
    if (!this.products) throw new Error('Массив продуктов не найден');
    return this.products.filter(product => {
      if (!product.expiryDate) return false;
      const expiryDate = new Date(product.expiryDate);

      if (isNaN(expiryDate.getTime())) return;
      if (expiryDate.getFullYear() === date.getFullYear()
                && expiryDate.getMonth() === date.getMonth()
                && expiryDate.getDate() === date.getDate()
                && !product.inArchive
      ) {
        return true;
      }
      return false;
    }).length;
  }

  definesColorsComponent(date) {
    const today = new Date();
    if (date < today || date.getDate() === today.getDate()
            && date.getMonth() === today.getMonth()
            && date.getFullYear() === today.getFullYear()) {
      return 'style="background-color: #ff4757;"';
    } else if (Math.ceil((date - today) / 86400000) <= 3) {
      return 'style="background-color: #f39c12;"';
    } else {
      return 'style="background-color: #27ae60;"';
    }
  }

  handleDayClick(date) {
    const productsOnDate = this.getProductsByDate(date);
    this.showProductsModal(productsOnDate, date);
  }

  getProductsByDate(date) {
    return this.products.filter(product => {
      if (!product.expiryDate) return false;
      const expiryDate = new Date(product.expiryDate);
      if (isNaN(expiryDate.getTime())) return;
      if (expiryDate.getFullYear() === new Date(date).getFullYear()
                && expiryDate.getMonth() === new Date(date).getMonth()
                && expiryDate.getDate() === new Date(date).getDate()
                && !product.inArchive
      ) {
        return true;
      }
      return false;
    });
  }
    
  closeModal() {
    this.modalContainer.classList.remove('open-calendar');
    document.body.classList.remove('no-scroll');
  }

  showProductsModal(products, date) {
    this.currentSelectedDate = date;
    this.currentModalProducts = products;

    const modalCalendar = document.querySelector('.modal-calendar');
        
    modalCalendar.classList.add('open-calendar');
    document.body.classList.add('no-scroll');
    modalCalendar.innerHTML = `
        <div class="modal-calendar__content">
        <h3 class="modal__title">Товары до ${new Date(date).toLocaleDateString()}</h3>
        ${products.length > 0
    ? `<ul id="calendar-list">${products.map(p => `${this.createProductCardComponent(p, date)}`).join('')}</ul>`
    : '<p>Нет товаров с истекающим сроком</p>'
}
        <button class="btn modal-calendar__close" style="width: 100%;">Закрыть</button>
        </div>
        `;
  }

  async openModalProduct(e) {
    const modal = document.getElementById('modal');
    const sections = document.querySelectorAll('section');
    const target = e.target.closest('li');
    if (!target) return;
            
    const id = +target.dataset.id;
    const product = this.currentModalProducts.find(prod => prod.id === id);
        
    if (!product) return;
    const html = this.toModalComponent(product, id);
    modal.innerHTML = html;
    modal.firstElementChild.style.paddingLeft = 28 + 'px';
    modal.firstElementChild.style.marginBottom = 12 + 'px';
        
    const arrow = createArrow();
    modal.prepend(arrow);
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
        
    document.querySelector('.modal-calendar').classList.remove('open-calendar');

    if (this.handleModalSubmit) {
      modal.removeEventListener('submit', this.handleModalSubmit);
    }

    this.handleModalSubmit = async(submitEvent) => {
      submitEvent.preventDefault();
      console.log('SUBMIT ВЫЗВАН');

      setTimeout(async () => {
        try {
          const updateProducts = await productsDB.getAllProducts();
          this.products = updateProducts;

          this.renderCalendar();
                    
          if (this.currentSelectedDate) {
            const currentProducts = this.getProductsByDate(this.currentSelectedDate);
            this.currentModalProducts = currentProducts;

            const modalCalendar = document.querySelector('.modal-calendar');
            const calendarList = modalCalendar.querySelector('#calendar-list');
                

            if (calendarList) {
              if (currentProducts.length > 0) {
                calendarList.innerHTML = currentProducts.map(p => this.createProductCardComponent(p, this.currentSelectedDate)).join('');
              } else {
                calendarList.innerHTML = '<p>Нет товаров с истекающим сроком годности </p>';
              }
            }
                        
            sections.forEach(element => {
              if (modalCalendar && element.style.display !== 'none' && element.className === 'calendar') {
                modalCalendar.classList.add('open-calendar');
                document.body.classList.add('no-scroll');
              } 
            });
          }
                    
          modal.classList.remove('open');
        } catch (error) {
          console.error('Ошибка в handleModalSubmit:', error);
        }
                

        modal.removeEventListener('submit', this.handleModalSubmit);
        this.handleModalSubmit = null;
      }, 100);
    };

    modal.addEventListener('submit', this.handleModalSubmit);

    arrow.addEventListener('click', (e) => {
      e.preventDefault();
      sections.forEach(element => {
        if (element.style.display !== 'none' && element.className === 'calendar') {
                        
          document.querySelector('.modal-calendar').classList.add('open-calendar');
          modal.classList.remove('open');
          document.body.classList.remove('no-scroll');
        }
      });
    });
  }

  createProductCardComponent(product, date) {
    const categoryDisplay = productCategoryTranslation[product.category] || product.category;

    return `
        <li class="card calendar-item" data-id="${product.id}" tabindex="0">
        <div class="image-preview" id="preview-${product.id}">
        ${product.image
    ? `<img src="${product.image}" alt="${product.name}">`
    : ''
}
        </div>
        <div class="modal-calendar__list-content">

        <div class="calendar-item__header">
        <h3 class="card__title">${product.name}</h3>
        </div>
        <div class="calendar-item__footer">
        <div>До ${formatDateCard(date)}</div>
        <div>${categoryDisplay}</div>
        </div>

        </div>
        </li>
        `;
  }

  changeMonth(direction) {
    this.currentDate.setDate(1)
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.renderCalendar();
  }

  setupEventListeners() {
    document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));
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
}

document.getElementById('backdrop-calendar').addEventListener('click', () => {
  document.querySelector('.modal-calendar').classList.remove('open-calendar');
  document.body.classList.remove('no-scroll');
});