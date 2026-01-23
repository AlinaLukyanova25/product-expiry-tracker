window.scrollPosition = 0

import {
  productsDB
} from './storage.js'

import {initMenu} from './modules/menu.js'

import {initForms} from './modules/product-form.js'

import {
  sectionHero,
  calcDateStart,
  calcDays,
  calcMonths,
  btnAddToForm,
  dateToAddForm,
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
  ModalManager,
  createModalRemoveAllComponent
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

  const sectionProductsAll = document.getElementById('all-products')
  elementCheck(sectionProductsAll, 'секция Все')
  const sectionProductsFresh = document.getElementById('fresh-products')
  elementCheck(sectionProductsFresh, 'секция Свежие')
  const sectionProductsSoon = document.getElementById('soon-products')
  elementCheck(sectionProductsSoon, 'секция Скоро испортятся')
  const sectionProductsExpired = document.getElementById('expired-products')
  elementCheck(sectionProductsExpired, 'секция Просроченные')
  const sectionArchive = document.getElementById('archive')
  elementCheck(sectionArchive, 'секция Архив')
  const searchForm = document.getElementById('form-search')
  elementCheck(searchForm, 'форма поиска')
  const searchInput = document.getElementById('search')
  elementCheck(searchInput, 'поле поиска')
  const formSearchClear = document.querySelector('.form-search__remove')
  elementCheck(formSearchClear, 'кнопка очистки')

  initMenu()

  //filter

  const filterSelect = document.getElementById('sort-filter')

  if (!filterSelect) {
    console.error('Фильтр не найден')
    return
  }

  filterSelect.addEventListener('change', () => renderAllProducts(productsDB, filterSelect, sections))

  //products
  
  const dateManufactureProduct = document.getElementById('date-manufacture')
  const dateInput = document.getElementById('end-date');

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
  const backdropRemove = document.getElementById('remove-backdrop')
  backdropCheck(backdropRemove)
  const modalReturn = document.getElementById('modal-return')
  modalCheck(modalReturn)
  const backdropReturn = document.getElementById('return-backdrop')
  backdropCheck(backdropReturn)

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

  searchForm.addEventListener('click', removeAllProducts)

  async function removeAllProducts(e) {
    e.preventDefault()
    if (!e.target.closest('.form__btn-remove')) return
    window.scrollPosition = 0

    const products = await productsDB.getAllProducts()

    const allSection = [
      sectionProductsAll,
      sectionProductsFresh,
      sectionProductsSoon,
      sectionProductsExpired,
      sectionArchive,
    ]

    allSection.forEach(element => {
      if (element.style.display !== 'none') {
        const html = createModalRemoveAllComponent(element.querySelector('h2').innerHTML)
        modalRemove.innerHTML = html
        modalRemove.classList.add('open-remove')
        document.body.classList.add('no-scroll');

        modalRemove.addEventListener('click', (e) => {
          const cancel = e.target.closest('.cancel')
          if (cancel) {
          document.querySelector('.form__btn-remove').focus()
          closeModalRemove()
          return
        }

          const ok = e.target.closest('#ok-all')
          if (!ok) return
          element.querySelectorAll('li').forEach(prodCard => {
            const id = +prodCard.dataset.productId
            const product = products.find(prod => prod.id === id)
            console.log(product)

            if (product) {
              removeProducts(id)
            }
          });
        closeModalRemove()
        renderAllProducts(productsDB, filterSelect, sections)
        })
      }
    });
  }

  async function removeProducts(id) {
  await productsDB.deleteProduct(id)
  }

  //transfer

  const sectionForm = document.getElementById('form')
  elementCheck(sectionForm, 'форма')

  btnAddToForm.addEventListener('click', transferToAddForm)

  function transferToAddForm() {
    if (window.innerWidth < 814) {
       sectionForm.style.display = 'flex'
      } else {
      sectionForm.style.display = 'block'
    }
    sectionHero.style.display = 'none'

    const link = document.querySelector('a[href="#form"]');

    link.closest('li').classList.add('active')

    let date = dateToAddForm(calcDateStart.value, calcDays.value, calcMonths.value)
    dateManufactureProduct.value = calcDateStart.value
    dateInput.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
})