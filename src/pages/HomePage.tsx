import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ImageOff,
  RefreshCw,
  Search,
  X,
} from "lucide-react"
import { fetchCatalog, fetchCategories, formatPrice } from "../api"
import { ProductCard } from "../components/ProductCard"
import { ProductSkeleton } from "../components/ProductSkeleton"
import type { CatalogSort, Category, Product } from "../types"

const PAGE_SIZE = 8

const categoryNotes: Record<string, string> = {
  electronics: "Light, sound and precision.",
  furniture: "Form, considered for living.",
  shoes: "Motion, held in profile.",
  miscellaneous: "The unexpected object.",
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

function parseSort(value: string | null): CatalogSort {
  if (value === "price-asc" || value === "price-desc" || value === "name-asc") {
    return value
  }
  return "curated"
}

function scrollToCollection() {
  window.setTimeout(() => {
    const target = document.getElementById("collection")
    if (!target) return
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    target.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    })
  }, 40)
}

function ErrorPanel({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-start gap-6 border border-veil bg-mist/50 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
      <div className="flex items-start gap-4">
        <AlertCircle
          size={24}
          strokeWidth={1.3}
          className="mt-0.5 shrink-0 text-cinema"
          aria-hidden="true"
        />
        <div>
          <p className="font-display text-2xl text-noir">{title}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-cinema/70">
            {message}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex shrink-0 items-center gap-2 border border-noir/25 px-5 py-3 text-[10px] font-bold tracking-[0.16em] uppercase transition-colors hover:border-noir hover:bg-noir hover:text-volt"
      >
        <RefreshCw size={13} strokeWidth={1.8} />
        Try again
      </button>
    </div>
  )
}

function HeroVisual({
  product,
  loading,
}: {
  product: Product | null
  loading: boolean
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const image = product?.images[0]

  if (loading) {
    return (
      <div className="relative border border-ultra/40 p-3 sm:p-4">
        <div className="skeleton-dark aspect-[4/5] w-full" />
        <div className="mt-4 border-t border-white/15 pt-4">
          <div className="h-2 w-20 animate-pulse bg-white/10" />
          <div className="mt-3 h-4 w-3/4 animate-pulse bg-white/10" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="relative border border-ultra/40 p-3 sm:p-4">
        <div className="flex aspect-[4/5] flex-col justify-between overflow-hidden bg-cinema p-7">
          <span className="eyebrow-wide text-ultra">The archive</span>
          <span className="font-display text-[clamp(4rem,10vw,8rem)] italic leading-none text-fog/10">
            MN
          </span>
          <span className="text-[10px] leading-relaxed tracking-[0.18em] text-ash uppercase">
            A visual study in objects
          </span>
        </div>
        <p className="mt-4 border-t border-white/15 pt-4 text-sm text-ash">
          A visual study in objects
        </p>
      </div>
    )
  }

  return (
    <div className="relative min-w-0 border border-ultra/40 p-3 sm:p-4">
      <Link
        to={`/products/${product.id}`}
        className="group relative block aspect-[4/5] overflow-hidden bg-mist"
      >
        {image && !imageFailed ? (
          <img
            src={image}
            alt={product.title}
            onError={() => setImageFailed(true)}
            className="cinema-image size-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-4 bg-mist text-ash-ink">
            <ImageOff size={30} strokeWidth={1.1} aria-hidden="true" />
            <span className="eyebrow">Image unavailable</span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
          <span className="bg-fog/90 px-2 py-1 text-[9px] font-bold tracking-[0.16em] text-noir uppercase backdrop-blur-sm">
            N° {String(product.id).padStart(3, "0")}
          </span>
          <span className="bg-noir/75 px-2 py-1 text-[9px] font-semibold tracking-[0.14em] text-fog uppercase backdrop-blur-sm">
            Featured object
          </span>
        </div>

        <span className="absolute bottom-4 left-4 bg-noir/75 px-3 py-2 text-[9px] font-bold tracking-[0.18em] text-fog uppercase backdrop-blur-sm">
          View object ↗
        </span>
      </Link>

      <div className="mt-4 flex min-w-0 items-start justify-between gap-4 border-t border-white/15 pt-4">
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-ash">
            {product.category?.name ?? "Object"}
          </p>
          <Link
            to={`/products/${product.id}`}
            title={product.title}
            className="mt-1.5 block break-words font-display text-lg italic leading-snug text-fog transition-colors hover:text-volt sm:text-xl"
          >
            {product.title}
          </Link>
        </div>
        <p className="shrink-0 pt-0.5 text-sm font-semibold text-fog">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  )
}

function CategoryCard({
  category,
  index,
  active,
  onSelect,
}: {
  category: Category
  index: number
  active: boolean
  onSelect: () => void
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const spans = [
    "lg:col-span-7",
    "lg:col-span-5",
    "lg:col-span-5",
    "lg:col-span-7",
  ]

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`group relative block aspect-[16/10] w-full overflow-hidden bg-cinema text-left md:col-span-1 ${
        spans[index] ?? "lg:col-span-6"
      } ${active ? "ring-2 ring-volt ring-inset" : ""}`}
    >
      {category.image && !imageFailed ? (
        <img
          src={category.image}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 size-full object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.035] group-hover:opacity-95"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3a3464_0%,#222044_48%,#17131f_100%)]"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-noir/95 via-noir/25 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-5 text-fog sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="eyebrow text-volt">
            Department / {String(index + 1).padStart(2, "0")}
          </span>
          {active && (
            <span className="bg-volt px-2 py-1 text-[9px] font-bold tracking-[0.14em] text-noir uppercase">
              Filtering
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-5">
          <div>
            <h3 className="font-display text-[clamp(2rem,3.6vw,4rem)] italic leading-none">
              {category.name}
            </h3>
            <p className="mt-2 text-[10px] tracking-[0.14em] text-fog/65 uppercase">
              {categoryNotes[category.slug] ?? "A considered selection."}
            </p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center border border-white/30 transition-colors group-hover:border-volt group-hover:bg-volt group-hover:text-noir">
            <ArrowUpRight size={20} strokeWidth={1.3} />
          </span>
        </div>
      </div>
    </button>
  )
}

function PageNumbers({
  current,
  total,
  onSelect,
}: {
  current: number
  total: number
  onSelect: (page: number) => void
}) {
  const pages: Array<number | "gap"> = []

  for (let page = 1; page <= total; page += 1) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      pages.push(page)
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap")
    }
  }

  return (
    <>
      {pages.map((page, index) =>
        page === "gap" ? (
          <span
            key={`gap-${index}`}
            className="flex size-10 items-center justify-center text-xs text-ash-ink"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onSelect(page)}
            aria-current={page === current ? "page" : undefined}
            aria-label={`Page ${String(page).padStart(2, "0")}`}
            className={`flex size-10 items-center justify-center border text-[11px] font-bold transition-colors ${
              page === current
                ? "border-noir bg-noir text-volt"
                : "border-noir/20 text-noir hover:border-noir"
            }`}
          >
            {String(page).padStart(2, "0")}
          </button>
        ),
      )}
    </>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-3 text-ash-ink">
      <span className="h-px w-8 bg-current" aria-hidden="true" />
      {children}
    </p>
  )
}

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [catalogStatus, setCatalogStatus] = useState<
    "loading" | "ready" | "error"
  >("loading")
  const [catalogError, setCatalogError] = useState("")
  const [catalogAttempt, setCatalogAttempt] = useState(0)

  const [categories, setCategories] = useState<Category[]>([])
  const [categoryStatus, setCategoryStatus] = useState<
    "loading" | "ready" | "error"
  >("loading")
  const [categoryError, setCategoryError] = useState("")
  const [categoryAttempt, setCategoryAttempt] = useState(0)

  const [searchParams, setSearchParams] = useSearchParams()
  const search = (searchParams.get("q") ?? "").trim()
  const selectedCategory = searchParams.get("category") ?? "all"
  const sort = parseSort(searchParams.get("sort"))

  useEffect(() => {
    const controller = new AbortController()
    setCatalogStatus("loading")
    setCatalogError("")

    fetchCatalog(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setProducts(data)
        setCatalogStatus("ready")
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return
        setCatalogStatus("error")
        setCatalogError(
          error instanceof Error
            ? error.message
            : "The collection could not be loaded.",
        )
      })

    return () => controller.abort()
  }, [catalogAttempt])

  useEffect(() => {
    const controller = new AbortController()
    setCategoryStatus("loading")
    setCategoryError("")

    fetchCategories(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setCategories(data)
        setCategoryStatus("ready")
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return
        setCategoryStatus("error")
        setCategoryError(
          error instanceof Error
            ? error.message
            : "The departments could not be loaded.",
        )
      })

    return () => controller.abort()
  }, [categoryAttempt])

  const productCategories = useMemo(() => {
    const map = new Map<string, Category>()
    for (const product of products) {
      if (product.category && !map.has(product.category.slug)) {
        map.set(product.category.slug, product.category)
      }
    }
    return [...map.values()]
  }, [products])

  // The first two source departments are intentionally omitted from this index.

  const displayedCategories = useMemo(() => {
    // Collect categories that actually have products.
    const productSlugs = new Set(
      products
        .map((product) => product.category?.slug)
        .filter((slug): slug is string => Boolean(slug)),
    )

    // Keep only categories that contain products.
    const validCategories = categories.filter((category) =>
      productSlugs.has(category.slug),
    )

    // If the API categories are unavailable or don't match,
    // derive the categories from the products themselves.
    return validCategories.length > 0 ? validCategories : productCategories
  }, [categories, products, productCategories])

  const departmentCategories = displayedCategories

  const heroProduct = useMemo(() => {
    return (
      products.find((product) => product.id === 31) ??
      products.find((product) => product.images.length > 0) ??
      null
    )
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase()

    const result = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category?.slug === selectedCategory
      const matchesSearch =
        query.length === 0 || product.title.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })

    if (sort === "curated") return result

    return [...result].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price
      if (sort === "price-desc") return b.price - a.price
      return a.title.localeCompare(b.title, "en", { sensitivity: "base" })
    })
  }, [products, search, selectedCategory, sort])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10)
  const currentPage = Math.min(
    totalPages,
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  )
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageProducts = filteredProducts.slice(pageStart, pageStart + PAGE_SIZE)
  const rangeStart = filteredProducts.length === 0 ? 0 : pageStart + 1
  const rangeEnd = Math.min(pageStart + PAGE_SIZE, filteredProducts.length)
  const pageKey = `${search}|${selectedCategory}|${sort}|${currentPage}`

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const product of products) {
      const slug = product.category?.slug
      if (!slug) continue
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
    return counts
  }, [products])

  const activeCategoryName =
    displayedCategories.find((category) => category.slug === selectedCategory)
      ?.name ?? ""

  const updateFilter = (key: "q" | "category" | "sort", value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || (key === "sort" && value === "curated")) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    next.delete("page")
    setSearchParams(next, { replace: true })
  }

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    if (page <= 1) {
      next.delete("page")
    } else {
      next.set("page", String(page))
    }
    setSearchParams(next)
    scrollToCollection()
  }

  const selectCategory = (slug: string) => {
    updateFilter("category", slug === "all" ? "" : slug)
    scrollToCollection()
  }

  const resetFilters = () => {
    const next = new URLSearchParams()
    next.delete("q")
    next.delete("category")
    next.delete("sort")
    next.delete("page")
    setSearchParams(next, { replace: true })
    scrollToCollection()
  }

  const hasFilters =
    search.length > 0 || selectedCategory !== "all" || sort !== "curated"

  return (
    <>
      <section className="grain relative overflow-hidden bg-noir text-fog">
        <div
          className="pointer-events-none absolute -left-40 top-20 size-[38rem] rounded-full bg-ultra/15 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/15 to-transparent"
          aria-hidden="true"
        />

        <div className="container-mn relative grid items-end gap-14 pb-16 pt-12 lg:min-h-[calc(100svh-116px)] lg:grid-cols-12 lg:gap-8 lg:pb-20 lg:pt-16">
          <div className="flex min-w-0 flex-col justify-between lg:col-span-8 lg:min-h-[620px]">
            <div className="rise flex flex-wrap items-center gap-x-8 gap-y-3 text-[9px] font-semibold tracking-[0.2em] text-ash uppercase">
              <span className="text-volt">Issue 01 / MMXXVI</span>
              <span>Cinematic objects</span>
              <span className="hidden sm:inline">Edited from EscuelaJS</span>
            </div>

            <div className="mt-14 lg:mt-10">
              <h1
                className="display-tight font-sans font-extrabold uppercase"
                aria-label="Objects from another perspective."
              >
                <span className="cinema-title-line cinema-title-line--1 block text-[clamp(2.8rem,10vw,9rem)] text-fog lg:text-[clamp(5.5rem,8.6vw,9rem)]">
                  Objects
                </span>
                <span className="cinema-title-line cinema-title-line--2 block font-display text-[clamp(3.1rem,8.3vw,7.4rem)] font-normal italic normal-case text-ultra">
                  from another
                </span>
                <span className="cinema-title-line cinema-title-line--3 outline-type block text-[clamp(2.8rem,10vw,9rem)] lg:text-[clamp(5.5rem,8.6vw,9rem)]">
                  perspective.
                </span>
              </h1>

              <div className="cinema-copy mt-10 grid max-w-2xl gap-7 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="max-w-sm text-sm leading-relaxed text-fog/70 sm:text-base">
                    Discover the extraordinary in the everyday. A curated
                    collection of objects, staged for a different kind of
                    attention.
                  </p>
                  <div className="cinema-actions mt-7 flex flex-wrap items-center gap-4">
                    <Link
                      to="/#collection"
                      className="group inline-flex items-center gap-4 bg-volt px-6 py-4 text-[10px] font-extrabold tracking-[0.18em] text-noir uppercase transition-colors hover:bg-fog"
                    >
                      Explore the collection
                      <ArrowRight
                        size={16}
                        strokeWidth={1.8}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                    <Link
                      to="/#categories"
                      className="link-underline inline-flex items-center gap-2 px-1 py-2 text-[10px] font-bold tracking-[0.16em] text-fog/70 uppercase transition-colors hover:text-volt"
                    >
                      Browse departments
                      <ArrowDown size={13} strokeWidth={1.6} />
                    </Link>
                  </div>
                </div>

                <div className="hidden border-l border-white/15 pl-6 text-[9px] leading-relaxed tracking-[0.18em] text-ash uppercase sm:block">
                  Curated
                  <br />
                  with intent
                  <br />
                  <span className="text-volt">
                    No. 001—
                    {catalogStatus === "ready"
                      ? String(products.length).padStart(3, "0")
                      : "···"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rise-late mt-14 flex items-center gap-4 text-[9px] tracking-[0.2em] text-ash uppercase lg:mt-0">
              <span className="relative flex h-10 w-5 items-start justify-center">
                <span className="absolute top-0 h-10 w-px bg-gradient-to-b from-volt to-transparent" />
              </span>
              Scroll to enter the collection
            </div>
          </div>

          <div className="rise-late relative lg:col-span-4">
            <div className="mb-4 flex items-center justify-between text-[9px] tracking-[0.18em] text-ash uppercase">
              <span>Campaign / 01</span>
              <span className="hidden sm:inline">Object study</span>
            </div>
            <HeroVisual
              key={heroProduct?.id ?? "loading"}
              product={heroProduct}
              loading={catalogStatus === "loading"}
            />
            <p className="mt-4 text-[9px] leading-relaxed tracking-[0.14em] text-ash uppercase">
              Product photography via the EscuelaJS catalogue.
            </p>
          </div>
        </div>
      </section>

      <section
        id="categories"
        className="scroll-mt-24 border-t border-veil/60 bg-fog py-20 sm:py-24 lg:py-32"
      >
        <div className="container-mn">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-4">
              <SectionLabel>01 / The index</SectionLabel>
              <p className="mt-8 max-w-xs text-sm leading-relaxed text-cinema/65">
                Two departments. One point of view. Choose a territory and see
                the collection rearrange itself.
              </p>
            </div>
            <div className="lg:col-span-8">
              <h2 className="display-tight font-display text-[clamp(3.5rem,8vw,8rem)] italic leading-[0.86] text-noir">
                Shop by
                <br />
                <span className="font-sans text-[0.72em] font-extrabold not-italic tracking-[-0.05em] uppercase">
                  atmosphere.
                </span>
              </h2>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-b border-veil pb-4">
            <p className="eyebrow text-ash-ink">
              {departmentCategories.length} departments
            </p>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => selectCategory("all")}
                className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] uppercase text-noir transition-colors hover:text-cinema"
              >
                Clear department
                <X size={13} strokeWidth={1.8} />
              </button>
            )}
          </div>

          {categoryStatus === "error" && (
            <div className="mt-6 flex flex-col gap-3 border border-ultra/30 bg-ultra/5 px-5 py-4 text-sm text-cinema/70 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p>
                  The department index could not be refreshed
                  {displayedCategories.length > 0
                    ? ". Showing departments found in the collection."
                    : " and no departments are available."}
                </p>
                {categoryError && (
                  <p className="mt-1 text-[11px] text-ash-ink">
                    {categoryError}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCategoryAttempt((attempt) => attempt + 1)}
                className="flex shrink-0 items-center gap-2 text-[10px] font-bold tracking-[0.14em] uppercase text-noir underline decoration-1 underline-offset-4"
              >
                <RefreshCw size={12} strokeWidth={1.8} />
                Retry
              </button>
            </div>
          )}

          {categoryStatus === "loading" && displayedCategories.length === 0 ? (
            <div
              className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-12"
              aria-hidden="true"
            >
              {["lg:col-span-7", "lg:col-span-5"].map((span) => (
                <div
                  key={span}
                  className={`skeleton-light aspect-[16/10] bg-mist md:col-span-1 ${span}`}
                />
              ))}
            </div>
          ) : departmentCategories.length === 0 ? (
            <div className="mt-6 border border-veil bg-mist/40 px-6 py-12 text-center">
              <p className="font-display text-2xl italic text-noir">
                No departments available
              </p>
              <p className="mt-2 text-sm text-cinema/75">
                The collection can still be explored below.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
              {departmentCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  active={selectedCategory === category.slug}
                  onSelect={() => selectCategory(category.slug)}
                />
              ))}
            </div>
          )}

          <p className="mt-6 text-[10px] tracking-[0.14em] text-ash-ink uppercase">
            Selecting a department filters the collection below · Use “All
            objects” in the toolbar to reset
          </p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-cinema py-16 text-fog sm:py-20">
        <div className="container-mn grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <p className="eyebrow text-volt">Curatorial note / 01</p>
          </div>
          <div className="lg:col-span-7">
            <p className="text-balance font-display text-[clamp(2rem,4.2vw,4.2rem)] italic leading-[1.02]">
              “The everyday object, held at a different angle, becomes a small
              event.”
            </p>
          </div>
          <div className="lg:col-span-3 lg:pt-2">
            <p className="text-sm leading-relaxed text-ash">
              Every object in this edit is drawn live from the EscuelaJS
              catalogue. Nothing is invented; the perspective is ours.
            </p>
            <p className="mt-5 text-[9px] tracking-[0.18em] text-fog/60 uppercase">
              Staging / MAISON NOIR
            </p>
          </div>
        </div>
      </section>

      <section
        id="collection"
        className="scroll-mt-20 bg-fog py-20 sm:py-24 lg:py-28"
        aria-busy={catalogStatus === "loading"}
      >
        <div className="container-mn">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionLabel>02 / The collection</SectionLabel>
              <h2 className="display-tight mt-7 font-sans text-[clamp(4rem,10vw,10rem)] font-extrabold uppercase text-noir">
                The edit
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-3">
              <p className="max-w-md text-sm leading-relaxed text-cinema/65">
                Browse every curated object. Search, sort and filter across the
                complete catalogue — eight objects at a time.
              </p>
            </div>
          </div>

          <div className="mt-12 border-y border-veil py-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-xl">
                <label htmlFor="collection-search" className="sr-only">
                  Search products by title
                </label>
                <Search
                  size={17}
                  strokeWidth={1.6}
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ash-ink"
                  aria-hidden="true"
                />
                <input
                  id="collection-search"
                  type="search"
                  value={search}
                  onChange={(event) => updateFilter("q", event.target.value)}
                  placeholder="Search object titles"
                  autoComplete="off"
                  className="h-11 w-full border-b border-transparent bg-transparent pl-7 pr-10 text-sm text-noir outline-none transition-colors placeholder:text-ash-ink focus:border-noir"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => updateFilter("q", "")}
                    className="absolute right-0 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-ash-ink transition-colors hover:text-noir"
                    aria-label="Clear search"
                  >
                    <X size={15} strokeWidth={1.6} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div className="relative flex items-center gap-2">
                  <label
                    htmlFor="sort-products"
                    className="eyebrow shrink-0 text-ash-ink"
                  >
                    Sort
                  </label>
                  <select
                    id="sort-products"
                    value={sort}
                    onChange={(event) =>
                      updateFilter("sort", event.target.value)
                    }
                    className="h-11 appearance-none border-b border-noir/20 bg-transparent pl-1 pr-7 text-[11px] font-bold tracking-[0.08em] uppercase text-noir outline-none transition-colors hover:border-noir focus:border-noir"
                  >
                    <option value="curated">Curated order</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                  <ChevronDown
                    size={14}
                    strokeWidth={1.6}
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-noir"
                    aria-hidden="true"
                  />
                </div>

                <span
                  className="hidden text-[10px] font-semibold tracking-[0.14em] text-ash-ink uppercase sm:inline"
                  aria-live="polite"
                >
                  {catalogStatus === "ready"
                    ? `${filteredProducts.length} ${
                        filteredProducts.length === 1 ? "object" : "objects"
                      }`
                    : "Loading"}
                </span>
              </div>
            </div>

            <div className="hide-scrollbar mt-5 flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => selectCategory("all")}
                aria-pressed={selectedCategory === "all"}
                className={`shrink-0 border px-3.5 py-2 text-[9px] font-bold tracking-[0.14em] uppercase transition-colors ${
                  selectedCategory === "all"
                    ? "border-noir bg-noir text-volt"
                    : "border-noir/20 text-cinema/70 hover:border-noir hover:text-noir"
                }`}
              >
                All objects
                <span className="ml-2">{products.length}</span>
              </button>
              {displayedCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.slug)}
                  aria-pressed={selectedCategory === category.slug}
                  className={`shrink-0 border px-3.5 py-2 text-[9px] font-bold tracking-[0.14em] uppercase transition-colors ${
                    selectedCategory === category.slug
                      ? "border-noir bg-noir text-volt"
                      : "border-noir/20 text-cinema/70 hover:border-noir hover:text-noir"
                  }`}
                >
                  {category.name}
                  <span className="ml-2">
                    {categoryCounts.get(category.slug) ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-ash-ink uppercase">
              {catalogStatus === "ready" && filteredProducts.length > 0
                ? `Showing ${rangeStart}–${rangeEnd} of ${filteredProducts.length}`
                : catalogStatus === "ready"
                  ? "No objects in this frame"
                  : "Preparing the collection"}
              {(search || activeCategoryName) && (
                <span className="text-cinema/75">
                  {search && ` · “${search}”`}
                  {activeCategoryName && ` · ${activeCategoryName}`}
                </span>
              )}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] font-bold tracking-[0.14em] text-cinema/75 uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-noir"
              >
                Reset all filters
              </button>
            )}
          </div>

          <div className="mt-10">
            {catalogStatus === "loading" ? (
              <ProductSkeleton count={8} />
            ) : catalogStatus === "error" ? (
              <ErrorPanel
                title="The collection is out of view"
                message={catalogError}
                onRetry={() => setCatalogAttempt((attempt) => attempt + 1)}
              />
            ) : pageProducts.length === 0 ? (
              <div className="border border-veil bg-mist/35 px-6 py-20 text-center sm:py-28">
                <span className="mx-auto flex size-16 items-center justify-center border border-noir/15 text-ash-ink">
                  {search ? (
                    <Search size={24} strokeWidth={1.1} aria-hidden="true" />
                  ) : (
                    <ImageOff size={24} strokeWidth={1.1} aria-hidden="true" />
                  )}
                </span>
                <h3 className="mt-6 font-display text-3xl italic text-noir sm:text-4xl">
                  {search
                    ? "No object answers to that name"
                    : selectedCategory !== "all"
                      ? "This department is empty"
                      : "The catalogue is empty"}
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cinema/75">
                  {search
                    ? `Nothing in the curated collection matches “${search}”. Try a broader title or explore another department.`
                    : "Try removing a filter to see the full collection again."}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-7 inline-flex items-center gap-3 bg-noir px-5 py-3.5 text-[10px] font-bold tracking-[0.16em] text-volt uppercase transition-colors hover:bg-cinema"
                >
                  View the full collection
                  <ArrowRight size={14} strokeWidth={1.8} />
                </button>
              </div>
            ) : (
              <div key={pageKey} className="fade-in">
                <div
                  id="product-grid"
                  className="grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-4"
                >
                  {pageProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={pageStart + index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {catalogStatus === "ready" && filteredProducts.length > 0 && (
            <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-veil pt-6 sm:flex-row">
              <p
                className="text-[10px] font-semibold tracking-[0.16em] text-ash-ink uppercase"
                aria-live="polite"
              >
                Page {String(currentPage).padStart(2, "0")} /{" "}
                {String(totalPages).padStart(2, "0")}
              </p>
              <nav
                className="flex items-center gap-2"
                aria-label="Collection pagination"
              >
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex h-10 items-center gap-2 border border-noir/20 px-3 text-[9px] font-bold tracking-[0.12em] uppercase text-noir transition-colors hover:border-noir disabled:cursor-not-allowed disabled:border-noir/10 disabled:text-noir/25"
                >
                  <ArrowRight
                    size={13}
                    strokeWidth={1.6}
                    className="rotate-180"
                  />
                  Prev
                </button>

                <PageNumbers
                  current={currentPage}
                  total={totalPages}
                  onSelect={goToPage}
                />

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex h-10 items-center gap-2 border border-noir/20 px-3 text-[9px] font-bold tracking-[0.12em] uppercase text-noir transition-colors hover:border-noir disabled:cursor-not-allowed disabled:border-noir/10 disabled:text-noir/25"
                >
                  Next
                  <ArrowRight size={13} strokeWidth={1.6} />
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
