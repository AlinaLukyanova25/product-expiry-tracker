import { productsDB } from './storage.js';

import {initMenu} from './modules/menu.js';

import { initForms } from './modules/product-form.js';

import { HeroCalculator } from './modules/hero-calculator.js';

import { DateCalculator } from './modules/modal-calculator.js';

import { calculateDateDifference } from './utils/date-utils.js';

import {
  renderInitialProducts,
  renderProductsToArchive,
  renderProductsToSection,
  renderAllProducts
} from './products.js';

import { ModalManager } from './modal.js';

import { ExpiryCalendar } from './calendar.js';

import { FormSearch } from './modules/form-search.js';

import { KeyboardNavigation } from './modules/keyboard-navigation.js';

import { elementCheck } from './utils/dom-utils.js';

document.addEventListener('DOMContentLoaded', async function () {
  try {
    await productsDB.initialize();

    /* eslint-disable no-unused-vars */
    const heroCalculator = new HeroCalculator();

    const sections = {
      archive: document.getElementById('archive'),
      all: document.getElementById('all-products'),
      soon: document.getElementById('soon-products'),
      expired: document.getElementById('expired-products'),
      fresh: document.getElementById('fresh-products'),
    };

    const searchForm = document.getElementById('form-search');
    elementCheck(searchForm, 'форма поиска');

    initMenu();

    const filterSelect = document.getElementById('sort-filter');
    elementCheck(filterSelect, 'фильтр сортировки');

    const calendar = new ExpiryCalendar(productsDB);
    
    const modalManager = new ModalManager(productsDB, () => renderAllProducts(productsDB, filterSelect, sections), calendar);

    initForms(productsDB, () => renderAllProducts(productsDB, filterSelect, sections), calendar);

    renderInitialProducts(productsDB, filterSelect, sections);

    /* eslint-disable no-unused-vars */
    const dateCalculator = new DateCalculator();

    /* eslint-disable no-unused-vars */
    const formSearch = new FormSearch({
      searchInput: document.getElementById('search'),
      formSearchBtn: document.querySelector('.form-search__btn'),
      formSearchClear: document.querySelector('.form-search__remove'),
      sections,
      productsDB,
      filterSelect,
      renderAllProducts,
      renderProductsToArchive,
      renderProductsToSection,
      calculateDateDifference
    });

    /* eslint-disable no-unused-vars */
    const keyboardNav = new KeyboardNavigation({
      modal: document.getElementById('modal'),
      modalRemove: document.getElementById('modal-remove'),
      modalReturn: document.getElementById('modal-return'),
    });

    searchForm.addEventListener('click', async (e) => {
      if (!e.target.closest('.form__btn-remove')) return;
      e.preventDefault();

      const activeSection = Object.values(sections).find(section => section.style.display !== 'none');
    
      if (activeSection) {
        modalManager.openRemoveAllModal(activeSection);
      }
    });
    
  } catch {
    console.error('Ошибка инициализации приложения', error);
    alert('Произошла ошибка при загрузке приложения. Пожалуйста, обновите страницу.');
  }
});