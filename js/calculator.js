import {
  elementCheck
} from './utils.js'

import {
  DateUtils
} from './state.js'

export const calcDateStart = document.getElementById('date-start')
elementCheck(calcDateStart, 'поле ввода')

DateUtils.setMaxDate(calcDateStart)

export const sectionHero = document.getElementById('hero')
elementCheck(sectionHero, 'секция hero')
export const calcForm = document.getElementById('calculator')
elementCheck(calcForm, 'форма калькулятора')
export const calcDays = document.getElementById('days')
elementCheck(calcDays, 'поле ввода')
export const calcMonths = document.getElementById('months')
elementCheck(calcMonths, 'поле ввода')
export const calcDateEnd = document.getElementById('end')
elementCheck(calcDateEnd, 'поле для даты окончания')
export const btnAddToForm = document.getElementById('calc-add')
elementCheck(btnAddToForm, 'кнопка добавления')


export function validateCalculator(dateStart, days, months) {
    let isValid = true;
    
    if (!dateStart.value) {
      showError(dateStart, 'Выберите дату изготовления')
      isValid = false
    } else {
      clearError(dateStart)
    }
    
    if (!days.value && !months.value) {
      showError(days, 'Заполните хотя бы одно поле: дни или месяцы')
      showError(months, '')
      isValid = false
    } else {
      clearError(days)
      clearError(months)
    }
    
    return isValid
  }
  
export function calculateExpirationDate(startDate, days, months) {
    let endDate = new Date(startDate)
    
    if (months) {
      endDate.setMonth(endDate.getMonth() + parseInt(months))
    }
    
    if (days) {
      endDate.setDate(endDate.getDate() + parseInt(days))
  }
    return endDate.toLocaleString("ru-RU", { year: 'numeric', month: 'long', day: 'numeric' })
}

export function dateToAddForm(startDate, days, months) {
  let endDate = new Date(startDate)
    
    if (months) {
      endDate.setMonth(endDate.getMonth() + parseInt(months))
    }
    
    if (days) {
      endDate.setDate(endDate.getDate() + parseInt(days))
  }
  return endDate
}
  
calcForm.addEventListener('submit', function (e) {
      e.preventDefault()
      
      if (validateCalculator(calcDateStart, calcDays, calcMonths)) {
        calcDateEnd.textContent = calculateExpirationDate(calcDateStart.value, calcDays.value, calcMonths.value)
        btnAddToForm.style.display = 'block'
  }
  })
  
export  function showError(input, message) {
    clearError(input)
    
    input.style.borderColor = '#e74c3c'
    input.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)'
    
    if (message) {
      const error = document.createElement('div')
      error.className = 'error-message'
      error.textContent = message
      
      input.insertAdjacentElement('afterend', error)
    }
  }
  
export function clearError(input) {
    input.style.borderColor = '#e0e0e0'
    input.style.boxShadow = ''
    
    const error = input.nextElementSibling
    if (error && error.classList.contains('error-message')) {
      error.remove()
    }
}

export function createModalCalculatorComponent() {
  return `
    
    <h2 class="modal__title">Калькулятор</h2>
    <label for="modal-date-start">Дата изготовления</label>
    <input class="input-field calculator__date-start" id="modal-date-start" type="date" max="${DateUtils.getTodayDateString()}" style="width: 100%;">
    <label for="modal-days">Срок годности, дней</label>
    <input class="input-field calculator__days" id="modal-days" type="number" min="1" style="width: 100%;">
    <label for="modal-months">Срок годности, месяцев</label> 
    <input class="input-field calculator__months" id="modal-months" type="number" min="1" max="12" style="width: 100%;">
    <label for="modal-date-end">Дата окончания СГ</label>
    <div class="input-field date-end" id="modal-date-end" aria-live="polite"></div>
    <button class="btn calculator__btn" id="modal-calc-btn" type="submit">OK</button>
    <button class="btn" id="modal-add" disabled>Добавить дату</button>
  `
}

export function createArrow() {
    const arrowBack = document.createElement('button')
    arrowBack.innerHTML = '<img src="img/arrow-left.svg" alt="">'
    arrowBack.classList.add('arrow', 'arrow-back')
    return arrowBack

}

class DateCalculator {
  constructor() {
    this.init()
  }

  init() {
    this.setupEventListeners()
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.modal__calculator')) {
        const modal = e.target.closest('.modal, .modal-return, .form__add')
        this.openCalculator(e, modal)
      }
    })

    document.getElementById('backdrop-calculator')?.addEventListener('click', this.closeCalculator)
  }

  openCalculator(e, modalElement) {
    e.preventDefault()

    const context = modalElement.classList.contains('modal-return') ? 'return' :
                    modalElement.classList.contains('modal') ? 'modal' : 'form' 
    
    this.setupCalculatorModal(modalElement, context)
  }

  setupCalculatorModal(sourceModal, context) {
    const calculatorModal = this.createCalculatorModal()
    this.populateCalculator(calculatorModal, sourceModal, context)
    this.addCalculatorListeners(calculatorModal, sourceModal, context)
  }

  createCalculatorModal() {
    const formCalculator = document.querySelector('.modal-form-calculator')
    // newFormCalculator.classList.add()
    // document.body.classList.add('no-scroll');
    newFormCalculator.innerHTML = html
    const newFormCalculator = formCalculator.cloneNode(true)
    formCalculator.parentNode.replaceChild(newFormCalculator, formCalculator)
  
    const html = createModalCalculatorComponent()
    return formCalculator
  }
}



