import { productsDB } from './storage.js'

import {initMenu} from './modules/menu.js'

import { initForms } from './modules/product-form.js'

import { HeroCalculator } from './modules/hero-calculator.js'

import { DateCalculator } from './modules/modal-calculator.js'

import { calculateDateDifference } from './utils/date-utils.js'

import {
  renderInitialProducts,
  renderProductsToArchive,
  renderProductsToSection,
  renderAllProducts
} from './products.js'

import { ModalManager } from './modal.js'

import { ExpiryCalendar } from './calendar.js'

import { FormSearch } from './modules/form-search.js'

import { KeyboardNavigation } from './modules/keyboard-navigation.js'

import { elementCheck } from './utils/dom-utils.js'

document.addEventListener('DOMContentLoaded', async function () {
  await productsDB.initialize()

  const heroCalculator = new HeroCalculator()

  const sections = {
    archive: document.getElementById('archive'),
    all: document.getElementById('all-products'),
    soon: document.getElementById('soon-products'),
    expired: document.getElementById('expired-products'),
    fresh: document.getElementById('fresh-products'),
  }

  const searchForm = document.getElementById('form-search')
  elementCheck(searchForm, 'форма поиска')

  initMenu()

  const filterSelect = document.getElementById('sort-filter')

  const calendar = new ExpiryCalendar(productsDB)

  initForms(productsDB, () => renderAllProducts(productsDB, filterSelect, sections), calendar)

  renderInitialProducts(productsDB, filterSelect, sections)

  const modalManager = new ModalManager(productsDB, () => renderAllProducts(productsDB, filterSelect, sections))

  const dateCalculator = new DateCalculator()

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
  })

  const keyboardNav = new KeyboardNavigation({
    modal: document.getElementById('modal'),
    modalRemove: document.getElementById('modal-remove'),
    modalReturn: document.getElementById('modal-return'),
  })

  searchForm.addEventListener('click', async (e) => {
    if (!e.target.closest('.form__btn-remove')) return
    e.preventDefault()

    const activeSection = Object.values(sections).find(section => section.style.display !== 'none');
    
    if (activeSection) {
      modalManager.openRemoveAllModal(activeSection)
    }
  })
})