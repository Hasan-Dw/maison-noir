import { useEffect } from "react"
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom"
import { ArrowRight, Check, X } from "lucide-react"
import { CartDrawer } from "./components/CartDrawer"
import { Navbar } from "./components/Navbar"
import { useCart } from "./store"
import { HomePage } from "./pages/HomePage"
import { ProductPage } from "./pages/ProductPage"

const footerDepartments = [
  { label: "Electronics", slug: "electronics" },
  { label: "Furniture", slug: "furniture" },
  { label: "Shoes", slug: "shoes" },
  { label: "Miscellaneous", slug: "miscellaneous" },
]

function ScrollToLocation() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
      const timer = window.setTimeout(() => {
        const target = document.getElementById(
          decodeURIComponent(hash.slice(1)),
        )
        target?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        })
      }, 80)
      return () => window.clearTimeout(timer)
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname, hash])

  return null
}

function Toast() {
  const { notice, dismissNotice, openCart, isOpen } = useCart()

  if (!notice || isOpen) return null

  return (
    <div
      className="fade-in fixed bottom-5 left-4 right-4 z-[75] flex items-start gap-4 border border-white/15 bg-noir p-4 text-fog shadow-2xl sm:left-auto sm:right-6 sm:max-w-sm"
      role="status"
      aria-live="polite"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-volt text-noir">
        <Check size={15} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold tracking-[0.16em] text-volt uppercase">
          Added to bag
        </p>
        <p className="mt-1 line-clamp-2 font-display text-base leading-tight">
          {notice.title}
        </p>
        <button
          type="button"
          onClick={() => {
            dismissNotice()
            openCart()
          }}
          className="mt-2 inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.14em] text-ash uppercase transition-colors hover:text-volt"
        >
          View bag
          <ArrowRight size={11} strokeWidth={1.8} />
        </button>
      </div>
      <button
        type="button"
        onClick={dismissNotice}
        className="shrink-0 p-1 text-ash transition-colors hover:text-volt"
        aria-label="Dismiss notification"
      >
        <X size={14} strokeWidth={1.6} />
      </button>
    </div>
  )
}

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="grain relative overflow-hidden bg-noir text-fog">
      <div className="container-mn relative py-16 sm:py-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-volt">Maison Noir / Issue 01</p>
            <p className="mt-5 max-w-md font-display text-[clamp(2rem,3.4vw,3.3rem)] italic leading-[1.05]">
              Where Luxury Meets Everyday Living.
            </p>
            <p className="mt-6 max-w-sm text-[11px] leading-relaxed text-ash">
              Real products are drawn from the public EscuelaJS catalogue.
              Search, filters, bag and checkout are functional, but no payment
              is requested or processed. Everything you save remains in this
              browser.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:pl-10">
            <div>
              <p className="eyebrow text-ash">Navigate</p>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <Link
                    to="/"
                    className="link-underline text-fog/80 hover:text-volt"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#collection"
                    className="link-underline text-fog/80 hover:text-volt"
                  >
                    Collection
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#categories"
                    className="link-underline text-fog/80 hover:text-volt"
                  >
                    Departments
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow text-ash">Departments</p>
              <ul className="mt-5 space-y-3 text-sm">
                {footerDepartments.map((department) => (
                  <li key={department.slug}>
                    <Link
                      to={`/?category=${department.slug}#collection`}
                      className="link-underline text-fog/80 hover:text-volt"
                    >
                      {department.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow text-ash">The study</p>
              <ul className="mt-5 space-y-3 text-sm text-ash">
                <li>checkout</li>
                <li>local orders</li>
                <li>No payment</li>
                <li>
                  <a
                    href="https://api.escuelajs.co/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline text-fog/80 hover:text-volt"
                  >
                    EscuelaJS API
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-7 text-[9px] font-semibold tracking-[0.16em] text-ash uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Maison Noir.Store</p>
          <p>Created by Hasan_Dw</p>
        </div>

        <Link
          to="/"
          className="outline-type mt-12 block whitespace-nowrap font-sans text-[clamp(2.6rem,12.5vw,14rem)] font-extrabold leading-[0.72] tracking-[-0.07em] uppercase"
        >
          Maison Noir
        </Link>
      </div>
    </footer>
  )
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-fog">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  )
}

function NotFoundPage() {
  return (
    <section className="container-mn flex min-h-[68vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-[clamp(5rem,14vw,12rem)] italic leading-none text-cinema/55">
        404
      </p>
      <p className="eyebrow mt-4 text-ash-ink">Out of frame</p>
      <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.8rem,7vw,6rem)] italic leading-none text-noir">
        This page does not exist.
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-cinema/75">
        The address may have changed, or the scene may never have been here at
        all.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-3 bg-noir px-5 py-3.5 text-[10px] font-bold tracking-[0.16em] text-volt uppercase transition-colors hover:bg-cinema"
      >
        Return home
        <ArrowRight size={14} strokeWidth={1.8} />
      </Link>
    </section>
  )
}

function ProductRoute() {
  const { id } = useParams()
  return <ProductPage key={id ?? "missing"} />
}

export default function App() {
  return (
    <>
      <ScrollToLocation />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products/:id" element={<ProductRoute />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
