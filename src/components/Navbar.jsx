import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const publicLinks = [
  ["/", "Beranda"],
  ["/catalogue", "Katalog"],
  ["/about", "Tentang Kami"],
  ["/contact", "Kontak"],
];

const staffLinks = [
  ["/admin/products", "Kelola Produk"],
  ["/admin/invoices", "Invoice"],
];

const adminLinks = [
  ["/admin/users", "User Admin"],
  ["/admin/logs", "Audit Log"],
  ["/admin/images", "Cleanup Gambar"],
];

function linkClass({ isActive }) {
  const base = "block whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors";
  return base + (isActive
    ? " bg-red-50 text-red-700"
    : " text-slate-700 hover:bg-slate-100 hover:text-slate-950");
}

function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  function closeMenu() {
    setIsMenuOpen(false);
  }

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-red-500"
      : "text-slate-700 hover:text-red-600";

  const mobileNavLinkClass = ({ isActive }) =>
    isActive
      ? "rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-600"
      : "rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <nav aria-label="Navigasi utama" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <NavLink
            to="/"
            onClick={closeMenu}
            className="group flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg">
              <img
                src="/logo_cpj.png"
                alt="Logo CV Chandra Putra Jaya"
                className="h-full w-full object-contain"
              />
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

          <div className="hidden items-center gap-6 text-sm font-bold md:flex">
            {publicLinks.map(([to, label]) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
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
            aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
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
                {publicLinks.map(([to, label]) => (
                  <NavLink key={to} to={to} className={mobileNavLinkClass} onClick={closeMenu}>
                    {label}
                  </NavLink>
                ))}

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

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [adminUser, setAdminUser] = useState(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminUser() {
      try {
        const response = await fetch("/api/admin/me");

        if (!response.ok) {
          if (isMounted) {
            setAdminUser(null);
          }

          return;
        }

        const data = await response.json();

        if (data.ok && isMounted) {
          setAdminUser(data.user);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setAdminUser(null);
        }
      }
    }

    loadAdminUser();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    function dismissOutside(event) {
      if (!menuRef.current?.contains(event.target)) closeMenu();
    }

    function handleEscape(event) {
      if (event.key === "Escape" && menuRef.current?.open) {
        closeMenu();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      console.error(error);
    } finally {
      setAdminUser(null);
      closeMenu();
      navigate("/admin/login");
    }
  }

  function renderLinks(links) {
    return links.map(([to, label]) => (
      <NavLink key={to} to={to} className={linkClass} onClick={closeMenu}>
        {label}
      </NavLink>
    ));
  }

  if (!adminUser) return <PublicNavbar />;

  const isAdmin = adminUser.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav aria-label="Navigasi utama" className="relative mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:min-h-[72px] lg:px-8">
        <NavLink to="/" onClick={closeMenu} className="flex min-w-0 items-center gap-2.5">
          <img src="/logo_cpj.png" alt="" className="size-10 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950">CV Chandra Putra Jaya</p>
            <p className="hidden whitespace-nowrap text-xs text-slate-500 sm:block">Showroom Sepeda &amp; Motor Listrik</p>
          </div>
        </NavLink>

        <div className="hidden items-center gap-1 lg:flex">{renderLinks(publicLinks)}</div>


        <details ref={menuRef} className="group shrink-0">
          <summary ref={triggerRef} className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100 group-open:border-slate-400 [&::-webkit-details-marker]:hidden">
            <span className="lg:hidden">Menu</span>
            <span className="hidden lg:inline">{isAdmin ? "Panel Admin" : "Panel Staf"}</span>
            <span aria-hidden="true" className="mb-1 size-2 rotate-45 border-r-2 border-b-2 border-current group-open:mt-1 group-open:mb-0 group-open:rotate-[225deg]" />
          </summary>
          <div className="absolute inset-x-3 top-full mt-1 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-2 shadow-xl sm:right-6 sm:left-auto sm:w-72 lg:right-8">
            <div className="grid lg:hidden">
              {renderLinks(publicLinks)}
            </div>
            <div className="mt-2 border-y border-slate-200 px-3 py-3 lg:mt-0 lg:border-t-0">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-slate-950">{adminUser.username}</span>
                <span className="rounded bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">{isAdmin ? "ADMIN" : "STAFF"}</span>
              </div>
              <p className="mt-1 break-words text-xs text-slate-500">{isAdmin ? "Semua Lokasi" : adminUser.locationName || adminUser.locationCode || "Lokasi belum diset"}</p>
            </div>
            <div className="grid py-1">{renderLinks(staffLinks)}</div>
            {isAdmin && (
              <div className="grid border-t border-slate-200 py-1">{renderLinks(adminLinks)}</div>
            )}
            <div className="border-t border-slate-200 pt-1">
              <button type="button" onClick={handleLogout} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50">Logout</button>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}

export default Navbar;
