import { DateUtils } from './../utils/date-utils.js'

import {createImageUploadHandler} from './../utils/image-uploader.js'

export function initForms(productsDB, renderAllProducts, calendar) {
    const addFormProducts = document.getElementById('add-form');
    const nameProduct = document.getElementById('name-product');
    const categoryProduct = document.getElementById('category');
    const dateManufactureProduct = document.getElementById('date-manufacture')
    const dateInput = document.getElementById('end-date');
    
    DateUtils.setMinDate(dateInput)
    DateUtils.setMaxDate(dateManufactureProduct)
    
    if (!addFormProducts) {
    console.error('Форма добавления не найдена')
    return
    }

    const previewElement = addFormProducts.querySelector('.image-preview')
    const downloadImageForm = createImageUploadHandler(previewElement)

    addFormProducts.addEventListener('click', downloadImageForm)
    
    addFormProducts.addEventListener('submit', async function (e) {
        e.preventDefault();
        const imageUrl = (addFormProducts.querySelector('.image-preview img')) ? addFormProducts.querySelector('.image-preview img').src : null
        let product = {
          id: Date.now(),
          name: nameProduct.value,
          productionDate: dateManufactureProduct.value || null,
          expiryDate: dateInput.value || null,
          shelfLife: (new Date(dateInput.value) - new Date(dateManufactureProduct.value)) / 86400000 || null,
          category: categoryProduct.value,
          inArchive: false,
          image: imageUrl,
          addedDate: new Date().toISOString().split('T')[0]
        }
    
        await productsDB.addProduct(product)
        console.log(await productsDB.getAllProducts())
    
        addFormProducts.querySelector('.image-preview').innerHTML = ''
        renderAllProducts()
        await calendar.update()
    
        addFormProducts.reset()
      })
}