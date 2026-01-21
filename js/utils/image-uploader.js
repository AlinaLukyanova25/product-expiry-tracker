export function createImageUploadHandler(previewElement) {
    return async function downloadImage(e) {

    if (e.target.closest('.image-preview')) {

      try {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

        input.onchange = async function (event) {
        const file = event.target.files[0];
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Выберите файл для изображения!')
            return
          }
          
          if (file.size > 5 * 1024 * 1024) {
            alert('Изображение слишком большое. Максимум 5МВ')
            return
          }

        const reader = new FileReader()

      reader.onload = async function (e) {
        try {
          const compressedImage = await compressImage(e.target.result)
        
          previewElement.innerHTML = `<img src="${compressedImage}" alt="Фото продукта">`
        
        } catch (error) {
          console.error('Ошибка при обработке фото:', error)
        }
        
          }
          
          reader.onerror = (error) => {
            console.error('Ошибка при чтении файла:', error)
          }

          reader.readAsDataURL(file)
          
          setTimeout(() => input.remove(), 100)
    }

        input.click()
        
    } catch(error) {
        console.error('Ошибка при загрузке фото:', error)
      }
    }
    }
    
    async function compressImage(dataUrl, maxWidth = 800) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = dataUrl

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height 

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
        resolve(compressedDataUrl)
      }
    })
  }
}