export const DateUtils = {
  getTodayDate() {
    return new Date();
  },

  getTodayDateString() {
    const today = this.getTodayDate();
    const year = today.getFullYear();
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
      console.warn('Элемент не найден');
      return;
    }

    element.setAttribute('min', this.getTomorrowDateString());
  },

  setMaxDate(element) {
    if (!element) {
      console.warn('Элемент не найден');
      return;
    }

    element.setAttribute('max', this.getTodayDateString());
  }
};

export function calculateDateDifference(date) {
  if (!date) return null;
  let now = new Date();
  let difference = new Date(date) - now;
  return Math.ceil(difference / 86400000);
}

export function formatDateCard(date) {
  if (!date) return null;
  date = new Date(date);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

export function validateCalculator(dateStart, days, months) {
  let isValid = true;
    
  if (!dateStart.value) {
    showError(dateStart, 'Выберите дату изготовления');
    isValid = false;
  } else {
    clearError(dateStart);
  }
    
  if (!days.value && !months.value) {
    showError(days, 'Заполните хотя бы одно поле: дни или месяцы');
    showError(months, '');
    isValid = false;
  } else {
    clearError(days);
    clearError(months);
  }
    
  return isValid;
}

export  function showError(input, message) {
  clearError(input);
    
  input.style.borderColor = '#e74c3c';
  input.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    
  if (message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
      
    input.insertAdjacentElement('afterend', error);
  }
}
  
export function clearError(input) {
  input.style.borderColor = '#e0e0e0';
  input.style.boxShadow = '';
    
  const error = input.nextElementSibling;
  if (error && error.classList.contains('error-message')) {
    error.remove();
  }
}

export function calculateExpirationDate(startDate, days, months) {
  let endDate = new Date(startDate);
    
  if (months) {
    endDate.setMonth(endDate.getMonth() + parseInt(months));
  }
    
  if (days) {
    endDate.setDate(endDate.getDate() + parseInt(days));
  }
  return endDate.toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function dateToAddForm(startDate, days, months) {
  let endDate = new Date(startDate);
    
  if (months) {
    endDate.setMonth(endDate.getMonth() + parseInt(months));
  }
    
  if (days) {
    endDate.setDate(endDate.getDate() + parseInt(days));
  }
  return endDate;
}