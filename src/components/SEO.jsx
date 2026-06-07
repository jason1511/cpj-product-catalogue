import { useEffect } from "react";

const siteName = "CV Chandra Putra Jaya";
const baseUrl = "https://cpj-product-catalogue.pages.dev";

function updateMetaAttribute(selector, attribute, value) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");

    if (selector.includes("property=")) {
      const property = selector.match(/property="([^"]+)"/)?.[1];
      element.setAttribute("property", property);
    } else {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      element.setAttribute("name", name);
    }

    document.head.appendChild(element);
  }

  element.setAttribute(attribute, value);
}

function updateCanonical(url) {
  let canonical = document.head.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", url);
}

function SEO({
  title,
  description,
  canonicalPath = "/",
  image = "/logo_cpj.png",
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

    document.title = fullTitle;

    updateMetaAttribute(
      'meta[name="description"]',
      "content",
      description,
    );

    updateCanonical(canonicalUrl);

    updateMetaAttribute('meta[property="og:title"]', "content", fullTitle);
    updateMetaAttribute(
      'meta[property="og:description"]',
      "content",
      description,
    );
    updateMetaAttribute('meta[property="og:url"]', "content", canonicalUrl);
    updateMetaAttribute('meta[property="og:image"]', "content", imageUrl);
    updateMetaAttribute('meta[property="og:type"]', "content", "website");
    updateMetaAttribute(
      'meta[property="og:site_name"]',
      "content",
      siteName,
    );
    updateMetaAttribute('meta[property="og:locale"]', "content", "id_ID");

    updateMetaAttribute(
      'meta[name="twitter:card"]',
      "content",
      "summary_large_image",
    );
    updateMetaAttribute('meta[name="twitter:title"]', "content", fullTitle);
    updateMetaAttribute(
      'meta[name="twitter:description"]',
      "content",
      description,
    );
    updateMetaAttribute('meta[name="twitter:image"]', "content", imageUrl);
  }, [title, description, canonicalPath, image]);

  return null;
}

export default SEO;