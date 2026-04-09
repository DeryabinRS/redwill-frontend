import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { Button, Segmented, Space, message } from 'antd'
import { UploadOutlined, RotateLeftOutlined, RotateRightOutlined } from '@ant-design/icons'
import 'react-image-crop/dist/ReactCrop.css'

type Orientation = 'portrait' | 'landscape'

interface ImageCropperProps {
  value?: string
  onChange?: (value: string) => void
  orientation?: Orientation
  onOrientationChange?: (orientation: Orientation) => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

function ImageCropper({ value, onChange, orientation = 'landscape', onOrientationChange }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState(value || '')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isCropping, setIsCropping] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const aspect = orientation === 'portrait' ? 3 / 4 : 4 / 3
  const maxSize = 1000

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      message.error('Выберите изображение')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImgSrc(reader.result?.toString() || '')
      setIsCropping(true)
      setCrop(undefined)
    }
    reader.readAsDataURL(file)
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspect))
  }, [aspect])

  const getCroppedImage = useCallback(async () => {
    const image = imgRef.current
    const canvas = canvasRef.current

    if (!image || !canvas || !completedCrop) {
      return
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cropWidth = completedCrop.width * scaleX
    const cropHeight = completedCrop.height * scaleY

    // Рассчитываем размеры с сохранением пропорций
    let outputWidth: number
    let outputHeight: number

    if (orientation === 'portrait') {
      // Ресайз по высоте до 1000px
      outputHeight = maxSize
      outputWidth = (cropWidth / cropHeight) * maxSize
    } else {
      // Ресайз по ширине 1000px
      outputWidth = maxSize
      outputHeight = (cropHeight / cropWidth) * maxSize
    }

    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.imageSmoothingQuality = 'high'

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    )

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setImgSrc(dataUrl)
    onChange?.(dataUrl)
    setIsCropping(false)
  }, [completedCrop, orientation, onChange])

  const handleRotate = () => {
    // Для простоты просто перезагрузим изображение
    // В реальном приложении можно повернуть canvas
    message.info('Перезагрузите изображение для поворота')
  }

  if (!isCropping) {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button icon={<UploadOutlined />} onClick={() => document.getElementById('image-upload')?.click()}>
          Выбрать изображение
        </Button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onSelectFile}
        />
        {imgSrc && (
          <div>
            <img src={imgSrc} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200 }} />
            <Space style={{ marginTop: 8 }}>
              <Button size="small" onClick={() => setIsCropping(true)}>Обрезать</Button>
              <Button size="small" danger onClick={() => { setImgSrc(''); onChange?.('') }}>Удалить</Button>
            </Space>
          </div>
        )}
      </Space>
    )
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Segmented
        options={[
          { label: 'Книжная (3:4)', value: 'portrait' },
          { label: 'Альбомная (4:3)', value: 'landscape' },
        ]}
        value={orientation}
        onChange={(val) => onOrientationChange?.(val as Orientation)}
      />
      
      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imgSrc}
            onLoad={onImageLoad}
            style={{ maxWidth: '100%' }}
          />
        </ReactCrop>
      </div>

      <Space>
        <Button type="primary" onClick={getCroppedImage}>Применить</Button>
        <Button onClick={() => setIsCropping(false)}>Отмена</Button>
        <Button icon={<RotateLeftOutlined />} onClick={handleRotate} />
        <Button icon={<RotateRightOutlined />} onClick={handleRotate} />
      </Space>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Space>
  )
}

export default ImageCropper
