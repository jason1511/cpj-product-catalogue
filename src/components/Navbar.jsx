import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-red-500"
      : "text-slate-700 hover:text-red-600";

  const mobileNavLinkClass = ({ isActive }) =>
    isActive
      ? "rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-600"
      : "rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600";

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <NavLink
            to="/"
            onClick={closeMenu}
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.7),transparent_45%)]" />
              <span className="relative">CPJ</span>
            </div>

            <div>
              <p className="text-sm font-black leading-tight text-slate-950">
                CV Chandra Putra Jaya
              </p>
              <p className="text-xs font-medium text-slate-500">
                Showroom Sepeda & Motor Listrik
              </p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-7 text-sm font-bold md:flex">
            <NavLink to="/" className={navLinkClass}>
              Beranda
            </NavLink>

            <NavLink to="/catalogue" className={navLinkClass}>
              Katalog
            </NavLink>

            <NavLink to="/about" className={navLinkClass}>
              Tentang Kami
            </NavLink>

            <NavLink to="/contact" className={navLinkClass}>
              Kontak
            </NavLink>
          </div>

          <div className="hidden md:flex">
            <NavLink
              to="/contact"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              Hubungi Kami
            </NavLink>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-red-300 hover:text-red-600 md:hidden"
            aria-label="Buka menu navigasi"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? "Tutup" : "Menu"}
          </button>
        </div>

        <AnimatePresence>
  {isMenuOpen && (
    <motion.div
      className="border-t border-slate-100 py-4 md:hidden"
      initial={{ opacity: 0, height: 0, y: -8 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -8 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="flex flex-col gap-2 overflow-hidden text-sm">
        <NavLink to="/" onClick={closeMenu} className={mobileNavLinkClass}>
          Beranda
        </NavLink>

        <NavLink
          to="/catalogue"
          onClick={closeMenu}
          className={mobileNavLinkClass}
        >
          Katalog
        </NavLink>

        <NavLink
          to="/about"
          onClick={closeMenu}
          className={mobileNavLinkClass}
        >
          Tentang Kami
        </NavLink>

        <NavLink
          to="/contact"
          onClick={closeMenu}
          className={mobileNavLinkClass}
        >
          Kontak
        </NavLink>

        <NavLink
          to="/contact"
          onClick={closeMenu}
          className="mt-2 rounded-xl bg-red-600 px-4 py-3 text-center font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700"
        >
          Hubungi Kami
        </NavLink>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      </nav>
    </header>
  );
}

export default Navbar;