let db = null;
const DB_NAME = 'ProductsDB'
const DB_VERSION = 1
const STORE_NAME = 'products'

export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = function (event) {
            db = event.target.result

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                })

                store.createIndex('name_idx', 'name', { unique: false })
                store.createIndex('date_idx', 'expiryDate', { unique: false })
                
                console.log('Хранилище создано')
            }
        }

        request.onsuccess = function (event) {
            db = event.target.result
            console.log('База данных открыта')
            resolve(db)
        }

        request.onerror = function (event) {
            console.log('Ошибка открытия базы')
            reject(event.target.error)
        }
    })
}

export function addProduct(product) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('База данных не открыта')
            return
        }

        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        const request = store.add(product)

        request.onsuccess = function () {
            console.log('Продукт добавлен, id:', request.result)
            resolve(request.result)
        }

        request.onerror = function (event) {
            console.error('Ошибка добавления:', event.target.error)
            reject(event.target.error)
        }
    })
}

export function getAllProducts() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('База данных не открыта')
            return
        }

        const transaction = db.transaction(STORE_NAME, 'readonly')
        const store = transaction.objectStore(STORE_NAME)

        const request = store.getAll()

        request.onsuccess = function () {
            resolve(request.result)
        }

        request.onerror = function (event) {
            console.error('Ошибка получения:', event.target.error)
            reject(event.target.error)
        }
    })
}

export function updateProduct(product) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('База данных не открыта')
            return
        }

        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        const request = store.put(product)

        request.onsuccess = function () {
            console.log('Продукт обновлен')
            resolve()
        }

        request.onerror = function (event) {
            console.error('Ошибка обновления:', event.target.error)
            reject(event.target.error)
        }
    })
}

export function deleteProduct(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('База данных не открыта')
            return
        }

        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        const request = store.delete(id)

        request.onsuccess = function () {
            console.log('Продукт удален')
            resolve()
        }

        request.onerror = function (event) {
            console.error('Ошибка удаления:', event.target.error)
            reject(event.target.error)
        }
    })
}

export async function getProductById(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('База данных не открыта')
            return
        }

        const transaction = db.transaction(STORE_NAME, 'readonly')
        const store = transaction.objectStore(STORE_NAME)

        const request = store.get(id)

        request.onsuccess = function () {
            resolve(request.result)
        }

        request.onerror = function (event) {
            console.error('Ошибка получения продукта:', event.target.error)
            reject(event.target.error)
        }
    })
}
