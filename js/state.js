export const dateInput = document.getElementById('end-date');
const today = new Date();
export const nextDay = new Date(today.setDate(today.getDate() + 1))
  
export const year = nextDay.getFullYear();
export const month = String(nextDay.getMonth() + 1).padStart(2, '0');
export const day = String(nextDay.getDate()).padStart(2, '0');
export const nextDayString = `${year}-${month}-${day}`
  
dateInput.setAttribute('min', nextDayString)