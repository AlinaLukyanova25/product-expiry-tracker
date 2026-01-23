export class FormSearch {
    constructor({
        searchInput,
        formSearchBtn,
        formSearchClear,
        sections,
        productsDB,
        filterSelect,
        renderAllProducts,
        renderProductsToArchive,
        renderProductsToSection,
        calculateDateDifference
    }) {
        this.searchInput = searchInput;
        this.formSearchBtn = formSearchBtn;
        this.formSearchClear = formSearchClear;
        this.sections = sections;
        this.productsDB = productsDB;
        this.filterSelect = filterSelect;
        this.renderAllProducts = renderAllProducts;
        this.renderProductsToArchive = renderProductsToArchive;
        this.renderProductsToSection = renderProductsToSection;
        this.calculateDateDifference = calculateDateDifference;

        this.isSearching = false;

        this.init()
    }

    init() {
        this.setupEventListeners()
    }

    setupEventListeners() {
        this.formSearchBtn.addEventListener('click', (e) => this.searchProducts(e))

        this.searchInput.addEventListener('touchstart', (e) => {
        e.preventDefault()
        this.focus()
        }, { passive: false })

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault()
            this.formSearchBtn.click()
            }
        })

        this.searchInput.addEventListener('input', () => this.handleInput())
        this.searchInput.addEventListener('focus', () => this.handleFocus())
        this.searchInput.addEventListener('blur', () => this.handleBlur())
        this.formSearchClear.addEventListener('click', (e) => this.handleClear(e))
    }

    async searchProducts(e) {
        e.preventDefault()

        if (this.isSearching) return
        this.isSearching = true

        try {
            const searchTerm = this.searchInput.value.trim()
            if (!searchTerm) return

            this.searchInput.removeEventListener('blur', this.handleBlur)
            this.searchInput.blur()
            this.formSearchClear.style.display = 'none'
            this.searchInput.removeEventListener('input', this.handleInput)

            const allProducts = await this.productsDB.getAllProducts()
            const productsArray = Array.from(allProducts)

            const activeSection = this.getActiveSection()
            if (!activeSection) return

            let filteredProducts = []

            if (activeSection.classList.contains('section--archive')) {
                filteredProducts = productsArray.filter(prod => prod.inArchive)
            } else if (activeSection.classList.contains('section--expired')) {
                filteredProducts = productsArray.filter(prod => calculateDateDifference(prod.expiryDate) <= 0 && !prod.inArchive)
            } else if (activeSection.classList.contains('section--soon')) {
                filteredProducts = productsArray.filter(prod => calculateDateDifference(prod.expiryDate) <= 3 &&
                    calculateDateDifference(prod.expiryDate) > 0 &&
                    !prod.inArchive)
            } else if (activeSection.classList.contains('section--fresh')) {
                filteredProducts = productsArray.filter(prod => calculateDateDifference(prod.expiryDate) > 3 && !prod.inArchive)
            } else if (activeSection.classList.contains('section--all')) {
                filteredProducts = productsArray.filter(prod => !prod.inArchive)
            }

            await this.performSearch(filteredProducts, activeSection, searchTerm)

        } finally {
            setTimeout(() => {
                this.isSearching = false
                this.searchInput.addEventListener('input', () => this.handleInput())
                this.searchInput.addEventListener('blur', () => this.handleBlur())
            }, 300)
        }
    }

    getActiveSection() {
        const sectionKeys = Object.keys(this.sections)

        for (const key of sectionKeys) {
            if (this.sections[key] && this.sections[key].style.display === 'block') {
                return this.sections[key]
            }
        }

        return null
    }

    async performSearch(products, section, searchTerm) {
        
    }
}