import type { Category, Product } from './types'

const API_BASE = 'https://api.escuelajs.co/api/v1'
const PAGE_SIZE = 100
const MAX_CATALOG_PAGES = 10

export const CORE_CATEGORY_SLUGS = [
  'electronics',
  'furniture',
  'shoes',
  'miscellaneous',
] as const

const JUNK_TITLES = [
  /^title-/i,
  /^electronics from config/i,
  /^updatedname-/i,
  /^product_/i,
  /^string$/i,
  /^prueba/i,
  /^produto de teste/i,
  /^ceramic mug/i,
  /^rosas/i,
  /^holly\./i,
  /^testing/i,
]

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readId(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null
}

function readPrice(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null
}

export function isValidImageUrl(value: string): boolean {
  if (!value) return false

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function uniqueImages(values: string[]): string[] {
  return [...new Set(values.filter(isValidImageUrl))]
}

function normalizeCategory(value: unknown): Category | null {
  if (!isRecord(value)) return null

  const id = readId(value.id)
  const name = readString(value.name)
  if (id === null || !name) return null

  const slug = readString(value.slug) || name.toLowerCase().replace(/\s+/g, '-')
  const image = readString(value.image)

  return {
    id,
    name,
    slug,
    image: isValidImageUrl(image) ? image : null,
  }
}

function normalizeProduct(value: unknown): Product | null {
  if (!isRecord(value)) return null

  const id = readId(value.id)
  const title = readString(value.title)
  const price = readPrice(value.price)
  if (id === null || !title || price === null) return null

  const rawImages = Array.isArray(value.images)
    ? value.images.filter((image): image is string => typeof image === 'string')
    : []

  return {
    id,
    title,
    slug: readString(value.slug) || String(id),
    price,
    description: readString(value.description),
    category: normalizeCategory(value.category),
    images: uniqueImages(rawImages),
  }
}

function isCuratedProduct(product: Product): boolean {
  if (!product.category) return false
  if (
    !CORE_CATEGORY_SLUGS.includes(
      product.category.slug as (typeof CORE_CATEGORY_SLUGS)[number],
    )
  ) {
    return false
  }

  return !JUNK_TITLES.some((pattern) => pattern.test(product.title))
}

export function isCatalogProduct(product: Product): boolean {
  return isCuratedProduct(product)
}

async function request<T>(
  path: string,
  signal: AbortSignal,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new ApiError('The boutique could not reach the catalogue.', 0)
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? 'This object could not be found.'
        : 'The catalogue returned an unexpected response.',
      response.status,
    )
  }

  const data: unknown = await response.json()
  return data as T
}

async function fetchProductChunk(
  offset: number,
  limit: number,
  signal: AbortSignal,
  extraParams?: Record<string, string>,
): Promise<Product[]> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
    ...extraParams,
  })
  const data = await request<unknown>(`/products?${params.toString()}`, signal)

  if (!Array.isArray(data)) {
    throw new ApiError('The catalogue returned malformed product data.', 0)
  }

  return data
    .map((item) => normalizeProduct(item))
    .filter((product): product is Product => product !== null)
}

export async function fetchCatalog(signal: AbortSignal): Promise<Product[]> {
  const all: Product[] = []

  for (let page = 0; page < MAX_CATALOG_PAGES; page += 1) {
    const offset = page * PAGE_SIZE
    const chunk = await fetchProductChunk(offset, PAGE_SIZE, signal)
    all.push(...chunk)

    if (chunk.length < PAGE_SIZE) break
  }

  const unique = new Map<number, Product>()
  for (const product of all) {
    if (isCuratedProduct(product)) unique.set(product.id, product)
  }

  return [...unique.values()]
}

export async function fetchCategories(signal: AbortSignal): Promise<Category[]> {
  const data = await request<unknown>('/categories', signal)
  if (!Array.isArray(data)) {
    throw new ApiError('The departments returned malformed data.', 0)
  }

  const categories = data
    .map((item) => normalizeCategory(item))
    .filter((category): category is Category => category !== null)
    .filter((category) =>
      CORE_CATEGORY_SLUGS.includes(
        category.slug as (typeof CORE_CATEGORY_SLUGS)[number],
      ),
    )

  return categories.sort(
    (a, b) =>
      CORE_CATEGORY_SLUGS.indexOf(
        a.slug as (typeof CORE_CATEGORY_SLUGS)[number],
      ) -
      CORE_CATEGORY_SLUGS.indexOf(
        b.slug as (typeof CORE_CATEGORY_SLUGS)[number],
      ),
  )
}

export async function fetchProduct(
  id: number,
  signal: AbortSignal,
): Promise<Product | null> {
  if (!Number.isInteger(id) || id <= 0) return null

  try {
    const data = await request<unknown>(`/products/${id}`, signal)
    return normalizeProduct(data)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null
    }
    throw error
  }
}

export async function fetchRelatedProducts(
  categoryId: number,
  currentProductId: number,
  signal: AbortSignal,
): Promise<Product[]> {
  const data = await request<unknown>(
    `/categories/${categoryId}/products?offset=0&limit=32`,
    signal,
  )

  if (!Array.isArray(data)) return []

  const products = data
    .map((item) => normalizeProduct(item))
    .filter((product): product is Product => product !== null)
    .filter(
      (product) =>
        product.id !== currentProductId && isCuratedProduct(product),
    )

  return products.slice(0, 4)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
  }).format(price)
}
