import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react'
import { useCart } from '../store'
import { useDialogA11y } from '../hooks'

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/#collection' },
  { label: 'Categories', to: '/#categories' },
]

const suggestions = ['Armchair', 'Sneaker', 'Headphone', 'Table', 'Controller']

function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  useDialogA11y(open, onClose, panelRef)

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  if (!open) return null

  const submitSearch = (value: string) => {
    const term = value.trim()
    navigate({
      pathname: '/',
      search: term ? `?q=${encodeURIComponent(term)}` : '',
      hash: '#collection',
    })
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitSearch(query)
  }

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-noir text-fog"
      role="dialog"
      aria-modal="true"
      aria-label="Search the collection"
    >
      <div
        ref={panelRef}
        className="grain flex min-h-dvh flex-col"
        tabIndex={-1}
      >
        <div className="container-mn flex h-24 items-center justify-between border-b border-white/10">
          <span className="eyebrow-wide text-ash">Search the collection</span>
          <button
            type="button"
            onClick={onClose}
            className="group flex items-center gap-3 text-xs font-bold tracking-[0.18em] uppercase"
            aria-label="Close search"
          >
            <span className="hidden sm:inline">Close</span>
            <span className="flex size-10 items-center justify-center border border-white/20 transition-colors group-hover:border-volt group-hover:text-volt">
              <X size={18} strokeWidth={1.5} />
            </span>
          </button>
        </div>

        <div className="container-mn flex flex-1 flex-col justify-center py-16 lg:py-24">
          <p className="eyebrow mb-8 text-volt" id="search-title">
            Find an object
          </p>
          <form onSubmit={handleSubmit} className="max-w-5xl">
            <label htmlFor="site-search" className="sr-only">
              Search products by title
            </label>
            <div className="flex items-center gap-4 border-b border-ash/40 pb-5 focus-within:border-volt">
              <Search
                className="hidden shrink-0 text-ash sm:block"
                size={34}
                strokeWidth={1.2}
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                data-autofocus
                id="site-search"
                name="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What are you looking for?"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent font-display text-[clamp(2.2rem,6vw,5.5rem)] leading-none text-fog outline-none placeholder:text-ash/40"
              />
              <button
                type="submit"
                className="group flex size-14 shrink-0 items-center justify-center bg-volt text-noir transition-transform hover:rotate-[-8deg] sm:size-16"
                aria-label="Search"
              >
                <ArrowRight
                  size={28}
                  strokeWidth={1.3}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </form>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="eyebrow text-ash">Try</span>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setQuery(suggestion)
                  inputRef.current?.focus()
                }}
                className="font-display text-xl italic text-fog/70 transition-colors hover:text-volt"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <p className="mt-16 max-w-md text-sm leading-relaxed text-ash">
            Search is applied to the complete curated catalogue, across every
            page — not only the objects currently in view.
          </p>
        </div>
      </div>
    </div>
  )
}

function MobileMenu({
  open,
  onClose,
  onOpenSearch,
}: {
  open: boolean
  onClose: () => void
  onOpenSearch: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)

  useDialogA11y(open, onClose, panelRef)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => linkRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-noir/70"
        onClick={onClose}
        aria-label="Close menu"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className="grain relative flex h-full w-[min(92vw,460px)] flex-col overflow-y-auto bg-cinema px-6 pb-10 pt-6 text-fog shadow-2xl"
        tabIndex={-1}
      >
        <div className="mb-16 flex items-center justify-between">
          <span className="eyebrow-wide text-ash">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 items-center justify-center border border-white/20 text-fog"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="flex flex-col">
          {navigation.map((item, index) => (
            <Link
              key={item.label}
              ref={index === 0 ? linkRef : undefined}
              to={item.to}
              onClick={onClose}
              className="group flex items-baseline justify-between border-b border-white/10 py-5 font-display text-[2.6rem] leading-none text-fog transition-colors hover:text-volt"
            >
              {item.label}
              <span className="font-sans text-[10px] tracking-[0.2em] text-ash">
                0{index + 1}
              </span>
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            onClose()
            onOpenSearch()
          }}
          className="mt-10 flex items-center justify-between border border-white/20 px-5 py-4 text-left text-xs font-bold tracking-[0.18em] uppercase transition-colors hover:border-volt hover:text-volt"
        >
          Search the collection
          <Search size={18} strokeWidth={1.5} />
        </button>

        <div className="mt-auto pt-16">
          <p className="font-display text-2xl italic text-fog/70">
            Objects from another perspective.
          </p>
          <p className="mt-4 text-[11px] leading-relaxed tracking-wide text-ash">
            A demonstration boutique. No real payment is ever processed.
          </p>
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const { count, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  const isHome = location.pathname === '/'

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-volt focus:px-4 focus:py-3 focus:text-xs focus:font-bold focus:tracking-widest focus:text-noir focus:uppercase"
      >
        Skip to content
      </a>

      <div className="bg-cinema text-fog" role="region" aria-label="Store announcement">
        <div className="container-mn flex h-9 items-center justify-between gap-4 text-[9px] font-semibold tracking-[0.18em] uppercase sm:text-[10px]">
          <p className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-volt" aria-hidden="true" />
            Where Luxury Is Born

          </p>
          <p className="hidden text-ash md:block">EscuelaJS catalogue / Issue 01</p>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-noir/95 text-fog backdrop-blur-md">
        <div className="container-mn flex h-20 items-center justify-between gap-6">
          <Link
            to="/"
            className="group flex shrink-0 items-baseline gap-2"
          >
            <span className="text-sm font-extrabold tracking-[0.24em] sm:text-base">
              MAISON
            </span>
            <span className="font-display text-xl italic leading-none text-volt transition-transform duration-500 group-hover:translate-x-0.5 sm:text-2xl">
              Noir
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => {
              const isActive =
                item.label === 'Home' && isHome && !location.hash
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`link-underline text-[11px] font-bold tracking-[0.18em] uppercase transition-colors hover:text-volt ${
                    isActive ? 'text-volt' : 'text-fog/80'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex size-10 items-center justify-center text-fog transition-colors hover:text-volt"
              aria-label="Search products"
            >
              <Search size={19} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={openCart}
              className="group relative flex h-10 items-center gap-2 px-2 text-fog transition-colors hover:text-volt sm:px-3"
            >
              <span className="sr-only">Open shopping bag,</span>
              <ShoppingBag size={19} strokeWidth={1.6} />
              <span className="hidden text-[10px] font-bold tracking-[0.16em] uppercase sm:inline">
                Bag
              </span>
              <span
                className={`flex min-w-5 items-center justify-center rounded-full px-1 py-0.5 text-[9px] font-extrabold leading-none ${
                  count > 0
                    ? 'bg-volt text-noir'
                    : 'bg-white/10 text-ash'
                }`}
              >
                {count}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex size-10 items-center justify-center text-fog transition-colors hover:text-volt lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
