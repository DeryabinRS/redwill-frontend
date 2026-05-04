/**
 * Масштабирование полного изображения для поста (без ручной обрезки):
 * ширина > высоты → итоговая ширина maxEdge px;
 * ширина < высоты → итоговая высота maxEdge px;
 * квадрат → как альбомный случай (ширина maxEdge).
 */
export function resizeDataUrlForPost(dataUrl: string, maxEdge = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      if (!w || !h) {
        reject(new Error('Нулевой размер изображения'))
        return
      }

      let outW: number
      let outH: number

      if (w > h) {
        outW = maxEdge
        outH = Math.round((maxEdge * h) / w)
      } else if (w < h) {
        outH = maxEdge
        outW = Math.round((maxEdge * w) / h)
      } else {
        outW = maxEdge
        outH = maxEdge
      }

      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas 2D недоступен'))
        return
      }

      ctx.imageSmoothingQuality = 'high'

      const sourceIsPng = /^data:image\/png/i.test(dataUrl)
      if (sourceIsPng) {
        ctx.clearRect(0, 0, outW, outH)
      } else {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, outW, outH)
      }

      ctx.drawImage(img, 0, 0, outW, outH)
      resolve(canvas.toDataURL('image/webp', 0.92))
    }
    img.onerror = () => reject(new Error('Не удалось загрузить изображение'))
    img.src = dataUrl
  })
}
