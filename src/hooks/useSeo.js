import { useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://backend.ddev.site";

/**
 * Hook to automatically apply SEO metadata to a page.
 * @param {string} pageIdentifier - The unique key for the page (e.g., 'home', 'pricing')
 */
export const useSeo = (pageIdentifier) => {
  useEffect(() => {
    if (!pageIdentifier) return;

    const fetchSeoData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/seo/${pageIdentifier}`);
        const seo = response.data.data;

        if (seo) {
          // 1. Update Title
          if (seo.title) {
            document.title = seo.title;
          }

          // 2. Update Meta Tags
          updateMetaTag("description", seo.meta_description);
          updateMetaTag("keywords", seo.meta_keywords);

          // 3. Update OG Tags
          updateMetaTag("og:title", seo.og_title || seo.title, "property");
          updateMetaTag("og:description", seo.og_description || seo.meta_description, "property");
          updateMetaTag("og:image", seo.og_image, "property");
        }
      } catch (error) {
        console.error(`Failed to fetch SEO data for ${pageIdentifier}:`, error);
      }
    };

    fetchSeoData();
  }, [pageIdentifier]);
};

/**
 * Helper to update or create a meta tag.
 * @param {string} name - The name or property attribute value.
 * @param {string} content - The content attribute value.
 * @param {string} attr - The attribute to match ('name' or 'property').
 */
function updateMetaTag(name, content, attr = "name") {
  if (!content) return;

  let element = document.querySelector(`meta[${attr}="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

export default useSeo;
