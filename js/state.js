export const DateUtils = {
    getTodayDate() {
        return new Date();
    },

    getTodayDateString() {
        const today = this.getTodayDate();
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    getTomorrowDate() {
        const today = this.getTodayDate();
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);
        return nextDay;
    },

    getTomorrowDateString() {
        const nextDay = this.getTomorrowDate();
        const year = nextDay.getFullYear();
        const month = String(nextDay.getMonth() + 1).padStart(2, '0');
        const day = String(nextDay.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    setMinDate(element) {
        if (!element) {
            console.warn('Элемент не найден')
            return
        }

       element.setAttribute('min', this.getTomorrowDateString())
    },

    setMaxDate(element) {
        if (!element) {
            console.warn('Элемент не найден')
            return
        }

       element.setAttribute('max', this.getTodayDateString())
    }
}
