import {
  openDatabase,
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById
} from './storage.js'

import {
  dateInput
} from './state.js'

import {
  dateStartString,
  sectionHero,
  calcDateStart,
  calcDays,
  calcMonths,
  btnAddToForm,
  validateCalculator,
  calculateExpirationDate,
  dateToAddForm,
  createModalCalculator,
  createArrow
} from './calculator.js'

import {
  createProductCard,
  calculateDateDifference,
  creaeteArchiveCard,
} from './products.js'

import {
  toModal,
  createModalRemove,
  openModalReturn,
  createModalRemoveAll
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
  await openDatabase()

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

  //menu

  const menu = document.querySelector('.nav')

  if (menu) {
    menu.addEventListener('click', openSection)
  } else {
    console.error('Меню не найдено')
    return
  }

  function openSection(e) {
    if (!e.target.closest('li')) return
    e.preventDefault()
    
    searchForm.style.display = 'none'
    if (searchInput) searchInput.value = ''
    if (formSearchClear) formSearchClear.style.display = 'none'

    const menuLi = menu.querySelectorAll('li')
    menuLi.forEach(element => {
      element.classList.remove('active')
    });

    const target = e.target.closest('li')

    const aHref = target.querySelector('a').href
    let id;
    const sections = document.querySelectorAll('section')
    sections.forEach(element => {
      element.style.display = 'none'
      let searchId = aHref.indexOf(element.id)
      if (searchId > -1) {
        target.classList.add('active')
        if (element.classList.contains('form') && window.innerWidth < 814) {
          element.style.display = 'flex'
        } else {
          element.style.display = 'block'
        }
        if (element.id === 'all-products' || element.id === 'fresh-products' 
          || element.id === 'soon-products'
          || element.id === 'expired-products'
          || element.id === 'archive'
        ) {
        searchForm.style.display = 'flex'
      }
      }
    });
  }

  //filter

  const filterSelect = document.getElementById('sort-filter')

  if (!filterSelect) {
    console.error('Фильтр не найден')
    return
  }

  filterSelect.addEventListener('change', renderAllProducts)

  //products
  
  const addFormProducts = document.getElementById('add-form');
  const nameProduct = document.getElementById('name-product');
  const categoryProduct = document.getElementById('category');
  const dateManufactureProduct = document.getElementById('date-manufacture')

  if (dateManufactureProduct) {
    dateManufactureProduct.setAttribute('max', dateStartString)
  } else {
    console.error('Дата изготовления не найдена')
    return
  }
  
  let products;

  if (!addFormProducts) {
    console.error('Форма добавления не найдена')
    return
  }

  addFormProducts.addEventListener('click', downloadImageForm)
    
  
  async function downloadImageForm(e) {

    if (e.target.closest('.image-preview')) {

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
        
          addFormProducts.querySelector('.image-preview').innerHTML = `<img src="${compressedImage}" alt="Фото продукта">`
        
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
      
      return 
    }
  }
  
  addFormProducts.addEventListener('submit', async function (e) {
    e.preventDefault();
    const days = (new Date(dateInput.value) - new Date(dateManufactureProduct.value)) / 86400000
    const imageUrl = (addFormProducts.querySelector('.image-preview img')) ? addFormProducts.querySelector('.image-preview img').src : null
    let product = {
      id: Date.now(),
      name: nameProduct.value,
      productionDate: dateManufactureProduct.value || null,
      expiryDate: dateInput.value || null,
      shelfLife: (new Date(dateInput.value) - new Date(dateManufactureProduct.value)) / 86400000 || null,
      category: categoryProduct.value,
      inArchive: false,
      image: imageUrl,
      addedDate: new Date().toISOString().split('T')[0]
    }

    await addProduct(product)
    console.log(await getAllProducts())

    addFormProducts.querySelector('.image-preview').innerHTML = ''
    renderAllProducts()
    calendarR()

    addFormProducts.reset()
  })
 
  async function autoRenderProduct() {
    const products = await getAllProducts()
    let arr = []
    for (let prod of products) {
      arr.push(prod)
    }
    if (filterSelect.value === 'date') {
      arr = arr.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    }

    if (filterSelect.value === 'name') {
      arr = arr.sort((a, b) => a.name.localeCompare(b.name))
    }
    for (let prod of arr) {
      if (prod.inArchive) {
        renderProductsToArchive(sectionArchive, prod)
      } else {
      autoMakeCategory(sectionProductsAll, prod)
      const daysLeft = calculateDateDifference(prod.expiryDate)
      if (daysLeft <= 3 && daysLeft > 0) {
      autoMakeCategory(sectionProductsSoon, prod)
        } else if (daysLeft <= 0) {
      autoMakeCategory(sectionProductsExpired, prod)
        } else {
      autoMakeCategory(sectionProductsFresh, prod)
        }
      }
    }
  }

  function autoMakeCategory(section, prod) {
    const ul = section.querySelector('ul')
    if (ul.querySelector('p')?.textContent === 'Пока ничего нет...') {
      ul.innerHTML = ''
    }

    let li = document.createElement('li')
    li.classList.add('card', 'section__item')
    li.setAttribute('data-product-id', prod.id)
    li.innerHTML = createProductCard(prod)
    ul.append(li)

    if (section.id === 'all-products' && new Date(prod.expiryDate) < new Date) {
      li.classList.add('shadow')
    }
  }

  autoRenderProduct()
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

  document.addEventListener('click', openModal)
  backdrop.addEventListener('click', closeModal)
  backdropRemove.addEventListener('click', closeModalRemove)
  modalRemove.addEventListener('click', removeOrCloseModal)
  backdropReturn.addEventListener('click', closeModalReturn)
  

  async function openModal(e) {
    const card = e.target.closest('.section__item')
    if (!card) return 
    const id = +card.dataset.productId
    const products = await getAllProducts()
    const product = products.find(prod => prod.id === id)

    if (!product) {
      console.error('Product не найден')
      return
    }

    if (e.target.closest('.section__btn-remove')) {
      const htmlModalRemove = createModalRemove(product, card.dataset.productId)
      modalRemove.innerHTML = htmlModalRemove
      modalRemove.classList.add('open-remove')
      document.body.classList.add('no-scroll');
      return
    }

    if (e.target.closest('.section__archive')) {
      openModalReturn(product, card.dataset.productId, modalReturn)
      document.body.classList.add('no-scroll');
      return
    }

    const arrow = createArrow()
    if (!arrow) elementCheck(arrow, 'стрелка')
  
    const html = toModal(product, id)
    modal.innerHTML = html
    modal.classList.add('open')
    modal.append(arrow)
    arrow.addEventListener('click', (e) => {
      e.preventDefault()
      modal.classList.remove('open')
      document.body.classList.remove('no-scroll');
    })
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    modal.classList.remove('open')
    document.body.classList.remove('no-scroll');
  }

  function closeModalRemove() {
    modalRemove.classList.remove('open-remove')
    document.body.classList.remove('no-scroll');
  }

  function closeModalReturn() {
    modalReturn.classList.remove('open-return')
    document.body.classList.remove('no-scroll');
  }

  modal.addEventListener('click', downloadImage)

  async function downloadImage(e) {

    if (e.target.closest('.image-preview')) {
      const modalDateInput = document.getElementById('modal-date')
    const id = +modalDateInput.dataset.id
        const products = await getAllProducts()
      const product = products.find(p => p.id === id)
      const prodIm = product.image
      if (!product) {
        console.warn('Продукт не найден')
        return
      }
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
        
    if (!modal.querySelector('.image-preview img')) {
      modal.querySelector('.image-preview').innerHTML = `<img src="${compressedImage}" alt="${product.name}">`
    } else {
      modal.querySelector('.image-preview img').src = compressedImage
    }
            
    await updateProduct(product)
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
      
      await renderAllProducts()
      return 
    }
  }

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
  
  modal.addEventListener('submit', async function(e) {
    e.preventDefault()

    const modalDateInput = document.getElementById('modal-date')
    const id = +modalDateInput.dataset.id
    const newDateExpiry = modalDateInput.value
    let newDateProduction = modal.dateProd.value
    
    console.log('Изменяем продукт с id:', id, 'Новая дата:', newDateExpiry)

    const productToUpdate = await getProductById(id)
    const oldDate = productToUpdate.productionDate

    if (productToUpdate) {

      if (oldDate === newDateProduction) {
        let haha = new Date(newDateExpiry)
        haha.setDate(haha.getDate() - productToUpdate.shelfLife)
        newDateProduction = haha.toISOString().split('T')[0]
      }
      
      productToUpdate.productionDate = newDateProduction
      productToUpdate.expiryDate = newDateExpiry
      productToUpdate.shelfLife = (new Date(newDateExpiry) - new Date(newDateProduction)) / 86400000
      
      console.log('Продукт обновлен:', productToUpdate)
      if (modal.querySelector('.image-preview img')) {
        if (modal.querySelector('.image-preview img').src !== productToUpdate.image) {
        productToUpdate.image = modal.querySelector('.image-preview img').src
        }
      }
      await updateProduct(productToUpdate)
      await renderAllProducts()

      closeModal()
    } else {
      console.error('Продукт не найден с id:', id)
    }

    document.querySelectorAll('section').forEach(element => {
      if (element.style.display !== 'none' && element.className !== 'calendar') {
        document.getElementById('search').value = ''
      }
    });
  })

  async function calendarR() {
    const arr = await getAllProducts()
    let products = []
    for (let prod of arr) {
      products.push(prod)
    }

    const calendar = new ExpiryCalendar(products)
    calendar.renderCalendar()
  }

  async function renderAllProducts() {
    console.log('Привет из рендер', await getAllProducts())
    const allSection = [
      sectionProductsAll,
      sectionProductsFresh,
      sectionProductsSoon,
      sectionProductsExpired,
      sectionArchive,
    ]

    const arr = await getAllProducts()
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
      li.innerHTML = createProductCard(product)
    ul.append(li)
    
    if (section.id === 'all-products' && new Date(product.expiryDate) < new Date) {
      li.classList.add('shadow')
    }
  }

  function renderProductsToArchive(section, product) {
    const ul = section.querySelector('ul')
    if (!ul) return

    if (ul.querySelector('p')?.textContent === 'Пока ничего нет...') {
      ul.innerHTML = ''
    }

    const li = document.createElement('li')
    li.classList.add('card', 'section__item')
    li.setAttribute('data-product-id', product.id)
    li.innerHTML = creaeteArchiveCard(product)
    ul.append(li)
  }

  async function removeOrCloseModal(e) {
    const cancel = e.target.closest('.cancel')
    if (cancel) {
      closeModalRemove()
      return
    }

    const ok = e.target.closest('.ok')
    const products = await getAllProducts()

    if (ok) {
      const id = +ok.dataset.rem
      const product = products.find(prod => prod.id === id)
      console.log(product)

      if (product) {
        removeProduct(product.id)
      }
      return
    }
    return
    
  }

  async function removeProduct(productId) {
    await deleteProduct(productId)

    closeModalRemove()

    renderAllProducts()
  }

  //archive
  

  modal.addEventListener('click', pushToArchive)
  modal.addEventListener('click', autoCalculate)
  
  async function pushToArchive(e) {
    const btnArchive = e.target.closest('.modal__push-archive')
    if (!btnArchive) return
    e.preventDefault()

    const modalDateInput = document.getElementById('modal-date')
    const id = +modalDateInput.dataset.id
    const products = await getAllProducts()
    const product = products.find(prod => prod.id === id)
    console.log(product)

    if (product) {
      product.inArchive = true

      console.log('Продукт обновлен:', product)

      await updateProduct(product)

      await renderAllProducts()

      closeModal()
    }
  }

  async function autoCalculate(e) {
    const btnAutoCalc = e.target.closest('.modal__button--calc')
    if (!btnAutoCalc) return
    e.preventDefault()

    const modalDateInput = document.getElementById('modal-date')
    const id = +modalDateInput.dataset.id
    const products = await getAllProducts()
    const product = products.find(prod => prod.id === id)
    const modalSelect = document.querySelector('.modal__select')

      if (modalSelect.value === 'day') {
        let date = new Date(modal.dateProd.value)
        date.setDate(date.getDate() + product.shelfLife)
        modalDateInput.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }
    if (modalSelect.value === 'month') {
      const startDate = new Date(modal.dateProd.value)

      const months = (new Date(product.expiryDate) - new Date(product.productionDate)) / 86400000 / 30
      startDate.setMonth(startDate.getMonth() + Math.round(months))
      modalDateInput.value = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
      }
  }

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
  
      const html = createModalCalculator()
      newFormCalculator.classList.add('open')
      document.body.classList.add('no-scroll');
      newFormCalculator.innerHTML = html
      const arrowBackToModal = createArrow()
      if (!arrowBackToModal) elementCheck(arrow, 'стрелка')
      newFormCalculator.append(arrowBackToModal)
      modal.classList.remove(open)

      arrowBackToModal.addEventListener('click', (e) => {
      e.preventDefault()
      newFormCalculator.classList.remove('open')
      modal.classList.add(open)
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
      } else {
        validateCalculator(modalCalcDateStart, modalDays, modalMonths)
      }
    }

  }

    if (this.classList.contains('form__add')) {
      if (!e.target.closest('.modal__calculator')) return
      e.preventDefault()
      const formCalculator = document.querySelector('.modal-form-calculator')
      modalCheck(formCalculator)
      const html = createModalCalculator()
      const arrow = createArrow()
      if (!arrow) elementCheck(arrow, 'стрелка')

      formCalculator.classList.add('open')
      document.body.classList.add('no-scroll');
      formCalculator.innerHTML = html

      formCalculator.append(arrow)
    arrow.addEventListener('click', (e) => {
      e.preventDefault()
      formCalculator.classList.remove('open')
      document.body.classList.remove('no-scroll');
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
  modalReturn.addEventListener('click', autoCalculateArchive)

  async function autoCalculateArchive(e) {
    const btnAutoCalc = e.target.closest('.modal-return__button--calc')
    if (!btnAutoCalc) return
    e.preventDefault()

    const modalDateInput = document.getElementById('modal-return-date')
    const id = +modalDateInput.dataset.modal
    const products = await getAllProducts()
    const product = products.find(prod => prod.id === id)
    if (!product) {
      console.warn('Продукт не найден')
      return
    }
    const dateProdInput = document.getElementById('modal-return-date-prod')
    elementCheck(dateProdInput, 'поле ввода')
    const modalReturnSelect = document.querySelector('.modal-return__select')
    elementCheck(modalReturnSelect, 'select')
    
    if (modalReturnSelect.value === 'day') {
      let date = new Date(dateProdInput.value)
      date.setDate(date.getDate() + product.shelfLife)
      modalDateInput.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    if (modalReturnSelect.value === 'month') {
      const startDate = new Date(dateProdInput.value)
      const months = (new Date(product.expiryDate) - new Date(product.productionDate)) / 86400000 / 30
      startDate.setMonth(startDate.getMonth() + Math.round(months))
      modalDateInput.value = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
    }
    
  }

  modalReturn.addEventListener('click', downloadImageArchive)

  async function downloadImageArchive(e) {
    if (e.target.closest('.image-preview')) {
      const modalDateInput = document.getElementById('modal-return-date')
      const id = +modalDateInput.dataset.modal
      const products = await getAllProducts()
      const product = products.find(p => p.id === id)
      console.log('archive down', id, product)
      if (!product) return
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
        
          if (!modalReturn.querySelector('.image-preview img')) {
            modalReturn.querySelector('.image-preview').innerHTML = `<img src="${compressedImage}" alt="${product.name}">`
          } else {
            modalReturn.querySelector('.image-preview img').src = e.target.result
          }
            
          } catch (error) {

            }
        }
          
        reader.onerror = (error) => {
          console.error('Ошибка при чтении файла:', error)
        }

        reader.readAsDataURL(file)

        setTimeout(() => input.remove(), 100)

        }

      input.click()
        
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error)
    }
      
    await renderAllProducts()
    return
   }
 }

  async function returnFromArchive(e) {
    e.preventDefault()

    const modalDateInput = document.getElementById('modal-return-date')
    const dateProdInput = document.getElementById('modal-return-date-prod')
    const id = +modalDateInput.dataset.modal
    const products = await getAllProducts()

    const product = products.find(prod => prod.id === id)
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

    await updateProduct(product)

    await renderAllProducts()

    closeModalReturn()
  }

 alert('привет')

  const formSearchBtn = document.querySelector('.form-search__btn')
  elementCheck(formSearchBtn, 'кнопка поиска')

  formSearchBtn.addEventListener('click', searchProducts)

  function searchProducts(e) {
    e.preventDefault()
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

    allSection.forEach(section => {
      if (section.style.display === 'block') {
        section.querySelectorAll('.card__title')?.forEach(element => {
          if (element.innerHTML.toLowerCase().includes(needProduct.toLowerCase())) {
            filterNeedProducts(section, needProduct)
          } else {
            section.querySelector('ul').innerHTML = 'Ничего не найдено...'
          }
        });
      }
    });
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
  
  async function filterNeedProducts(section, inputValue) {
    const products = await getAllProducts()
    const ul = section.querySelector('ul')
    ul.innerHTML = ''

    products.forEach(element => {
      if (element.name.toLowerCase().includes(inputValue.toLowerCase())) {
        if (element.inArchive) {
          renderProductsToArchive(section, element)
        } else {
          autoMakeCategory(section, element)
        }
      }
    });

    if (ul.innerHTML === '') ul.innerHTML = 'Ничего не найдено...'
  }

  searchForm.addEventListener('click', removeAllProducts)

  async function removeAllProducts(e) {
    e.preventDefault()
    if (!e.target.closest('.form__btn-remove')) return

    const products = await getAllProducts()

    const allSection = [
      sectionProductsAll,
      sectionProductsFresh,
      sectionProductsSoon,
      sectionProductsExpired,
      sectionArchive,
    ]

    allSection.forEach(element => {
      if (element.style.display !== 'none') {
        const html = createModalRemoveAll(element.querySelector('h2').innerHTML)
        modalRemove.innerHTML = html
        modalRemove.classList.add('open-remove')
        document.body.classList.add('no-scroll');

        modalRemove.addEventListener('click', (e) => {
          const cancel = e.target.closest('.cancel')
          if (cancel) {
          closeModalRemove()
          return
        }

          const ok = e.target.closest('.ok')
          if (!ok) return
          element.querySelectorAll('li').forEach(prodCard => {
            const id = +prodCard.dataset.productId
            const product = products.find(prod => prod.id === id)
            console.log(product)

            removeProducts(id)
            closeModalRemove()
        });
        renderAllProducts()
        })
      }
    });
  }

  async function removeProducts(id) {
  await deleteProduct(id)
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












