import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { Button, Segmented, Space, message, Upload, Spin } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import 'react-image-crop/dist/ReactCrop.css'
import './ImageCropper.css'
import { resizeDataUrlForPost } from '../../utils/postImage'

type Orientation = 'portrait' | 'landscape'

type OutputSize = {
  width: number
  height: number
}

export interface ImageCropperProps {
  value?: string
  onChange?: (value: string) => void
  orientation?: Orientation
  onOrientationChange?: (orientation: Orientation) => void
  aspectRatio?: number
  outputSize?: OutputSize
  showOrientationSwitch?: boolean
  /** Без книжной/альбомной и без ручной обрезки: после выбора файла — масштаб под правила поста (1000px). */
  postImageMode?: boolean
}

/** Обрезка через canvas возможна только для локального data URL (новый файл), не для URL с сервера */
function isCroppableDataUrl(src: string): boolean {
  return src.startsWith('data:image/')
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

function ImageCropper({
  value,
  onChange,
  orientation = 'portrait',
  onOrientationChange,
  aspectRatio,
  outputSize,
  showOrientationSwitch = true,
  postImageMode = false,
}: ImageCropperProps) {
  const [messageApi, contextHolder] = message.useMessage()
  const [imgSrc, setImgSrc] = useState(value || '')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isCropping, setIsCropping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const aspect = aspectRatio ?? (orientation === 'portrait' ? 3 / 4 : 4 / 3)
  const maxSize = 1000

  // Автоматически обновляем crop при изменении ориентации (в режиме обрезки)
  useEffect(() => {
    if (!isCropping || !imgRef.current?.complete) return
    const { width, height } = imgRef.current
    setCrop(centerAspectCrop(width, height, aspect))
    setCompletedCrop(undefined)
  }, [aspect, isCropping])

  // При входе в обрезку картинка часто уже в кэше — onLoad не вызывается, без этого нет рамки crop
  useLayoutEffect(() => {
    if (!isCropping || !imgSrc) return
    const img = imgRef.current
    if (!img?.complete || !img.naturalWidth) return
    const { width, height } = img
    setCrop(centerAspectCrop(width, height, aspect))
    setCompletedCrop(undefined)
  }, [isCropping, imgSrc, aspect])

  // Синхронизация с value из формы/родителя; не затирать превью при value === undefined
  useEffect(() => {
    if (isCropping) return
    if (value === undefined || value === null) return
    setImgSrc(value)
  }, [value, isCropping])

  const beforeUpload = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      messageApi.error('Допустимые форматы: JPG, JPEG, PNG, WebP')
      return false
    }

    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = () => {
      const raw = reader.result?.toString() || ''
      if (postImageMode) {
        void resizeDataUrlForPost(raw)
          .then((resized) => {
            setImgSrc(resized)
            onChange?.(resized)
          })
          .catch(() => {
            messageApi.error('Не удалось обработать изображение')
          })
          .finally(() => {
            setIsLoading(false)
          })
        return
      }
      setImgSrc(raw)
      setIsCropping(true)
      setCrop(undefined)
      setIsLoading(false)
    }
    reader.readAsDataURL(file)

    return false
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspect))
  }, [aspect])

  const getCroppedImage = useCallback(() => {
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

    let outputWidth: number
    let outputHeight: number

    if (outputSize) {
      outputWidth = outputSize.width
      outputHeight = outputSize.height
    } else if (orientation === 'portrait') {
      outputHeight = maxSize
      outputWidth = (cropWidth / cropHeight) * maxSize
    } else {
      outputWidth = maxSize
      outputHeight = (cropHeight / cropWidth) * maxSize
    }

    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.imageSmoothingQuality = 'high'

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY

    const sourceIsPng =
      /^data:image\/png/i.test(image.currentSrc || '') ||
      /^data:image\/png/i.test(imgSrc)

    if (sourceIsPng) {
      ctx.clearRect(0, 0, outputWidth, outputHeight)
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, outputWidth, outputHeight)
    }

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

    const dataUrl = canvas.toDataURL('image/webp', 0.92)
    setImgSrc(dataUrl)
    onChange?.(dataUrl)
    setIsCropping(false)
  }, [completedCrop, orientation, onChange, outputSize, imgSrc])

  if (!isCropping) {
    return (
      <>
        {contextHolder}
        <Space className="image-cropper" direction="vertical" style={{ width: '100%' }}>
        {!imgSrc && (
          <Upload
            style={{ width: '100%', height: 250, marginTop: -16 }}
            listType="picture-card"
            beforeUpload={beforeUpload}
            showUploadList={false}
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          >
            {isLoading ? <Spin size="small" /> : (
              <button type="button" style={{ border: 0, background: 'none', padding: 0 }}>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Загрузить</div>
              </button>
            )}
          </Upload>
        )}
        {imgSrc && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <img src={imgSrc} alt="Preview" style={{ maxWidth: '100%' }} />
            <Space style={{ marginTop: 8 }}>
              {isCroppableDataUrl(imgSrc) && !postImageMode && (
                <Button size="small" onClick={() => setIsCropping(true)}>
                  Обрезать
                </Button>
              )}
              <Button size="small" danger onClick={() => { setImgSrc(''); onChange?.('') }}>Удалить</Button>
            </Space>
          </div>
        )}
      </Space>
      </>
    )
  }

  return (
    <>
      {contextHolder}
      <Space className="image-cropper" direction="vertical" style={{ width: '100%' }}>
      {showOrientationSwitch && !postImageMode && (
        <Segmented
          options={[
            { label: 'Книжная (3:4)', value: 'portrait' },
            { label: 'Альбомная (4:3)', value: 'landscape' },
          ]}
          value={orientation}
          onChange={(val) => onOrientationChange?.(val as Orientation)}
        />
      )}
      
      <div style={{ maxHeight: '100%', maxWidth: 400, overflow: 'auto' }}>
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
        >
          <div className="image-cropper-crop-surface">
            <img
              ref={imgRef}
              alt="Crop me"
              src={imgSrc}
              onLoad={onImageLoad}
              style={{ maxWidth: '100%' }}
            />
          </div>
        </ReactCrop>
      </div>

      <Space>
        <Button type="primary" onClick={getCroppedImage}>Применить</Button>
        <Button
          onClick={() => {
            setIsCropping(false)
            setImgSrc(value || '')
          }}
        >
          Отмена
        </Button>
      </Space>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Space>
    </>
  )
}

export default ImageCropper
