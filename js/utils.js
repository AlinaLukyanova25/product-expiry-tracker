export function modalCheck(modal) {
    if (!modal) {
        throw new Error('Модальное окно не найдено')
    }
    return modal
}

export function backdropCheck(backdrop) {
    if (!backdrop) {
        throw new Error('Backdrop не найден')
    }
    return backdrop
}

export function elementCheck(element, stroke) {
    if (!element) {
        throw new Error(`Элемент "${stroke}" не найден`)
    }
    return element
}