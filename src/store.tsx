import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  CartItem,
  CartProduct,
  Product,
} from './types'

const CART_KEY = 'maison-noir-cart-v1'
const MAX_QUANTITY = 99

interface CartNotice {
  key: number
  title: string
}

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  notice: CartNotice | null
  addItem: (product: Product, quantity?: number) => void
  increment: (productId: number) => void
  decrement: (productId: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  dismissNotice: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function readQuantity(value: unknown): number | null {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= MAX_QUANTITY
    ? value
    : null
}

function readCartProduct(value: unknown): CartProduct | null {
  if (!isRecord(value)) return null

  if (
    typeof value.id !== 'number' ||
    !Number.isInteger(value.id) ||
    value.id <= 0 ||
    !isNonEmptyString(value.title) ||
    typeof value.price !== 'number' ||
    !Number.isFinite(value.price) ||
    value.price < 0
  ) {
    return null
  }

  return {
    id: value.id,
    title: value.title,
    price: value.price,
    image: typeof value.image === 'string' ? value.image : '',
    category: typeof value.category === 'string' ? value.category : '',
  }
}

function readCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return []

  const items: CartItem[] = []
  const seen = new Set<number>()

  for (const raw of value) {
    if (!isRecord(raw)) continue
    const product = readCartProduct(raw.product)
    const quantity = readQuantity(raw.quantity)
    if (!product || quantity === null || seen.has(product.id)) continue
    seen.add(product.id)
    items.push({ product, quantity })
  }

  return items
}

function loadCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    return raw ? readCart(JSON.parse(raw) as unknown) : []
  } catch {
    return []
  }
}

function toCartProduct(product: Product): CartProduct {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.images[0] ?? '',
    category: product.category?.name ?? '',
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [isOpen, setIsOpen] = useState(false)
  const [notice, setNotice] = useState<CartNotice | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      return
    }
  }, [items])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 4200)
    return () => window.clearTimeout(timer)
  }, [notice])

  const addItem = useCallback((product: Product, quantity = 1) => {
    const requested = Number.isFinite(quantity) ? Math.trunc(quantity) : 1
    const safeQuantity = Math.min(MAX_QUANTITY, Math.max(1, requested))

    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  MAX_QUANTITY,
                  item.quantity + safeQuantity,
                ),
              }
            : item,
        )
      }

      return [...current, { product: toCartProduct(product), quantity: safeQuantity }]
    })

    setNotice({ key: Date.now(), title: product.title })
  }, [])

  const increment = useCallback((productId: number) => {
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.min(MAX_QUANTITY, item.quantity + 1),
            }
          : item,
      ),
    )
  }, [])

  const decrement = useCallback((productId: number) => {
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    )
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((current) =>
      current.filter((item) => item.product.id !== productId),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const dismissNotice = useCallback(() => setNotice(null), [])

  const count = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )
  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    [items],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      notice,
      addItem,
      increment,
      decrement,
      removeItem,
      clearCart,
      openCart,
      closeCart,
      dismissNotice,
    }),
    [
      items,
      count,
      subtotal,
      isOpen,
      notice,
      addItem,
      increment,
      decrement,
      removeItem,
      clearCart,
      openCart,
      closeCart,
      dismissNotice,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider.')
  return context
}
