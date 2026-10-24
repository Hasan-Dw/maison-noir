import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageOff, Plus } from 'lucide-react'
import { formatPrice } from '../api'
import { useCart } from '../store'
import type { Product } from '../types'

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const { addItem } = useCart()
  const [imageFailed, setImageFailed] = useState(false)
  const image = product.images[0]
  const category = product.category?.name ?? 'Uncatalogued'

  return (
    <article className="group flex min-w-0 flex-col">
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden bg-mist"
      >
        {image && !imageFailed ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-4 bg-mist p-6 text-center text-ash-ink">
            <ImageOff size={26} strokeWidth={1.2} aria-hidden="true" />
            <span className="eyebrow-wide">Image unavailable</span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
          <span className="bg-fog/90 px-2 py-1 text-[9px] font-bold tracking-[0.16em] text-noir uppercase backdrop-blur-sm">
            N° {String(product.id).padStart(3, '0')}
          </span>
          <span className="max-w-[55%] truncate bg-noir/80 px-2 py-1 text-[9px] font-semibold tracking-[0.14em] text-fog uppercase backdrop-blur-sm">
            {category}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-noir/55 to-transparent px-3 pb-3 pt-12 text-[9px] font-bold tracking-[0.18em] text-fog uppercase opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:px-4 sm:pb-4">
          View object ↗
        </div>
      </Link>

      <div className="flex flex-1 items-start justify-between gap-3 border-b border-veil/60 py-4">
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-2 text-ash-ink">
            {String(index + 1).padStart(2, '0')} / {category}
          </p>
          <Link
            to={`/products/${product.id}`}
            className="block font-display text-[1.32rem] leading-[1.08] text-noir transition-colors hover:text-cinema sm:text-[1.45rem]"
          >
            <span className="line-clamp-2 min-h-[2.35em]">{product.title}</span>
          </Link>
          <p className="mt-3 text-sm font-semibold tracking-wide text-noir">
            {formatPrice(product.price)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => addItem(product)}
          className="mt-5 flex size-10 shrink-0 items-center justify-center border border-noir/20 text-noir transition-colors hover:border-noir hover:bg-noir hover:text-volt"
          aria-label={`Add ${product.title} to bag`}
        >
          <Plus size={17} strokeWidth={1.7} />
        </button>
      </div>
    </article>
  )
}
