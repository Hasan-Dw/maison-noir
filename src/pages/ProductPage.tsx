import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ImageOff,
  Minus,
  Plus,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react'
import {
  fetchProduct,
  fetchRelatedProducts,
  formatPrice,
} from '../api'
import { ProductDetailsSkeleton } from '../components/ProductSkeleton'
import { ProductGallery } from '../components/ProductGallery'
import { useCart } from '../store'
import type { Product } from '../types'

const breadcrumbLink =
  'text-[10px] font-semibold tracking-[0.14em] uppercase text-ash transition-colors hover:text-volt'

function NotFoundState() {
  return (
    <section className="container-mn flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-16 items-center justify-center border border-noir/15 text-ash-ink">
        <ImageOff size={26} strokeWidth={1.1} aria-hidden="true" />
      </span>
      <p className="eyebrow mt-7 text-ash-ink">Object not found</p>
      <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.8rem,7vw,6rem)] italic leading-none text-noir">
        This object has left the frame.
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-cinema/75">
        The catalogue may have changed, or this address may not belong to a
        current object.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/#collection"
          className="inline-flex items-center gap-3 bg-noir px-5 py-3.5 text-[10px] font-bold tracking-[0.16em] text-volt uppercase transition-colors hover:bg-cinema"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          Return to the collection
        </Link>
      </div>
    </section>
  )
}

function RelatedCard({ product }: { product: Product }) {
  const [imageFailed, setImageFailed] = useState(false)
  const image = product.images[0]

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block min-w-0"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-mist">
        {image && !imageFailed ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-ash-ink">
            <ImageOff size={22} strokeWidth={1.2} aria-hidden="true" />
          </span>
        )}
        <span className="absolute left-3 top-3 bg-fog/90 px-2 py-1 text-[9px] font-bold tracking-[0.14em] text-noir uppercase backdrop-blur-sm">
          N° {String(product.id).padStart(3, '0')}
        </span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 border-b border-veil/70 pb-3">
        <div className="min-w-0">
          <p className="eyebrow mb-1.5 text-ash-ink">
            {product.category?.name ?? 'Object'}
          </p>
          <h3 className="line-clamp-2 font-display text-lg leading-tight text-noir transition-colors group-hover:text-cinema">
            {product.title}
          </h3>
        </div>
        <p className="shrink-0 text-xs font-semibold text-noir">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  )
}

export function ProductPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [status, setStatus] = useState<
    'loading' | 'ready' | 'error' | 'not-found'
  >('loading')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [related, setRelated] = useState<Product[]>([])

  const productId = Number(id)

  useEffect(() => {
    if (!Number.isInteger(productId) || productId <= 0) {
      setStatus('not-found')
      setProduct(null)
      return
    }

    const controller = new AbortController()
    setStatus('loading')
    setProduct(null)
    setError('')
    setQuantity(1)
    setRelated([])

    fetchProduct(productId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        if (!data) {
          setStatus('not-found')
          return
        }
        setProduct(data)
        setStatus('ready')
      })
      .catch((caught: unknown) => {
        if (
          controller.signal.aborted ||
          (caught instanceof DOMException && caught.name === 'AbortError')
        ) {
          return
        }
        setStatus('error')
        setError(
          caught instanceof Error
            ? caught.message
            : 'This object could not be loaded.',
        )
      })

    return () => controller.abort()
  }, [productId, attempt])

  useEffect(() => {
    if (!product?.category) return

    const controller = new AbortController()
    setRelated([])

    fetchRelatedProducts(
      product.category.id,
      product.id,
      controller.signal,
    )
      .then((data) => {
        if (!controller.signal.aborted) setRelated(data)
      })
      .catch(() => {
        if (!controller.signal.aborted) setRelated([])
      })

    return () => controller.abort()
  }, [product?.category, product?.id])

  useEffect(() => {
    if (!product) return
    const previousTitle = document.title
    document.title = `${product.title} — MAISON NOIR`
    return () => {
      document.title = previousTitle
    }
  }, [product])

  if (status === 'loading') {
    return (
      <div className="bg-fog">
        <ProductDetailsSkeleton />
      </div>
    )
  }

  if (status === 'not-found') {
    return <NotFoundState />
  }

  if (status === 'error' || !product) {
    return (
      <section className="container-mn flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
        <AlertCircle
          size={34}
          strokeWidth={1.1}
          className="text-cinema"
          aria-hidden="true"
        />
        <p className="eyebrow mt-6 text-ash-ink">Connection interrupted</p>
        <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.8rem,7vw,5.5rem)] italic leading-none text-noir">
          The object is out of view.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-cinema/75">
          {error || 'The catalogue could not be reached just now.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setAttempt((current) => current + 1)}
            className="inline-flex items-center gap-2 bg-noir px-5 py-3.5 text-[10px] font-bold tracking-[0.16em] text-volt uppercase transition-colors hover:bg-cinema"
          >
            <RefreshCw size={14} strokeWidth={1.8} />
            Try again
          </button>
          <Link
            to="/#collection"
            className="inline-flex items-center gap-2 border border-noir/25 px-5 py-3.5 text-[10px] font-bold tracking-[0.16em] text-noir uppercase transition-colors hover:border-noir"
          >
            Back to collection
          </Link>
        </div>
      </section>
    )
  }

  const category = product.category
  const departmentHref = category
    ? `/?category=${encodeURIComponent(category.slug)}#collection`
    : '/#collection'
  const lineTotal = product.price * quantity

  return (
    <>
      <section className="grain relative overflow-hidden bg-noir pb-12 pt-8 text-fog sm:pb-16 lg:pb-20">
        <div
          className="pointer-events-none absolute right-0 top-0 size-[36rem] rounded-full bg-ultra/15 blur-[130px]"
          aria-hidden="true"
        />
        <div className="container-mn relative">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <li>
                <Link to="/" className={breadcrumbLink}>
                  Home
                </Link>
              </li>
              <li className="text-white/25" aria-hidden="true">
                /
              </li>
              <li>
                <Link to="/#collection" className={breadcrumbLink}>
                  Collection
                </Link>
              </li>
              {category && (
                <>
                  <li className="text-white/25" aria-hidden="true">
                    /
                  </li>
                  <li>
                    <Link to={departmentHref} className={breadcrumbLink}>
                      {category.name}
                    </Link>
                  </li>
                </>
              )}
              <li className="text-white/25" aria-hidden="true">
                /
              </li>
              <li
                className="max-w-[55vw] truncate text-[10px] font-semibold tracking-[0.14em] text-fog/55 uppercase sm:max-w-md"
                aria-current="page"
              >
                {product.title}
              </li>
            </ol>
          </nav>

          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow flex flex-wrap items-center gap-3 text-volt">
                <span>Object N° {String(product.id).padStart(3, '0')}</span>
                <span className="h-px w-8 bg-volt/50" aria-hidden="true" />
                <span className="text-ash">
                  {category?.name ?? 'Uncatalogued'}
                </span>
              </p>
              <h1 className="mt-6 max-w-4xl font-display text-[clamp(3rem,7.5vw,7.5rem)] italic leading-[0.9] tracking-[-0.035em] text-fog">
                {product.title}
              </h1>
            </div>
            <div className="flex items-end justify-between gap-8 border-t border-white/15 pt-5 lg:col-span-4 lg:flex-col lg:items-start lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div>
                <p className="eyebrow text-ash">List price</p>
                <p className="mt-2 font-display text-4xl text-volt sm:text-5xl">
                  {formatPrice(product.price)}
                </p>
              </div>
              <p className="max-w-[13rem] text-[9px] leading-relaxed tracking-[0.14em] text-ash uppercase">
                Live from the EscuelaJS catalogue
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-fog py-10 sm:py-14 lg:py-20">
        <div className="container-mn">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="min-w-0 lg:col-span-7">
              <ProductGallery
                key={product.id}
                title={product.title}
                images={product.images}
                productId={product.id}
              />
            </div>

            <aside className="lg:col-span-5 lg:pl-10">
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow flex items-center gap-3 text-ash-ink">
                  <span className="h-px w-8 bg-current" aria-hidden="true" />
                  About the object
                </p>

                <p className="mt-6 whitespace-pre-line text-[15px] leading-[1.75] text-cinema/80">
                  {product.description ||
                    'No description is available for this object.'}
                </p>

                <dl className="mt-9 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-veil py-6 text-sm">
                  <div>
                    <dt className="eyebrow text-ash-ink">Department</dt>
                    <dd className="mt-1.5 text-cinema">
                      {category?.name ?? 'Uncatalogued'}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ash-ink">Catalogue</dt>
                    <dd className="mt-1.5 text-cinema">
                      N° {String(product.id).padStart(3, '0')}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ash-ink">Images</dt>
                    <dd className="mt-1.5 text-cinema">
                      {product.images.length}{' '}
                      {product.images.length === 1 ? 'view' : 'views'}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ash-ink">Source</dt>
                    <dd className="mt-1.5 text-cinema">EscuelaJS / API</dd>
                  </div>
                </dl>

                <div className="mt-8">
                  <p className="eyebrow text-ash-ink">Quantity</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex h-12 items-center border border-noir/25">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((current) => Math.max(1, current - 1))
                        }
                        disabled={quantity <= 1}
                        className="flex size-12 items-center justify-center text-noir transition-colors hover:bg-noir hover:text-volt disabled:cursor-not-allowed disabled:text-noir/20 disabled:hover:bg-transparent disabled:hover:text-noir/20"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} strokeWidth={1.7} />
                      </button>
                      <span
                        className="w-10 text-center text-sm font-bold text-noir"
                        aria-live="polite"
                        aria-label={`Quantity ${quantity}`}
                      >
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((current) => Math.min(99, current + 1))
                        }
                        className="flex size-12 items-center justify-center text-noir transition-colors hover:bg-noir hover:text-volt"
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} strokeWidth={1.7} />
                      </button>
                    </div>
                    <p className="text-sm text-cinema/75">
                      {formatPrice(product.price)} each
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addItem(product, quantity)}
                  className="mt-6 flex w-full items-center justify-between bg-noir px-5 py-4 text-[10px] font-extrabold tracking-[0.16em] text-volt uppercase transition-colors hover:bg-cinema"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag size={16} strokeWidth={1.6} />
                    Add to bag
                  </span>
                  <span>{formatPrice(lineTotal)}</span>
                </button>

                <p className="mt-4 text-[10px] leading-relaxed tracking-wide text-ash-ink">
                  Demonstration storefront. Adding an object updates your
                  browser-local bag and no payment is processed.
                </p>

                <Link
                  to={departmentHref}
                  className="mt-8 flex items-center justify-between border-t border-veil pt-5 text-[10px] font-bold tracking-[0.16em] text-cinema/75 uppercase transition-colors hover:text-noir"
                >
                  More from {category?.name ?? 'the collection'}
                  <ArrowRight size={14} strokeWidth={1.7} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-veil bg-fog pb-20 pt-14 sm:pb-24">
          <div className="container-mn">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="eyebrow text-ash-ink">In the same orbit</p>
                <h2 className="mt-3 font-display text-[clamp(2.4rem,4.5vw,4.5rem)] italic leading-none text-noir">
                  More {category?.name.toLowerCase() ?? 'objects'}
                </h2>
              </div>
              <Link
                to={departmentHref}
                className="link-underline flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-cinema/70 uppercase transition-colors hover:text-noir"
              >
                View the department
                <ArrowRight size={13} strokeWidth={1.7} />
              </Link>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
              {related.map((item) => (
                <RelatedCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
