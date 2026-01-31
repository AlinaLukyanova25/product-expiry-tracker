import {
  validateCalculator,
  calculateExpirationDate,
  dateToAddForm
} from './../utils/date-utils.js';

import { elementCheck } from './../utils/dom-utils.js';

import { DateUtils } from './../utils/date-utils.js';

export class HeroCalculator {
  constructor() {
    this.calcDateStart = document.getElementById('date-start');
    this.sectionHero = document.getElementById('hero');
    this.calcForm = document.getElementById('calculator');
    this.calcDays = document.getElementById('days');
    this.calcMonths = document.getElementById('months');
    this.calcDateEnd = document.getElementById('end');
    this.btnAddToForm = document.getElementById('calc-add');

    this.checkElements();
    this.init();
  }

  checkElements() {
    elementCheck(this.calcDateStart, 'поле ввода');
    elementCheck(this.sectionHero, 'секция hero');
    elementCheck(this.calcForm, 'форма калькулятора');
    elementCheck(this.calcDays, 'поле ввода');
    elementCheck(this.calcMonths, 'поле ввода');
    elementCheck(this.calcDateEnd, 'поле для даты окончания');
    elementCheck(this.btnAddToForm, 'кнопка добавления');
  }

  init() {
    if (DateUtils && DateUtils.setMaxDate) {
      DateUtils.setMaxDate(this.calcDateStart);
    }

    this.setupEventListeners();
    this.setupFormTransfer();
  }

  setupEventListeners() {
    this.calcForm.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();

    if (validateCalculator(this.calcDateStart, this.calcDays, this.calcMonths)) {
      this.calcDateEnd.textContent = calculateExpirationDate(
        this.calcDateStart.value,
        this.calcDays.value,
        this.calcMonths.value
      );
      this.btnAddToForm.style.display = 'block';
    }
  }

  setupFormTransfer() {
    const dateManufactureProduct = document.getElementById('date-manufacture');
    const dateInput = document.getElementById('end-date');
    const sectionForm = document.getElementById('form');

    if (dateManufactureProduct && dateInput && sectionForm) {
      elementCheck(sectionForm, 'форма');

      this.btnAddToForm.addEventListener('click', () => {
        this.transferToAddForm(dateManufactureProduct, dateInput, sectionForm);
      });
    }
  }
    
  transferToAddForm(dateManufactureProduct, dateInput, sectionForm) {
    if (window.innerWidth < 814) {
      sectionForm.style.display = 'flex';
    } else {
      sectionForm.style.display = 'block';
    }
    this.sectionHero.style.display = 'none';
        
    const link = document.querySelector('a[href="#form"]');
        
    if (link) {
      link.closest('li').classList.add('active');
    }
            
        
    let date = dateToAddForm(
      this.calcDateStart.value,
      this.calcDays.value,
      this.calcMonths.value
    );
            
    dateManufactureProduct.value = this.calcDateStart.value;
    dateInput.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}