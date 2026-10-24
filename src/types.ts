export interface Category {
  id: number
  name: string
  slug: string
  image: string | null
}

export interface Product {
  id: number
  title: string
  slug: string
  price: number
  description: string
  category: Category | null
  images: string[]
}

export interface CartProduct {
  id: number
  title: string
  price: number
  image: string
  category: string
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

export type CatalogSort =
  | 'curated'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
