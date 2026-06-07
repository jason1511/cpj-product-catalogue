import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import SEO from "../components/SEO";
import { siteConfig } from "../data/siteConfig";
import {
  createGeneralProductMessage,
  createWhatsAppLink,
} from "../utils/whatsapp";

const contactCards = [
  {
    title: "Tanya Produk",
    description:
      "Tanyakan detail produk seperti stok, warna tersedia, harga terbaru, dan rekomendasi model sepeda listrik atau motor listrik.",
    action: "Chat WhatsApp",
    href: createWhatsAppLink(createGeneralProductMessage()),
  },
  {
    title: "Info Katalog",
    description:
      "Cek informasi katalog berdasarkan merek, model, jenis kendaraan, fitur utama, atau area ketersediaan.",
    action: "Tanya Katalog",
    href: createWhatsAppLink(
      "Halo CV Chandra Putra Jaya, saya ingin bertanya tentang katalog sepeda dan motor listrik.",
    ),
  },
  {
    title: "Kunjungan / Konsultasi",
    description:
      "Hubungi tim kami untuk bertanya lebih lanjut sebelum melihat, memilih, atau menanyakan produk tertentu.",
    action: "Hubungi Tim",
    href: createWhatsAppLink(
      "Halo CV Chandra Putra Jaya, saya ingin bertanya lebih lanjut tentang produk yang tersedia.",
    ),
  },
];

function ContactPage() {
  return (
    <main className="py-10">
      <SEO
        title="Kontak"
        canonicalPath="/contact"
        description="Hubungi CV Chandra Putra Jaya untuk informasi sepeda listrik dan motor listrik. Kantor pusat di Surabaya, melayani area Lumajang dan Lombok untuk cek stok, warna, harga, dan katalog produk."
      />

      <Container>
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl lg:p-10">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_38%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <SectionHeader
              eyebrow="Kontak"
              title="Tanyakan produk yang Anda minati"
              description="Hubungi tim CV Chandra Putra Jaya untuk menanyakan stok, warna tersedia, harga terbaru, atau rekomendasi produk dari katalog sepeda listrik dan motor listrik."
              className="[&_h1]:text-white [&_p:last-child]:text-slate-300"
            />

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-200">
                CPJ Showroom
              </p>

              <h2 className="mt-3 text-2xl font-black text-white">
                Informasi cepat melalui WhatsApp
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Sertakan nama merek atau model yang diminati agar tim kami dapat
                membantu pengecekan stok, warna, harga terbaru, dan informasi
                lokasi dengan lebih cepat.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {contactCards.map((card) => (
            <article
              key={card.title}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />

              <div className="relative">
                <h2 className="text-lg font-black text-slate-950">
                  {card.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>

                <a
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
                >
                  {card.action}
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-red-600/25 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-300">
                Informasi Kontak
              </p>

              <h2 className="mt-3 text-2xl font-black">
                Siap membantu kebutuhan kendaraan listrik Anda
              </h2>

              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-white">WhatsApp</p>
                  <p>{siteConfig.whatsappNumber}</p>
                </div>

                <div>
                  <p className="font-semibold text-white">Kantor Pusat</p>
                  <p>{siteConfig.address}</p>
                </div>

                <div>
                  <p className="font-semibold text-white">Jam Operasional</p>
                  <p>{siteConfig.operationalHours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                Format Pertanyaan
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950">
                Agar lebih cepat dibantu
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Saat menghubungi tim kami, sertakan nama produk atau merek yang
                diminati agar pengecekan stok, warna, harga terbaru, dan lokasi
                ketersediaan bisa dilakukan lebih cepat.
              </p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                <p className="font-semibold text-slate-950">
                  Contoh pertanyaan:
                </p>

                <ul className="mt-3 list-inside list-disc">
                  <li>Nama produk atau merek yang diminati</li>
                  <li>Warna yang ingin ditanyakan</li>
                  <li>Harga terbaru</li>
                  <li>Stok dan lokasi ketersediaan</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-slate-900/5 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Lokasi & Area Layanan
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Kantor pusat dan area layanan CV Chandra Putra Jaya
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              CV Chandra Putra Jaya berkantor pusat di Surabaya. Informasi pada
              katalog juga mencakup area layanan seperti Lumajang dan Lombok.
              Untuk ketersediaan produk dan informasi terbaru, hubungi tim
              terlebih dahulu.
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {siteConfig.branches.map((branch) => (
                <article
                  key={branch.area}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="text-xl font-black text-slate-950">
                    {branch.area}
                  </h3>

                  <div className="mt-5 space-y-4">
                    {branch.locations.map((location) => (
                      <div
                        key={`${branch.area}-${location.name}`}
                        className="rounded-2xl bg-white p-4 shadow-sm"
                      >
                        <p className="font-bold text-slate-950">
                          {location.name}
                        </p>

                        {location.displayName && (
                          <p className="mt-1 text-sm font-semibold text-red-600">
                            {location.displayName}
                          </p>
                        )}

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {location.address}
                        </p>

                        {location.hours !== "-" && (
                          <p className="mt-2 text-sm font-semibold text-red-600">
                            {location.hours}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}

export default ContactPage;