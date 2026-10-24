import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { uniqueImages } from '../api'

export function ProductGallery({
  title,
  images,
  productId,
}: {
  title: string
  images: string[]
  productId: number
}) {
  const [failed, setFailed] = useState<string[]>([])
  const [activeImage, setActiveImage] = useState(images[0] ?? '')
  const [loadedImage, setLoadedImage] = useState<string | null>(null)

  const available = uniqueImages(images).filter(
    (image) => !failed.includes(image),
  )
  const active = available.includes(activeImage)
    ? activeImage
    : (available[0] ?? '')
  const activeIndex = available.indexOf(active)
  const hasMultiple = available.length > 1

  const selectImage = (image: string) => {
    setActiveImage(image)
  }

  const step = (direction: -1 | 1) => {
    if (!hasMultiple) return
    const next =
      (activeIndex + direction + available.length) % available.length
    setActiveImage(available[next])
  }

  const handleError = (image: string) => {
    setFailed((current) =>
      current.includes(image) ? current : [...current, image],
    )
  }

  if (available.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-5 bg-mist p-8 text-center">
        <span className="flex size-16 items-center justify-center border border-ash/40 text-ash-ink">
          <ImageOff size={30} strokeWidth={1.1} aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-2xl italic text-cinema">
            Image unavailable
          </p>
          <p className="eyebrow mt-3 text-ash-ink">
            Object N° {String(productId).padStart(3, '0')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-5">
      {hasMultiple && (
        <div
          className="hide-scrollbar flex gap-3 overflow-x-auto md:w-[76px] md:flex-col md:overflow-visible"
          role="group"
          aria-label="Product image thumbnails"
        >
          {available.map((image, index) => {
            const isActive = image === active
            return (
              <button
                key={image}
                type="button"
                onClick={() => selectImage(image)}
                className={`relative aspect-square w-[68px] shrink-0 overflow-hidden border bg-mist transition-colors md:w-full ${
                  isActive
                    ? 'border-noir'
                    : 'border-transparent hover:border-ash/60'
                }`}
                aria-label={`View image ${index + 1} of ${available.length}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
                {isActive && (
                  <span
                    className="absolute inset-x-0 bottom-0 h-1 bg-volt"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(141,121,246,0.2),transparent_55%)]"
            aria-hidden="true"
          />
          {loadedImage !== active && (
            <div
              className="skeleton-light absolute inset-4 z-0"
              aria-hidden="true"
            />
          )}
          <img
            key={active}
            src={active}
            alt={`${title} — image ${activeIndex + 1} of ${available.length}`}
            onLoad={() => setLoadedImage(active)}
            onError={() => handleError(active)}
            className={`relative z-10 size-full object-contain p-4 transition-opacity duration-300 sm:p-8 ${
              loadedImage === active ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
            <span className="bg-fog/90 px-2 py-1 text-[9px] font-bold tracking-[0.16em] text-noir uppercase backdrop-blur-sm">
              N° {String(productId).padStart(3, '0')}
            </span>
            <span className="bg-noir/75 px-2 py-1 text-[9px] font-semibold tracking-[0.14em] text-fog uppercase backdrop-blur-sm">
              {String(activeIndex + 1).padStart(2, '0')} /{' '}
              {String(available.length).padStart(2, '0')}
            </span>
          </div>

          {hasMultiple && (
            <div className="absolute inset-x-4 bottom-4 z-20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => step(-1)}
                className="flex size-10 items-center justify-center border border-noir/15 bg-fog/90 text-noir backdrop-blur-sm transition-colors hover:bg-noir hover:text-volt"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="flex size-10 items-center justify-center border border-noir/15 bg-fog/90 text-noir backdrop-blur-sm transition-colors hover:bg-noir hover:text-volt"
                aria-label="Next image"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
