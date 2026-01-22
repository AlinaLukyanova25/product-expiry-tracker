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
  validateCalculator,
  calculateExpirationDate,
  dateToAddForm,
  createModalCalculatorComponent,
  createArrow,
} from './calculator.js'

import { calculateDateDifference } from './utils/date-utils.js'

import {
  createProductCardComponent,
  creaeteArchiveCardComponent,
  renderInitialProducts,
  renderProductsToArchive
} from './products.js'

import {
  ModalManager,
  createModalRemoveAllComponent
} from './modal.js'

import {
 ExpiryCalendar,
} from './calendar.js'

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

  filterSelect.addEventListener('change', renderAllProducts)

  //products
  
  const addFormProducts = document.getElementById('add-form');
  const dateManufactureProduct = document.getElementById('date-manufacture')
  const dateInput = document.getElementById('end-date');

  initForms(productsDB, renderAllProducts, calendarR)

  const sections = {
    archive: document.getElementById('archive'),
    all: document.getElementById('all-products'),
    soon: document.getElementById('soon-products'),
    expired: document.getElementById('expired-products'),
    fresh: document.getElementById('fresh-products'),
  }

  renderInitialProducts(productsDB, filterSelect, sections)

  function autoMakeCategory(section, prod) {
    const ul = section.querySelector('ul')
    if (ul.querySelector('p')?.textContent === 'Пока ничего нет...') {
      ul.innerHTML = ''
    }

    let li = document.createElement('li')
    li.classList.add('card', 'section__item')
    li.setAttribute('data-product-id', prod.id)
    li.setAttribute('tabindex', '0')
    li.innerHTML = createProductCardComponent(prod)
    ul.append(li)

    if (section.id === 'all-products' && new Date(prod.expiryDate) < new Date) {
      li.classList.add('shadow')
    }
  }

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

  const modalManager = new ModalManager(productsDB, renderAllProducts)

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

  async function compressImage(dataUrl, maxWidth = 800) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = dataUrl

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height 

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
        resolve(compressedDataUrl)
      }
    })
  }

  async function calendarR() {
    const arr = await productsDB.getAllProducts()
    let products = []
    for (let prod of arr) {
      products.push(prod)
    }

    const calendar = new ExpiryCalendar(products)
    calendar.renderCalendar()
  }

  async function renderAllProducts() {
    console.log('Привет из рендер', await productsDB.getAllProducts())
    const allSection = [
      sectionProductsAll,
      sectionProductsFresh,
      sectionProductsSoon,
      sectionProductsExpired,
      sectionArchive,
    ]

    const arr = await productsDB.getAllProducts()
    let products = []
    for (let a of arr) {
      products.push(a)
    }

    allSection.forEach(section => {
      const ul = section.querySelector('ul')
      if (ul) ul.innerHTML = ''
    });

    if (filterSelect.value === 'date') {
      products = products.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    }
    
    if (filterSelect.value === 'name') {
      products = products.sort((a, b) => a.name.localeCompare(b.name))
    }

    for (let prod of products) {
      if (prod.inArchive) {
        renderProductsToArchive(sectionArchive, prod)
      } else {
      renderProductsFromArray(sectionProductsAll, prod)
      const daysLeft = calculateDateDifference(prod.expiryDate)
      if (daysLeft <= 3 && daysLeft > 0) {
      renderProductsFromArray(sectionProductsSoon, prod)
        } else if (daysLeft <= 0) {
      renderProductsFromArray(sectionProductsExpired, prod)
        } else {
      renderProductsFromArray(sectionProductsFresh, prod)
        }
      }
    }

    allSection.forEach(section => {
      const ul = section.querySelector('ul')
      if (ul.innerHTML === '') ul.innerHTML = '<p>Пока ничего нет...</p>'
    });

    calendarR()
  }

  function renderProductsFromArray(section, product) {
    const ul = section.querySelector('ul')
    if (!ul) return
    
    const li = document.createElement('li')
    li.classList.add('card', 'section__item')
    li.setAttribute('data-product-id', product.id)
    li.setAttribute('tabindex', '0')
    li.innerHTML = createProductCardComponent(product)
    ul.append(li)
    
    if (section.id === 'all-products' && new Date(product.expiryDate) < new Date) {
      li.classList.add('shadow')
    }
  }

  //archive

  modal.addEventListener('click', openCalculator)
  modalReturn.addEventListener('click', openCalculator)
  addFormProducts.addEventListener('click', openCalculator)

  function openCalculator(e) {
    if (this.classList.contains('modal')) {
      addLogicCalculate(this, 'open')
      return
    }
    if (this.classList.contains('modal-return')) {
      addLogicCalculate(this, 'open-return')
      return
    }

    function addLogicCalculate(modal, open) {
      const calcButton = e.target.closest('.modal__calculator')
      if (!calcButton) return
      e.preventDefault()
      
      const formCalculator = document.querySelector('.modal-form-calculator')
      modalCheck(formCalculator)

      const newFormCalculator = formCalculator.cloneNode(true)
      formCalculator.parentNode.replaceChild(newFormCalculator, formCalculator)
  
      const html = createModalCalculatorComponent()
      newFormCalculator.classList.add('open')
      document.body.classList.add('no-scroll');
      newFormCalculator.innerHTML = html
      const arrowBackToModal = createArrow()
      if (!arrowBackToModal) elementCheck(arrow, 'стрелка')
      newFormCalculator.prepend(arrowBackToModal)
      modal.classList.remove(open)

      arrowBackToModal.addEventListener('click', (e) => {
      e.preventDefault()
      newFormCalculator.classList.remove('open')
      modal.classList.add(open)
      calcButton.focus()
      })

      const modalCalcDateStart = document.getElementById('modal-date-start')
      elementCheck(modalCalcDateStart, 'поле ввода')
      const modalDays = document.getElementById('modal-days')
      elementCheck(modalDays, 'поле ввода')
      const modalMonths = document.getElementById('modal-months')
      elementCheck(modalMonths, 'поле ввода')
      const modalCalcDateEnd = document.getElementById('modal-date-end')
      elementCheck(modalCalcDateEnd, 'поле ввода')
      
      newFormCalculator.addEventListener('submit', modalCalculatorSubmit)

      function modalCalculatorSubmit(e) {
      e.preventDefault()
        const add = document.getElementById('modal-add')
        elementCheck(add, 'кнопка добавления')

      if (validateCalculator(modalCalcDateStart, modalDays, modalMonths)) {
        modalCalcDateEnd.textContent = calculateExpirationDate(modalCalcDateStart.value, modalDays.value, modalMonths.value)
        if (add.disabled === true) add.disabled = false
      } else {
        validateCalculator(modalCalcDateStart, modalDays, modalMonths)
        if (add.disabled === false) add.disabled = true
      }
      }
      
    newFormCalculator.addEventListener('click', addDateToInput)

    function addDateToInput(e) {
      
      const addButton = e.target.closest('#modal-add')
      if (!addButton) return
      
      e.preventDefault()
        if (validateCalculator(modalCalcDateStart, modalDays, modalMonths)) {
        modal.dateProd.value = modalCalcDateStart.value
        let date = dateToAddForm(modalCalcDateStart.value, modalDays.value, modalMonths.value)
        modal.date.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        newFormCalculator.classList.remove('open')
        modal.classList.add(open)
        calcButton.focus()
      } else {
        validateCalculator(modalCalcDateStart, modalDays, modalMonths)
      }
    }

  }

    if (this.classList.contains('form__add')) {
      const calcButton = e.target.closest('.modal__calculator')
      if (!calcButton) return
      e.preventDefault()
      const formCalculator = document.querySelector('.modal-form-calculator')
      modalCheck(formCalculator)
      const html = createModalCalculatorComponent()
      const arrow = createArrow()
      if (!arrow) elementCheck(arrow, 'стрелка')
      formCalculator.innerHTML = html
      formCalculator.prepend(arrow)

      formCalculator.classList.add('open')
      document.body.classList.add('no-scroll');
      
    arrow.addEventListener('click', (e) => {
      e.preventDefault()
      formCalculator.classList.remove('open')
      document.body.classList.remove('no-scroll');
      calcButton.focus()
    })

      const modalCalcDateStart = document.getElementById('modal-date-start')
      elementCheck(modalCalcDateStart, 'поле ввода')
      const modalDays = document.getElementById('modal-days')
      elementCheck(modalDays, 'поле ввода')
      const modalMonths = document.getElementById('modal-months')
      elementCheck(modalMonths, 'поле ввода')
      const modalCalcDateEnd = document.getElementById('modal-date-end')
      elementCheck(modalCalcDateEnd, 'поле ввода')

      if (dateManufactureProduct.value) modalCalcDateStart.value = dateManufactureProduct.value

      formCalculator.addEventListener('submit', modalCalculatorSubmit)

      function modalCalculatorSubmit(e) {
      e.preventDefault()
        const add = document.getElementById('modal-add')
        elementCheck(add, 'кнопка добавления')

      if (validateCalculator(modalCalcDateStart, modalDays, modalMonths)) {
        modalCalcDateEnd.textContent = calculateExpirationDate(modalCalcDateStart.value, modalDays.value, modalMonths.value)
        if (add.disabled === true) add.disabled = false
      } else {
        validateCalculator(modalCalcDateStart, modalDays, modalMonths)
        if (add.disabled === false) add.disabled = true
      }
      }

      formCalculator.addEventListener('click', addDateToInput)

      function addDateToInput(e) {
      
      const addButton = e.target.closest('#modal-add')
        if (!addButton) return
      e.preventDefault()
        if (validateCalculator(modalCalcDateStart, modalDays, modalMonths)) {
        dateManufactureProduct.value = modalCalcDateStart.value
        let date = dateToAddForm(modalCalcDateStart.value, modalDays.value, modalMonths.value)
        dateInput.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        formCalculator.classList.remove('open')
        document.body.classList.remove('no-scroll');
        calcButton.focus()
      } else {
        validateCalculator(modalCalcDateStart, modalDays, modalMonths)
      }
      }
      return
    }
  }

  const backdropCalculator = document.getElementById('backdrop-calculator')
  backdropCheck(backdropCalculator)
  backdropCalculator.addEventListener('click', () => {
    document.querySelector('.modal-form-calculator')?.classList.remove('open')
    document.body.classList.remove('no-scroll');
  })

  modalReturn.addEventListener('submit', returnFromArchive)

  async function returnFromArchive(e) {
    e.preventDefault()

    const modalDateInput = document.getElementById('modal-return-date')
    const dateProdInput = document.getElementById('modal-return-date-prod')
    const id = +modalDateInput.dataset.modal
    const product = await productsDB.getProductById(id)
    
    if (!product) {
      console.warn('Продукт не найден')
      return
    }

    product.productionDate = dateProdInput.value
    product.expiryDate = modalDateInput.value
    product.shelfLife = (new Date(modalDateInput.value) - new Date(dateProdInput.value)) / 86400000
    product.inArchive = false

    if (modalReturn.querySelector('.image-preview img')) {
        if (modalReturn.querySelector('.image-preview img').src !== product.image) {
          product.image = modalReturn.querySelector('.image-preview img').src
        }
    }

    await productsDB.updateProduct(product)

    await renderAllProducts()

    modalManager.closeModalReturn()
  }

  const formSearchBtn = document.querySelector('.form-search__btn')
  elementCheck(formSearchBtn, 'кнопка поиска')

  formSearchBtn.addEventListener('click', searchProducts)

  let isSearching = false

  async function searchProducts(e) {
    e.preventDefault()

    if (isSearching) return
    isSearching = true
    try {
      const needProduct = searchInput.value
    if (searchInput.value === '') return
    if (!needProduct) return
    searchInput.removeEventListener('blur', inputBlur)
    searchInput.blur()
    formSearchClear.style.display = 'none'
    searchInput.removeEventListener('input', inputEvent)

    const allSection = [
      sectionProductsAll,
      sectionProductsFresh,
      sectionProductsSoon,
      sectionProductsExpired,
      sectionArchive,
    ]

    const collectionProd = await productsDB.getAllProducts()
    let products = []
    for (let prod of collectionProd) {
      products.push(prod)
    }

    let needProducts = []

    for (const section of allSection) {
      if (section.style.display === 'block') {
        if (section.classList.contains('section--archive')) {
          needProducts = products.filter(prod => prod.inArchive)
          await filterNeedProducts(needProducts, section, needProduct)
          needProducts = []
          break
        }

        if (section.classList.contains('section--expired')) {
          needProducts = products.filter(prod => calculateDateDifference(prod.expiryDate) <= 0 && !prod.inArchive)
          await filterNeedProducts(needProducts, section, needProduct)
          needProducts = []
          break
        }

        if (section.classList.contains('section--soon')) {
          needProducts = products.filter(prod => calculateDateDifference(prod.expiryDate) <= 3 && calculateDateDifference(prod.expiryDate) > 0 && !prod.inArchive)
          await filterNeedProducts(needProducts, section, needProduct)
          needProducts = []
          break
        }

        if (section.classList.contains('section--fresh')) {
          needProducts = products.filter(prod => calculateDateDifference(prod.expiryDate) > 3 && !prod.inArchive)
          await filterNeedProducts(needProducts, section, needProduct)
          needProducts = []
          break
        }

        if (section.classList.contains('section--all')) {
          needProducts = products.filter(prod => !prod.inArchive)
          await filterNeedProducts(needProducts, section, needProduct)
          needProducts = []
          break
        }
      }
    };
    } finally {
      setTimeout(() => isSearching = false, 300)
    }
  }

  searchInput.addEventListener('touchstart', function (e) {
    this.focus()
  }, { passive: false })

  searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      formSearchBtn.click()
    }
  });

  searchInput.addEventListener('input', inputEvent)

  function inputEvent(e) {
    if (searchInput.value !== '') {
      formSearchClear.style.display = 'block'
      renderAllProducts()
    } else {
      formSearchClear.style.display = 'none'
      renderAllProducts()
    }
  }

  searchInput.addEventListener('focus', function (e) {
    let coords = searchInput.getBoundingClientRect()
    formSearchClear.style.left = coords.x + coords.width - 30 + 'px'
    let heightInput = coords.height / 2
    formSearchClear.style.top = Math.round(coords.y + Math.round(heightInput)) - 10 + 'px'
    formSearchClear.style.display = 'block'
  })

  formSearchClear.addEventListener('click', (e) => {
    if (!e.target.closest('.form-search__remove')) return

    if (searchInput.value) {
      searchInput.value = ''
      renderAllProducts()
    }
    searchInput.blur()
    formSearchClear.style.display = 'none'
  })

  searchInput.addEventListener('blur', inputBlur)

  function inputBlur() {
    if (searchInput.value === '') {
      formSearchClear.style.display = 'none'
    } else {
      searchInput.focus()
    }
  }
  
  async function filterNeedProducts(arr, section, inputValue) {
    if (!arr) return
    const ul = section.querySelector('ul')
    ul.innerHTML = ''

    arr.forEach(prod => {
      if (prod.name.toLowerCase().includes(inputValue.toLowerCase())) {
        if (prod.inArchive) {
          renderProductsToArchive(section, prod)
        } else {
          autoMakeCategory(section, prod)
        }
      }
    });

    if (ul.innerHTML === '') ul.innerHTML = 'Ничего не найдено...'
  }

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
        renderAllProducts()
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