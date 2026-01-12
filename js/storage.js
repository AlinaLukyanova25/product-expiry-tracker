class ProductsDB {
    static #instance = null;
    static DB_NAME = 'ProductsDB';
    static DB_VERSION = 1;
    static STORE_NAME = 'products'
    
    #db = null;
    #isInitialized = false;
    #initPromise = null;

    constructor() {
        if (ProductsDB.#instance) {
            return ProductsDB.#instance
        }
        ProductsDB.#instance = this;
    }

    static getInstance() {
        if (!ProductsDB.#instance) {
            ProductsDB.#instance = new ProductsDB()
        }
        return ProductsDB.#instance
    }

    async initialize() {
        if (this.#isInitialized) {
            return this.#db
        }
        if (this.#initPromise) {
            return this.#initPromise
        }

        this.#initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(
                ProductsDB.DB_NAME,
                ProductsDB.DB_VERSION
            )

            request.onupgradeneeded = (event) => {
                this.#db = event.target.result

                if (!this.#db.objectStoreNames.contains(ProductsDB.STORE_NAME)) {
                    const store = this.#db.createObjectStore(ProductsDB.STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    })

                    store.createIndex('name_idx', 'name', { unique: false })
                store.createIndex('date_idx', 'expiryDate', { unique: false })
                
                console.log('Хранилище создано')
                }
            }

            request.onsuccess = (event) => {
                this.#db = event.target.result;
                this.#isInitialized = true;
                console.log('База данных открыта')
                resolve(this.#db)
            }

            request.onerror = (event) => {
                console.log('Ошибка открытия базы')
                reject(event.target.error)
            }
        })

        return this.#initPromise
    }

    async addProduct(product) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(ProductsDB.STORE_NAME, 'readwrite')
            const store = transaction.objectStore(ProductsDB.STORE_NAME)

            const request = store.add(product)

            request.onsuccess = () => {
                console.log('Продукт добавлен, id:', request.result)
                resolve(request.result)
            }

            request.onerror = (event) => {
                console.error('Ошибка добавления:', event.target.error)
                reject(event.target.error)
            }
        })
    }

    async getAllProducts() {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(ProductsDB.STORE_NAME, 'readonly')
            const store = transaction.objectStore(ProductsDB.STORE_NAME)

            const request = store.getAll()

            request.onsuccess = () => {
                resolve(request.result)
            }

            request.onerror = (event) => {
                console.error('Ошибка получения:', event.target.error)
                reject(event.target.error)
            }
        })
    }

    async updateProduct(product) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(ProductsDB.STORE_NAME, 'readwrite')
            const store = transaction.objectStore(ProductsDB.STORE_NAME)

            const request = store.put(product)

            request.onsuccess = () => {
                console.log('Продукт обновлен')
                resolve()
            }

            request.onerror = (event) => {
                console.error('Ошибка обновления:', event.target.error)
                reject(event.target.error)
            }
        })
    }

    async deleteProduct(id) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(ProductsDB.STORE_NAME, 'readwrite')
            const store = transaction.objectStore(ProductsDB.STORE_NAME)

            const request = store.delete(id)

            request.onsuccess = () => {
                console.log('Продукт удален')
                resolve()
            }

            request.onerror = (event) => {
                console.error('Ошибка удаления:', event.target.error)
                reject(event.target.error)
            }
        })
    }

    async getProductById(id) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(ProductsDB.STORE_NAME, 'readonly')
            const store = transaction.objectStore(ProductsDB.STORE_NAME)

            const request = store.get(id)

            request.onsuccess = () => {
                resolve(request.result)
            }

            request.onerror = (event) => {
                console.error('Ошибка получения продукта:', event.target.error)
                reject(event.target.error)
            }
        })
    }

    async ensureInitialized() {
        if (!this.#isInitialized) {
            await this.initialize()
        }
    }

    getDB() {
        return this.#db
    }

    isInitialized() {
        return this.#isInitialized
    }
}

export const productsDB = ProductsDB.getInstance()
