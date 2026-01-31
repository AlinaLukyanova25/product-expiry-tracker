export class KeyboardNavigation {
  constructor({
    modal,
    modalRemove,
    modalReturn
  }) {
    this.modal = modal;
    this.modalRemove = modalRemove;
    this.modalReturn = modalReturn;

    this.init();
  }

  init() {
    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  handleKeyDown(e) {
    if (e.target.closest('.section__btn-remove')) { 
      this.handleProductRemoveKey(e);
      return;
    }

    if (e.target.closest('.section--archive')) {
      this.handleArchiveKey(e);
      return;
    }

    if (e.target.closest('.section__item')) {
      this.handleProductCardKey(e);
      return;
    }

    if (e.target.closest('.image-preview')) {
      this.handleImagePreviewKey(e);
      return;
    }

    if (e.target.closest('.form__btn-remove')) {
      this.handleRemoveAllKey(e);
      return;
    }

    if (e.target.closest('.calendar__day')) {
      this.handleCalendarDayKey(e);
      return;
    }

    if (e.target.closest('.calendar-item')) {
      this.handleCalendatItemKey(e);
      return;
    }

    if (e.target.closest('.modal__calculator')) {
      this.handleCalculatorKey(e);
      return;
    }
  }

  handleProductRemoveKey(e) {
    const card = e.target.closest('.section__btn-remove');

    if (e.key === 'Enter' || e.keyCode === 13) {
      card.click();
      this.modalRemove?.focus();
    }
    if (e.key === 'Tab') {
      this.modalRemove?.focus();
    }
  }

  handleArchiveKey(e) {
    const card = e.target.closest('.section__item');
    if (e.key === 'Enter' || e.keyCode === 13) {
      card.click();
      this.modalReturn?.focus();
    }
    if (e.key === 'Tab') {
      this.modalReturn?.focus();
    }
  }

  handleProductCardKey(e) {
    const card = e.target.closest('.section__item');
    if (e.key === 'Enter' || e.keyCode === 13) {
      card.click();
      this.modal?.focus();
    }
    if (e.key === 'Tab') {
      this.modal?.focus();
    }
  }

  handleImagePreviewKey(e) {
    const card = e.target.closest('.image-preview');
    if (e.key === 'Enter' || e.keyCode === 13) {
      card.click();
    }
  }

  handleRemoveAllKey(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      this.modalRemove?.focus();
    }
    if (e.key === 'Tab') {
      this.modalRemove?.focus();
    }
  }

  handleCalendarDayKey(e) {
    const card = e.target.closest('.calendar__day');
    const modalCalendar = document.querySelector('.modal-calendar');
    if (e.key === 'Enter' || e.keyCode === 13) {
      card.click();
      modalCalendar?.focus();
    }
    if (e.key === 'Tab') {
      modalCalendar?.focus();
    }
  }

  handleCalendatItemKey(e) {
    const card = e.target.closest('.calendar-item');
    if (e.key === 'Enter' || e.keyCode === 13) {
      card.click();
      this.modal?.focus();
    }
    if (e.key === 'Tab') {
      this.modal?.focus();
    }
  }

  handleCalculatorKey(e) {
    if (e.key === 'Tab') {
      const modalFormCalculator = document.querySelector('.modal-form-calculator');
      modalFormCalculator?.focus();
    }
  }
}