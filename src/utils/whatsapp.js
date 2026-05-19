import { siteConfig } from "../data/siteConfig";

export function createWhatsAppLink(message) {
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodedMessage}`;
}

export function createGeneralProductMessage() {
  return `Halo ${siteConfig.companyName}, saya ingin bertanya tentang produk sepeda atau motor listrik.`;
}

export function createProductMessage(product) {
  const colorsText =
    product.colors && product.colors.length > 0
      ? product.colors.join(", ")
      : "-";

  return `Halo ${siteConfig.companyName}, saya ingin bertanya tentang produk berikut:

Merek: ${product.brand}
Model: ${product.model}
Pilihan warna di katalog: ${colorsText}

Mohon info stok, warna tersedia, dan harga terbaru.`;
}