import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig";

function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-red-600 text-sm font-black text-white shadow-lg shadow-red-600/25">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_45%)]" />
                <span className="relative">CPJ</span>
              </div>

              <div>
                <p className="font-black">{siteConfig.companyName}</p>
                <p className="text-sm text-slate-400">
                  Showroom Sepeda & Motor Listrik
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Katalog showroom digital untuk melihat pilihan sepeda listrik dan
              motor listrik dari berbagai merek. Hubungi tim kami untuk
              informasi stok, warna, dan harga terbaru.
            </p>
          </div>

          <div>
            <p className="font-bold text-white">Navigasi</p>

            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              <Link to="/" className="hover:text-red-300">
                Beranda
              </Link>
              <Link to="/catalogue" className="hover:text-red-300">
                Katalog
              </Link>
              <Link to="/about" className="hover:text-red-300">
                Tentang Kami
              </Link>
              <Link to="/contact" className="hover:text-red-300">
                Kontak
              </Link>
            </div>
          </div>

          <div>
            <p className="font-bold text-white">Kontak</p>

            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>WhatsApp: {siteConfig.whatsappNumber}</p>
              <p>{siteConfig.address}</p>
              <p>{siteConfig.operationalHours}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-sm text-slate-500">
            © 2026 CV Chandra Putra Jaya. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;