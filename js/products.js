export const productCategoryTranslation = {
  'milk': 'Молочка',
  'cheese': 'Сыры',
  'sausage': 'Колбаса',
  'meat': 'Курица/Мясо',
  'fish': 'Рыба',
  'frozen-food': 'Заморозка',
  'fresh': 'Фреш',
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
  if (daysLeft === 0) return 'Истекает сегодня!'
  daysLeft = parseInt(daysLeft)
    if (daysLeft === 1) return 'Остался 1 день'
  if (daysLeft > 0) {

    const lastTwoDigits = Math.abs(daysLeft) % 100
    const lastDigit = Math.abs(daysLeft) % 10

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `Осталось ${daysLeft} дней`
    }

    if (lastDigit === 1) {
      return `Остался ${daysLeft} день`
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return `Осталось ${daysLeft} дня`
    }

      return `Осталось ${daysLeft} дней`
    }
    return 'Просрочено'
}  


  
export function createProductCard(card) {
    const categoryDisplay = productCategoryTranslation[card.category] || card.category
    const daysLeft = calculateDateDifference(card.expiryDate)

    let daysText
    if (daysLeft) {
    daysText = getDaysText(daysLeft)
    } else {
    daysText = 'Установите дату'
    }

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
        <div class="setcion__item-content" style="width: 100%;">
        
        <div class="section__item-top">
        <h3 class="card__title">${card.name}</h3>
          <p>${daysText}</p>
          <div class="progress section__item-progress">
            <div class="progress__bar section__item-progress-bar" style="width: ${percent}"></div>
          </div>
        </div>
        <div class="section__item-bottom">
          <div>До ${expiryDate}</div>
          <div>${categoryDisplay}</div>
        </div>
        <div>
    `
}

export function calculateDateDifference(date) {
  if (!date) return null
    let now = new Date()
    let difference = new Date(date) - now
    return Math.ceil(difference / 86400000)
}

export function formatDateCard(date) {
  if (!date) return null
    date = new Date(date)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}.${month}.${date.getFullYear()}`
}

export function creaeteArchiveCard(product) {
    const categoryDisplay = productCategoryTranslation[product.category] || product.category

    return `
       <button class="btn-remove section__btn-remove">&#128465;&#65039;</button>
        <div class="section__item-top">
        <h3 class="card__title">${product.name}</h3>
          <p>Продукт в архиве</p>
        </div>
        <div class="section__item-bottom"  style="justify-content: right;">
          <div class="section__category--today" style="margin: 0;">${categoryDisplay}</div>
        </div>
    `
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

