import {calculateDateDifference, formatDateCard} from './utils/date-utils.js'

export const productCategoryTranslation = {
  'milk': 'Молочка',
  'cheese': 'Сыры',
  'sausage': 'Колбаса',
  'meat': 'Курица/Мясо',
  'fish': 'Рыба',
  'frozen-food': 'Заморозка',
  'fresh': 'Фреш',
  'preserves': 'Консервы',
  'eggs': 'Яйца',
  'bread': 'Хлеб',
  'cakes': 'Торты/пирожные',
  'sweets': 'Кондитерка',
  'groceries': 'Бакалея',
  'snacks': 'Снеки',
  'baby-food': 'Детское',
  'cooking': 'Кулинария',
  'tea-coffee': 'Чай/кофе',
  'non-alc': 'Безалк.нап',
  'alc': 'Алкоголь',
  'сosmetics': 'Косметика'
}

function getDaysText(daysLeft) {
  daysLeft = parseInt(daysLeft)

  if (daysLeft < 0) return 'Просрочено'
  if (daysLeft === 0) return 'Истекает сегодня!'

    const word = numeralize.pluralize(daysLeft,  'день', 'дня', 'дней')
    return `До конца: ${daysLeft} ${word}`
}
  
export function createProductCardComponent(card) {
    const categoryDisplay = productCategoryTranslation[card.category] || card.category
    const daysLeft = calculateDateDifference(card.expiryDate)

    let daysText = typeof daysLeft === 'number' ? getDaysText(daysLeft) : 'Установите дату'

    const percent = setWidthProgrssBar(card)

  const expiryDate = formatDateCard(card.expiryDate) || 'Не выбрано'
    
    return `
      <button class="btn-remove section__btn-remove">&#128465;&#65039;</button>
      <div class="image-preview" id="preview-${card.id}">
        ${card.image
                ? `<img src="${card.image}" alt="${card.name}">`
                : ''
            }
        </div>
        <div class="section__item-content" style="width: 100%;">
        
        <div class="section__item-header">
        <h3 class="card__title">${card.name}</h3>
          <p>${daysText}</p>
          <div class="progress section__item-progress">
            <div class="progress__bar section__item-progress-bar" style="width: ${percent}"></div>
          </div>
        </div>
        <div class="section__item-footer">
          <div>До ${expiryDate}</div>
          <div>${categoryDisplay}</div>
        </div>
        <div>
    `
}

export function creaeteArchiveCardComponent(product) {
    const categoryDisplay = productCategoryTranslation[product.category] || product.category

    return `
       <button class="btn-remove section__btn-remove">&#128465;&#65039;</button>
        <div class="section__item-header" style="margin: 0;">
        <h3 class="card__title">${product.name}</h3>
          <p>Продукт в архиве</p>
        </div>
        <div class="section__item-footer"  style="justify-content: right;">
          <div class="section__category--today" style="margin: 0;">${categoryDisplay}</div>
        </div>
    `
}

export async function renderInitialProducts(productsDB, filterSelect, sections) {
    const products = await productsDB.getAllProducts()
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
        renderProductsToArchive(sections.archive, prod)
      } else {
      renderProductsToSection(sections.all, prod)
      const daysLeft = calculateDateDifference(prod.expiryDate)
      if (daysLeft <= 3 && daysLeft > 0) {
      renderProductsToSection(sections.soon, prod)
        } else if (daysLeft <= 0) {
      renderProductsToSection(sections.expired, prod)
        } else {
      renderProductsToSection(sections.fresh, prod)
        }
      }
    }
}
  
function renderProductsToSection(section, prod) {
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
  
function renderProductsToArchive(section, product) {
    const ul = section.querySelector('ul')
    if (!ul) return

    if (ul.querySelector('p')?.textContent === 'Пока ничего нет...') {
      ul.innerHTML = ''
    }

    const li = document.createElement('li')
    li.classList.add('card', 'section__item')
    li.setAttribute('data-product-id', product.id)
    li.setAttribute('tabindex', '0')
    li.innerHTML = creaeteArchiveCardComponent(product)
    ul.append(li)
  }

function setWidthProgrssBar(product) {
    const allTime = new Date(product.expiryDate) - new Date(product.productionDate)
    if (!allTime) return 0 + '%'
    console.log(product, allTime / 86400000)
    const remainingTime = new Date(product.expiryDate) - new Date()
    console.log(remainingTime / 86400000)
    const subtractionPercent = ((allTime - remainingTime) * 100) / allTime
    console.log(Math.round(subtractionPercent))

    if (Math.round(subtractionPercent) > 100 || !subtractionPercent) {
        return 100 + '%'
    }

    return Math.round(subtractionPercent) + '%'

}











