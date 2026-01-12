export const DateUtils = {
    getTomorrowDate() {
        const today = new Date();
        const nextDay = new Date(today)
        nextDay.setDate(today.getDate() + 1)
        return nextDay
    },

    getTomorrowDateString() {
        const nextDay = this.getTomorrowDate()
        const year = nextDay.getFullYear();
        const month = String(nextDay.getMonth() + 1).padStart(2, '0');
        const day = String(nextDay.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`
    },

    initDateInputMin(dateInputElement) {
        if (dateInputElement) {
            dateInputElement.setAttribute('min', this.getTomorrowDateString())
        } else {
            console.warn('Элемент end-date не найден')
        }
    }
}
