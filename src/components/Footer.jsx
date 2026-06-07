import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig";

function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white p-1.5 shadow-lg">
  <img
    src="/logo_cpj.png"
    alt="Logo CV Chandra Putra Jaya"
    className="h-full w-full object-contain"
  />
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