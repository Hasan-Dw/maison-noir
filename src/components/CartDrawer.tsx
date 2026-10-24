import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ImageOff,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react'
import { formatPrice } from '../api'
import { useDialogA11y } from '../hooks'
import { useCart } from '../store'
import type { CartItem } from '../types'

function CartLine({ item }: { item: CartItem }) {
  const { increment, decrement, removeItem, closeCart } = useCart()
  const [imageFailed, setImageFailed] = useState(false)
  const { product, quantity } = item

  return (
    <li className="grid grid-cols-[82px_1fr] gap-4 border-b border-white/10 py-5">
      <Link
        to={`/products/${product.id}`}
        onClick={closeCart}
        className="relative aspect-[4/5] overflow-hidden bg-mist"
        aria-label={`View ${product.title}`}
      >
        {product.image && !imageFailed ? (
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-mist text-ash">
            <ImageOff size={20} strokeWidth={1.2} aria-hidden="true" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {product.category && (
              <p className="eyebrow mb-1.5 text-ash">{product.category}</p>
            )}
            <Link
              to={`/products/${product.id}`}
              onClick={closeCart}
              className="block font-display text-lg leading-tight text-fog transition-colors hover:text-volt"
            >
              <span className="line-clamp-2">{product.title}</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="shrink-0 p-1 text-ash transition-colors hover:text-volt"
            aria-label={`Remove ${product.title} from bag`}
          >
            <Trash2 size={15} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex h-8 items-center border border-white/20">
            <button
              type="button"
              onClick={() => decrement(product.id)}
              disabled={quantity <= 1}
              className="flex size-8 items-center justify-center text-fog transition-colors hover:text-volt disabled:cursor-not-allowed disabled:text-white/20"
              aria-label={`Decrease quantity of ${product.title}`}
            >
              <Minus size={12} strokeWidth={1.8} />
            </button>
            <span
              className="w-7 text-center text-xs font-bold"
              aria-label={`Quantity ${quantity}`}
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => increment(product.id)}
              className="flex size-8 items-center justify-center text-fog transition-colors hover:text-volt"
              aria-label={`Increase quantity of ${product.title}`}
            >
              <Plus size={12} strokeWidth={1.8} />
            </button>
          </div>
          <p className="text-sm font-semibold text-fog">
            {formatPrice(product.price * quantity)}
          </p>
        </div>
      </div>
    </li>
  )
}

export function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    isOpen,
    closeCart,
    clearCart,
  } = useCart()
  const panelRef = useRef<HTMLElement>(null)
  const purchaseInProgress = useRef(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  useEffect(() => {
    if (!purchaseSuccess) return
    const timer = window.setTimeout(() => setPurchaseSuccess(false), 5000)
    return () => window.clearTimeout(timer)
  }, [purchaseSuccess])

  useEffect(() => {
    if (items.length > 0) {
      purchaseInProgress.current = false
    }
  }, [items.length])

  useDialogA11y(isOpen, closeCart, panelRef)

  if (!isOpen) return null

  const completePurchase = () => {
    if (purchaseInProgress.current || items.length === 0) return

    purchaseInProgress.current = true
    try {
      // This is a simulated purchase; no payment is collected or processed.
      clearCart()
      setPurchaseSuccess(true)
    } catch {
      purchaseInProgress.current = false
    }
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-noir/70 backdrop-blur-[2px]"
        onClick={closeCart}
        aria-label="Close shopping bag"
        tabIndex={-1}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        tabIndex={-1}
        className="grain absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col bg-noir text-fog shadow-[-30px_0_80px_rgba(0,0,0,0.28)]"
      >
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5 sm:px-7">
          <div>
            <p className="eyebrow text-volt">Your selection</p>
            <h2 id="bag-title" className="mt-1 font-display text-2xl italic">
              The bag{' '}
              <span className="font-sans text-[11px] not-italic tracking-widest text-ash">
                ({String(count).padStart(2, '0')})
              </span>
            </h2>
          </div>
          <button
            type="button"
            data-autofocus
            onClick={closeCart}
            className="flex size-10 items-center justify-center border border-white/20 text-fog transition-colors hover:border-volt hover:text-volt"
            aria-label="Close shopping bag"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            {purchaseSuccess ? (
              <div
                key="purchase-success"
                className="purchase-success w-full border border-volt/35 bg-cinema/70 px-6 py-8"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-volt/50 bg-volt/10 text-volt">
                  <Check size={25} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <p className="eyebrow mt-5 text-volt">Demonstration complete</p>
                <h3 className="mt-3 font-display text-2xl italic leading-tight text-fog sm:text-3xl">
                  Purchase completed successfully!
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-ash">
                  Your bag is now empty. No real payment was processed.
                </p>
              </div>
            ) : (
              <>
                <span className="flex size-20 items-center justify-center border border-white/15 text-ash">
                  <ShoppingBag size={28} strokeWidth={1} aria-hidden="true" />
                </span>
                <h3 className="mt-7 font-display text-3xl italic text-fog">
                  Your bag is empty
                </h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash">
                  There are no objects in your selection. The collection is waiting.
                </p>
              </>
            )}
            <Link
              to="/#collection"
              onClick={closeCart}
              className="mt-8 inline-flex items-center gap-3 bg-volt px-6 py-4 text-[10px] font-bold tracking-[0.18em] text-noir uppercase transition-colors hover:bg-fog"
            >
              Explore the collection
              <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 sm:px-7">
              {items.map((item) => (
                <CartLine key={item.product.id} item={item} />
              ))}
            </ul>

            <footer className="shrink-0 border-t border-white/10 px-5 pb-6 pt-5 sm:px-7">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-ash">Subtotal</span>
                <span className="font-display text-3xl text-fog">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed tracking-wide text-ash">
                Shipping and tax are not included. This is a demonstration
                storefront — no payment will be processed.
              </p>
              <button
                type="button"
                onClick={completePurchase}
                disabled={items.length === 0}
                className="mt-5 flex w-full items-center justify-between bg-volt px-5 py-4 text-[10px] font-extrabold tracking-[0.18em] text-noir uppercase transition-colors hover:bg-fog disabled:cursor-not-allowed disabled:opacity-40"
              >
                Complete purchase
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full py-2 text-[10px] font-bold tracking-[0.16em] text-ash uppercase transition-colors hover:text-volt"
              >
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
