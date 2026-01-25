export function createArrow() {
    const arrowBack = document.createElement('button')
    arrowBack.innerHTML = '<img src="img/arrow-left.svg" alt="">'
    arrowBack.classList.add('arrow', 'arrow-back')
    return arrowBack

}

export function elementCheck(element, stroke) {
    if (!element) {
        throw new Error(`Элемент "${stroke}" не найден`)
    }
    return element
}