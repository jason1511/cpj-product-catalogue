# CV Chandra Putra Jaya Product Catalogue

A modern showroom-style product catalogue website for **CV Chandra Putra Jaya**, built with React, Vite, Tailwind CSS, React Router, and Motion.

This website presents electric bicycles and electric motorbikes from multiple brands in a searchable, filterable, and responsive digital showroom. The project is designed as a **showroom/catalogue website**, not a checkout-based online store.

## Overview

CV Chandra Putra Jaya Product Catalogue is a digital showroom for browsing electric mobility products. Users can view product details, filter products by brand/type/features, check basic specifications, and contact the business through WhatsApp for stock, colour availability, and latest pricing.

The website content is written in Indonesian to match the target users and business context.

## Features

- Indonesian-language website content
- Futuristic red, black, and white showroom design
- Responsive layout for desktop, tablet, and mobile
- Product catalogue with:
  - Search
  - Brand filter
  - Product type filter
  - Feature filter
  - Price and alphabetical sorting
  - Active filter chips
  - Empty result state
- Product detail modal with:
  - Product brand and model
  - Price
  - Description
  - Battery
  - Motor
  - Range
  - Speed
  - Load capacity
  - Wheel size
  - Brake information
  - Colour options
  - Source catalogue page
  - WhatsApp enquiry button
- Homepage sections:
  - Opening showroom section
  - Brand section
  - Category section
  - Featured products
  - Showroom browsing flow
- Contact page with:
  - WhatsApp enquiry cards
  - Main address
  - Operating hours
  - Branch/location list
- About page with showroom/corporate profile
- Desktop floating WhatsApp shortcut
- Mobile bottom contact bar
- Mobile navigation menu
- Route/page transition animation
- Section reveal animation
- Product grid animation
- Animated product modal
- 404 Not Found page

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Motion
- JavaScript

## Project Structure

```text
src/
  components/
    BrandSection.jsx
    CategorySection.jsx
    Container.jsx
    FeaturedProductsSection.jsx
    FloatingContactButton.jsx
    Footer.jsx
    MobileContactBar.jsx
    Navbar.jsx
    OrderStepsSection.jsx
    PageTransition.jsx
    ProductCard.jsx
    ProductDetailModal.jsx
    ProductGrid.jsx
    Reveal.jsx
    ScrollToTop.jsx
    SectionHeader.jsx

  data/
    brands.js
    categories.js
    products.js
    siteConfig.js

  pages/
    AboutPage.jsx
    CataloguePage.jsx
    ContactPage.jsx
    HomePage.jsx
    NotFoundPage.jsx

  utils/
    whatsapp.js

  App.jsx
  index.css
  main.jsx
```

## Pages

| Page | Route | Description |
|---|---|---|
| Beranda | `/` | Main showroom landing page |
| Katalog | `/catalogue` | Product catalogue with search, filters, sorting, and product modal |
| Tentang Kami | `/about` | Company/showroom information |
| Kontak | `/contact` | Contact information, WhatsApp links, and branch locations |
| Not Found | `*` | Custom 404 page |

## Product Data

Product catalogue data is currently stored locally in:

```text
src/data/products.js
```

Each product uses a structure similar to:

```js
{
  id: "pacific-blizzard-lite",
  brand: "Pacific",
  model: "Blizzard Lite",
  type: "motor-listrik",
  features: ["pedal"],
  price: 3800000,
  image: null,
  description: "Motor listrik pedal dari Pacific...",
  specs: {
    battery: "Lithium 48V / 12Ah",
    motor: "48V / 600 Watt",
    range: "Sekitar 40 km",
    speed: "25–40 km/jam",
    loadCapacity: "Maksimal 150 kg",
    wheelSize: "Ban tubeless 14 inci",
    brake: "Rem tromol"
  },
  colors: ["Pink"],
  sourcePage: 4,
  isFeatured: true,
  isActive: true
}
```

Brand and category data are stored in:

```text
src/data/brands.js
src/data/categories.js
```

Company/contact configuration is stored in:

```text
src/data/siteConfig.js
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:5173/
```

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Environment Variables

This project currently stores core site configuration in:

```text
src/data/siteConfig.js
```

However, an `.env.example` file can be included for future deployment or private values.

Example `.env.example`:

```env
# CPJ Product Catalogue
# Copy this file to .env.local for local development if needed.

VITE_SITE_NAME="CV Chandra Putra Jaya"
VITE_WHATSAPP_NUMBER="628xxxxxxxxxx"
```

Do not commit real private `.env` files.

## Deployment

This project can be deployed as a static Vite website.

Recommended hosting options:

- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

## Suggested Cloudflare Pages Settings

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

## Notes

This project is intended as a **digital showroom/catalogue**, not a full e-commerce store.

WhatsApp links are used for enquiries such as:

- Product stock
- Available colours
- Latest pricing
- Product recommendations
- Branch/location information

The product data was structured from the provided CPJ product catalogue PDF and can be updated manually in `src/data/products.js`.

## Future Improvements

Possible future improvements:

- Add real product images cropped/edited from the catalogue
- Move product data from local JSON/JS into a database
- Add hidden admin page for product management
- Add Cloudflare D1 or Supabase backend
- Add image storage using Cloudflare R2
- Add product comparison by specification
- Add brand-specific landing sections
- Add SEO metadata per product/brand
- Add sitemap and robots.txt
- Add analytics tracking

## Repository

```text
https://github.com/YOUR_USERNAME/cpj-product-catalogue
```

Replace the URL above with the actual GitHub repository URL after pushing.

## Author

Developed by **Jason Leonard**.

## License

This project is licensed under the MIT License.

You are free to use, modify, and distribute this project, provided that the original copyright notice and license text are included.

See the `LICENSE` file for details.