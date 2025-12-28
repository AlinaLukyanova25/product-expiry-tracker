import {
    getAllProducts
} from './storage.js'

import {
 productCategoryTranslation,
 formatDateCard
} from './products.js'

import {
    toModal
} from './modal.js'

import {
    elementCheck
} from './utils.js'

export class ExpiryCalendar {
    constructor(products) {
        this.currentDate = new Date()
        this.products = products
        this.currentSelectedDate = null
        this.currentModalProducts = null
        this.init()
    }

    init() {
        this.renderCalendar()
        this.setupEventListeners()
    }

    updateMonthHeader() {
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const currentMonthEl = document.getElementById('current-month')
        elementCheck(currentMonthEl, 'заголовок календаря')
        const monthName = monthNames[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();

        currentMonthEl.textContent = `${monthName} ${year}`
    }

    renderCalendar() {
        const calendarEl = document.getElementById('calendar')
        elementCheck(calendarEl, 'календарь')
        calendarEl.innerHTML = ''

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1)
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0)
        const dayInMonth = lastDay.getDate()

        const startingDay = firstDay.getDay()
        const startOffset = startingDay === 0 ? 6 : startingDay - 1

        for (let i = 0; i < startOffset; i++) {
            const lastMonthFirstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), (0 - (startOffset -1)) + i)
            const day = lastMonthFirstDay.getDate()
            const dayEl = this.createDayElement(lastMonthFirstDay, day, true)
            calendarEl.append(dayEl)
        }

        for (let day = 1; day <= dayInMonth; day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day)
            const dayEl = this.createDayElement(date, day)
            calendarEl.append(dayEl)
        }

        const endingDay = lastDay.getDay()
        const endOffset = endingDay === 0 ? 6 : endingDay - 1

        const haha = 6 - endOffset
        if (haha > 0) {
            for (let i = 0; i < haha; i++) {
                const nextMonthFirstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, i + 1)
                const day = nextMonthFirstDay.getDate()
                const dayEl = this.createDayElement(nextMonthFirstDay, day, true)
                calendarEl.append(dayEl)
            }
        }

        this.updateMonthHeader()
    }

    createDayElement(date, dayNumber, nextMonth = false) {
        const dayEl = document.createElement('div')
        dayEl.classList.add('calendar__day')

        if (date) {
            dayEl.textContent = dayNumber

            dayEl.dataset.date = date.toISOString().split('T')[0]

            const today = new Date()
            if (date.getDate() === today.getDate()
                && date.getMonth() === today.getMonth()
                && date.getFullYear() === today.getFullYear()
            ) {
                dayEl.classList.add('today')
            }

            const expiryCount = this.countProductsBeforeDate(date)

            if (expiryCount > 0) {
                const badge = document.createElement('span')
                badge.classList.add('expiry-badge')
                badge.textContent = expiryCount
                this.definesColors(date, badge)
                dayEl.append(badge)
            }

            dayEl.addEventListener('click', () => {
                this.handleDayClick(date)
            })
        }

        if (nextMonth) {
            dayEl.classList.add('empty')
            dayEl.style.color = 'gray'
        }

        return dayEl
    }

    countProductsBeforeDate(date) {
        if (!this.products) throw new Error('Массив продуктов не найден')
        return this.products.filter(product => {
            if (!product.expiryDate) return false
            const expiryDate = new Date(product.expiryDate)

            if (isNaN(expiryDate.getTime())) return
            if (expiryDate.getFullYear() === date.getFullYear()
                && expiryDate.getMonth() === date.getMonth()
                && expiryDate.getDate() === date.getDate()
                && !product.inArchive
            ) {
                return true
            }
            return false
        }).length
    }

    definesColors(date, elem) {
        const today = new Date()
        if (date < today || date.getDate() === today.getDate()
            && date.getMonth() === today.getMonth()
            && date.getFullYear() === today.getFullYear()) {
                elem.style.backgroundColor = '#ff4757'
        } else if (Math.ceil((date - today) / 86400000) <= 3) {
            elem.style.backgroundColor = '#f39c12'
        } else {
            elem.style.backgroundColor = '#27ae60'
        }
    }

    handleDayClick(date) {
        const productsOnDate = this.getProductsByDate(date)
        this.showProductsModal(productsOnDate, date)
    }

    getProductsByDate(date) {
        return this.products.filter(product => {
            if (!product.expiryDate) return false
            const expiryDate = new Date(product.expiryDate)

            if (isNaN(expiryDate.getTime())) return
            if (expiryDate.getFullYear() === date.getFullYear()
                && expiryDate.getMonth() === date.getMonth()
                && expiryDate.getDate() === date.getDate()
                && !product.inArchive
            ) {
                return true
            }
            return false
        })
    }

    showProductsModal(products, date) {
        this.currentSelectedDate = date
        this.currentModalProducts = products

        const modalCalendar = document.querySelector('.modal-calendar')
        
        modalCalendar.classList.add('open-calendar')
        modalCalendar.innerHTML = `
        <div class="modal-calendar__content">
        <h3 class="modal__title">Товары до ${date.toLocaleDateString()}</h3>
        ${products.length > 0
                ? `<ul id="calendar-list">${products.map(p => `${this.createProductCard(p, date)}`).join('')}</ul>`
                : '<p>Нет товаров с истекающим сроком</p>'
            }
        <button class="btn modal-calendar__close" style="width: 100%;">Закрыть</button>
        </div>
        `;
        
        modalCalendar.querySelector('.modal-calendar__close').addEventListener('click', () => {
            modalCalendar.classList.remove('open-calendar')
        })

        const calendarList = document.getElementById('calendar-list')

        calendarList.addEventListener('click', async (e) => await this.openModalProduct(e, date))
    }

    async openModalProduct(e, date) {
        const modal = document.getElementById('modal')
        const sections = document.querySelectorAll('section')
        const target = e.target.closest('li')
        if (!target) return
            
        const id = +target.dataset.id
        const product = this.currentModalProducts.find(prod => prod.id === id)
        
        if (!product) return
        const html = toModal(product, id)
        modal.innerHTML = html
        modal.firstElementChild.style.paddingLeft = 28 + 'px'
        modal.firstElementChild.style.marginBottom = 12 + 'px'
        
        const arrow = this.createArrow()
        modal.append(arrow)
        modal.classList.add('open')
        
        document.querySelector('.modal-calendar').classList.remove('open-calendar')

        if (this.handleModalSubmit) {
            modal.removeEventListener('submit', this.handleModalSubmit)
        }

        this.handleModalSubmit = async(submitEvent) => {
            submitEvent.preventDefault()
            console.log('SUBMIT ВЫЗВАН')

            setTimeout(async () => {
                try {
                    const updateProducts = await getAllProducts()
                this.products = updateProducts

                    this.renderCalendar()
                    
                    if (this.currentSelectedDate) {
                        const currentProducts = this.getProductsByDate(this.currentSelectedDate)
                this.currentModalProducts = currentProducts

                const modalCalendar = document.querySelector('.modal-calendar')
                const calendarList = modalCalendar.querySelector('#calendar-list')
                

                if (calendarList) {
                    if (currentProducts.length > 0) {
                        calendarList.innerHTML = currentProducts.map(p => this.createProductCard(p, this.currentSelectedDate)).join('')
                    } else {
                        calendarList.innerHTML = '<p>Нет товаров с истекающим сроком годности </p>'
                    }
                        }
                        
                        if (modalCalendar) modalCalendar.classList.add('open-calendar')
                    }
                    
                    modal.classList.remove('open')
                } catch (error) {
                    console.error('Ошибка в handleModalSubmit:', error)
                }
                

                modal.removeEventListener('submit', this.handleModalSubmit)
                this.handleModalSubmit = null
            }, 100)
        }

        modal.addEventListener('submit', this.handleModalSubmit)

            arrow.addEventListener('click', (e) => {
                e.preventDefault()
                sections.forEach(element => {
                    if (element.style.display !== 'none' && element.className === 'calendar') {
                        
                        document.querySelector('.modal-calendar').classList.add('open-calendar')
                        modal.classList.remove('open')
                    }
                });
            })
        }

    createArrow() {
        const arrowBack = document.createElement('button')
        arrowBack.textContent = '⭠'
        arrowBack.classList.add('arrow', 'arrow-back')
        return arrowBack
    }

    createProductCard(product, date) {
        const categoryDisplay = productCategoryTranslation[product.category] || product.category

        return `
        <li class="card calendar-item" data-id="${product.id}">
        <div class="image-preview" id="preview-${product.id}">
        ${product.image
                ? `<img src="${product.image}" alt="${product.name}">`
                : ''
            }
        </div>
        <div class="modal-calendar__list-content">

        <div class="calendar-item__top">
        <h3 class="card__title">${product.name}</h3>
        </div>
        <div class="calendar-item__bottom">
        <div>До ${formatDateCard(date)}</div>
        <div>${categoryDisplay}</div>
        </div>

        </div>
        </li>
        `
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction)
        this.renderCalendar()
    }

    setupEventListeners() {
        document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1))
        document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1))
    }
}

document.getElementById('backdrop-calendar').addEventListener('click', () => {
     document.querySelector('.modal-calendar').classList.remove('open-calendar')
})
 
