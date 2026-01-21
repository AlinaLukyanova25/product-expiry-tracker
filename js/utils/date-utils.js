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