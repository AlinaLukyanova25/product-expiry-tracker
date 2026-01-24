import {
  productsDB
} from './storage.js'

import {initMenu} from './modules/menu.js'

import {initForms} from './modules/product-form.js'

import {
  DateCalculator
} from './calculator.js'

import { calculateDateDifference } from './utils/date-utils.js'

import {
  renderInitialProducts,
  renderProductsToArchive,
  renderProductsToSection,
  renderAllProducts
} from './products.js'

import {
  ModalManager
} from './modal.js'

import {
 ExpiryCalendar,
} from './calendar.js'

import {
  FormSearch
} from './modules/form-search.js'

import {
  modalCheck,
  backdropCheck,
  elementCheck
} from './utils.js'

document.addEventListener('DOMContentLoaded', async function () {
  await productsDB.initialize()

  const searchForm = document.getElementById('form-search')
  elementCheck(searchForm, 'форма поиска')

  initMenu()

  //filter

  const filterSelect = document.getElementById('sort-filter')

  if (!filterSelect) {
    console.error('Фильтр не найден')
    return
  }

  filterSelect.addEventListener('change', () => renderAllProducts(productsDB, filterSelect, sections))

  //products

  initForms(productsDB, () => renderAllProducts(productsDB, filterSelect, sections), calendarR)

  const sections = {
    archive: document.getElementById('archive'),
    all: document.getElementById('all-products'),
    soon: document.getElementById('soon-products'),
    expired: document.getElementById('expired-products'),
    fresh: document.getElementById('fresh-products'),
  }

  renderInitialProducts(productsDB, filterSelect, sections)

  calendarR()

  //modal

  const modal = document.getElementById('modal')
  modalCheck(modal)
  const backdrop = document.getElementById('backdrop')
  backdropCheck(backdrop)
  const modalRemove = document.getElementById('modal-remove')
  modalCheck(modalRemove)
  const modalReturn = document.getElementById('modal-return')
  modalCheck(modalReturn)

  const modalManager = new ModalManager(productsDB, () => renderAllProducts(productsDB, filterSelect, sections))

  document.addEventListener('keydown', function (e) {
    let card;
    if (e.target.closest('.section__btn-remove')) {
      card = e.target.closest('.section__btn-remove')
      if (e.key === 'Enter' || e.keyCode === 13) {
        card.click()
        modalRemove.focus()
      }
      if (e.key === 'Tab') {
        modalRemove.focus()
      }
      return
    }

    if (e.target.closest('.section--archive')) {
      card = e.target.closest('.section__item')
      if (e.key === 'Enter' || e.keyCode === 13) {
        card.click()
        modalReturn.focus()
      }
      if (e.key === 'Tab') {
        modalReturn.focus()
      }
      return
    }

    if (e.target.closest('.section__item')) {
      card = e.target.closest('.section__item')
      if (e.key === 'Enter' || e.keyCode === 13) {
        card.click()
        modal.focus()
      }
      if (e.key === 'Tab') {
        modal.focus()
      }
      return
    }

    if (e.target.closest('.image-preview')) {
      card = e.target.closest('.image-preview')
      if (e.key === 'Enter' || e.keyCode === 13) {
        card.click()
      }
      return
    }

    if (e.target.closest('.form__btn-remove')) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        modalRemove.focus()
      }
      if (e.key === 'Tab') {
        modalRemove.focus()
      }
      return
    }

    if (e.target.closest('.calendar__day')) {
      card = e.target.closest('.calendar__day')
      if (e.key === 'Enter' || e.keyCode === 13) {
        card.click()
        document.querySelector('.modal-calendar').focus()
      }
      if (e.key === 'Tab') {
        document.querySelector('.modal-calendar').focus()
      }
      return
    }

    if (e.target.closest('.calendar-item')) {
      card = e.target.closest('.calendar-item')
      if (e.key === 'Enter' || e.keyCode === 13) {
        card.click()
        modal.focus()
      }
      if (e.key === 'Tab') {
        modal.focus()
      }
      return
    }

    if (e.target.closest('.modal__calculator')) {
      if (e.key === 'Tab') {
        document.querySelector('.modal-form-calculator').focus()
      }
      return
    }
  })

  async function calendarR() {
    const arr = await productsDB.getAllProducts()
    let products = []
    for (let prod of arr) {
      products.push(prod)
    }

    const calendar = new ExpiryCalendar(products)
    calendar.renderCalendar()
  }

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

  searchForm.addEventListener('click', async (e) => {
    if (!e.target.closest('.form__btn-remove')) return
    e.preventDefault()

    const activeSection = Object.values(sections).find(section => section.style.display !== 'none');
    
    if (activeSection) {
      modalManager.openRemoveAllModal(activeSection)
    }
  })
})