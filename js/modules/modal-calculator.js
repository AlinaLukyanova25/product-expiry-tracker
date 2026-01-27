import { DateUtils } from '../utils/date-utils.js'

import { createArrow } from '../utils/dom-utils.js'

import {
  validateCalculator,
  calculateExpirationDate,
  dateToAddForm
} from '../utils/date-utils.js'
  
export class DateCalculator {
  constructor() {
    this.calculatorModal = null;
    this.sourceModal = null;
    this.context = null;
    this.calculatorButton = null;
    this.init()
  }

  init() {
    this.setupEventListeners()
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.modal__calculator')) {
        const modal = e.target.closest('.modal, .modal-return, .form__add')
        if (modal) this.openCalculator(e, modal)
      }
    })

    document.getElementById('backdrop-calculator')?.addEventListener('click', () => this.closeCalculator())
  }

  openCalculator(e, modalElement) {
    e.preventDefault()
    this.calculatorButton = e.target.closest('.modal__calculator')
    this.sourceModal = modalElement

    this.context = modalElement.classList.contains('modal-return') ? 'return' :
                    modalElement.classList.contains('modal') ? 'modal' : 'form' 
    
    this.setupCalculatorModal()
  }

  setupCalculatorModal(sourceModal, context) {
    const calculatorModal = this.createCalculatorModal()
    this.populateCalculator(calculatorModal)
    this.addCalculatorListeners(calculatorModal)
  }

  createCalculatorModal() {
    const formCalculator = document.querySelector('.modal-form-calculator')
    if (!formCalculator) {
      console.error('Модальное окно калькулятора не найдено')
      return null
    }
    
    const newFormCalculator = formCalculator.cloneNode(true)
    formCalculator.parentNode.replaceChild(newFormCalculator, formCalculator)
  
    this.calculatorModal = newFormCalculator
    return newFormCalculator
  }

  populateCalculator(calculatorModal) {
    const html = this.createModalCalculatorComponent()
    calculatorModal.innerHTML = html;

    if (this.context === 'modal' || this.context === 'return') {
      const arrowBackToModal = createArrow()
      if (arrowBackToModal) {
        calculatorModal.prepend(arrowBackToModal)
        arrowBackToModal.addEventListener('click', (e) => this.handleArrowBack(e))
      }
    }

    calculatorModal.classList.add('open')
    document.body.classList.add('no-scroll')

    if (this.context === 'modal' || this.context === 'return') {
      const openType = this.context === 'modal' ? 'open' : 'open-return'
      this.sourceModal.classList.remove(openType)
    }

    this.initializeInputFields()

    if (this.context === 'form' && document.getElementById('date-manufacture')?.value) {
      this.modalCalcDateStart.value = document.getElementById('date-manufacture').value
    }
  }

  initializeInputFields() {
    this.modalCalcDateStart = document.getElementById('modal-date-start');
    this.modalDays = document.getElementById('modal-days')
    this.modalMonths = document.getElementById('modal-months')
    this.modalCalcDateEnd = document.getElementById('modal-date-end')
    this.addButton = document.getElementById('modal-add')

    if (!this.modalCalcDateStart || !this.modalDays || !this.modalMonths || !this.modalCalcDateEnd || !this.addButton) {
      console.error('Не все элементы калькулятора найдены')
    }
  }

  addCalculatorListeners(calculatorModal) {
    calculatorModal.addEventListener('submit', (e) => this.handleCalculatorSubmit(e))

    calculatorModal.addEventListener('click', (e) => {
      const addButton = e.target.closest('#modal-add')
      if (addButton) {
        this.handleAddDate(e)
      }
    })

    if (this.context === 'form') {
      const arrow = createArrow()
      if (arrow) {
        calculatorModal.prepend(arrow)
        arrow.addEventListener('click', (e) => {
          e.preventDefault()
          this.closeCalculator()
          this.calculatorButton?.focus()
        })
      }
    }
  }

  handleCalculatorSubmit(e) {
    e.preventDefault()

    if (this.validateCalculator()) {
      const endDate = calculateExpirationDate(
        this.modalCalcDateStart.value,
        this.modalDays.value,
        this.modalMonths.value
      )
      this.modalCalcDateEnd.textContent = endDate
      this.addButton.disabled = false
    } else {
      this.addButton.disabled = true
    }
  }

  validateCalculator() {
    return validateCalculator(this.modalCalcDateStart, this.modalDays, this.modalMonths)
  }

  handleAddDate(e) {
    e.preventDefault()

    if (!this.validateCalculator()) return

    const endDate = dateToAddForm(
      this.modalCalcDateStart.value,
      this.modalDays.value,
      this.modalMonths.value
    )

    this.fillSourceFields(endDate)

    this.closeCalculator()

    this.calculatorButton?.focus()
  }

  fillSourceFields(endDate) {
    const formattedDate = this.formatDateForInput(endDate)

    switch (this.context) {
      case 'modal':
        this.sourceModal.dateProd.value = this.modalCalcDateStart.value
        this.sourceModal.date.value = formattedDate
        this.sourceModal.classList.add('open')
        break;
      
      case 'return':
        this.sourceModal.dateProd.value = this.modalCalcDateStart.value
        this.sourceModal.date.value = formattedDate
        this.sourceModal.classList.add('open-return')
        break
      
      case 'form':
        if (document.getElementById('date-manufacture')) {
          document.getElementById('date-manufacture').value = this.modalCalcDateStart.value
        }
        if (document.getElementById('end-date')) {
          document.getElementById('end-date').value = formattedDate
        }
        break
    }
  }

  formatDateForInput(date) {
    if (!(date instanceof Date)) {
      console.error('Неверный формат даты')
      return ''
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  handleArrowBack(e) {
    e.preventDefault()

    if (this.context === 'modal') {
      this.sourceModal.classList.add('open')
    } else if (this.context === 'return') {
      this.sourceModal.classList.add('open-return')
    }

    this.closeCalculator()

    this.calculatorButton?.focus()
  }

  closeCalculator() {
    if (this.calculatorModal) {
      this.calculatorModal.classList.remove('open')
    }
    document.body.classList.remove('no-scroll')

    this.calculatorModal = null
    this.sourceModal = null
    this.context = null
    this.calculatorButton = null
  }

  createModalCalculatorComponent() {
  return `
    
    <h2 class="modal__title">Калькулятор</h2>
    <label for="modal-date-start">Дата изготовления</label>
    <input class="input-field calculator__date-start" id="modal-date-start" type="date" max="${DateUtils.getTodayDateString()}" style="width: 100%;">
    <label for="modal-days">Срок годности, дней</label>
    <input class="input-field calculator__days" id="modal-days" type="number" min="1" style="width: 100%;">
    <label for="modal-months">Срок годности, месяцев</label> 
    <input class="input-field calculator__months" id="modal-months" type="number" min="1" style="width: 100%;">
    <label for="modal-date-end">Дата окончания СГ</label>
    <div class="input-field date-end" id="modal-date-end" aria-live="polite"></div>
    <button class="btn calculator__btn" id="modal-calc-btn" type="submit">OK</button>
    <button class="btn" id="modal-add" disabled>Добавить дату</button>
  `
  }
}