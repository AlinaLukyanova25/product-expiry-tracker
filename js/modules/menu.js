export function initMenu() {
    const menu = document.querySelector('.nav')
    if (!menu) return

    const searchForm = document.getElementById('form-search');
    const searchInput = document.getElementById('search');
    const formSearchClear = document.querySelector('.form-search__remove')

  menu.addEventListener('click', function(e) {
    if (!e.target.closest('li')) return
    e.preventDefault()
    
    if (searchForm) searchForm.style.display = 'none'
    if (searchInput) searchInput.value = ''
    if (formSearchClear) formSearchClear.style.display = 'none'

    const menuItems = menu.querySelectorAll('li')
    menuItems.forEach(element => element.classList.remove('active'));

    const clickedItem = e.target.closest('li')
    clickedItem.classList.add('active')

    const link = clickedItem.querySelector('a')
    if (!link) return

    const sectionId = link.hash.substring(1)
      
    const allSection = document.querySelectorAll('section')
    allSection.forEach(section => {
        section.style.display = 'none'
        if (section.id === sectionId) {
            section.style.display = section.classList.contains('form') && window.innerWidth < 814
                ? 'flex'
                : 'block'
            
            const searchSections = ['all-products', 'fresh-products', 'soon-products', 'expired-products', 'archive'];

            if (searchSections.includes(sectionId) && searchForm) {
                searchForm.style.display = 'flex'
            }
        }
    });
  })
    
    console.log('Меню инициализировано')
}