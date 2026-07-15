export function updateSEO({
  title,
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage = 'https://birvana.indevs.in/assets/birvana-mark.png'
}: {
  title: string
  description: string
  canonicalUrl: string
  ogTitle?: string
  ogDescription?: string
  ogUrl?: string
  ogImage?: string
}) {
  document.title = title;

  const setMeta = (selector: string, attrName: string, value: string) => {
    let element = document.querySelector(selector);
    if (!element) {
      const head = document.head;
      if (selector.startsWith('meta[')) {
        element = document.createElement('meta');
        const nameMatch = selector.match(/name="([^"]+)"/);
        const propMatch = selector.match(/property="([^"]+)"/);
        if (nameMatch) element.setAttribute('name', nameMatch[1]);
        if (propMatch) element.setAttribute('property', propMatch[1]);
        head.appendChild(element);
      } else if (selector.startsWith('link[')) {
        element = document.createElement('link');
        const relMatch = selector.match(/rel="([^"]+)"/);
        if (relMatch) element.setAttribute('rel', relMatch[1]);
        head.appendChild(element);
      }
    }
    if (element) {
      element.setAttribute(attrName, value);
    }
  };

  setMeta('meta[name="description"]', 'content', description);
  setMeta('link[rel="canonical"]', 'href', canonicalUrl);
  
  // Open Graph
  setMeta('meta[property="og:title"]', 'content', ogTitle || title);
  setMeta('meta[property="og:description"]', 'content', ogDescription || description);
  setMeta('meta[property="og:url"]', 'content', ogUrl || canonicalUrl);
  setMeta('meta[property="og:image"]', 'content', ogImage);
  
  // Twitter Cards
  setMeta('meta[name="twitter:card"]', 'content', 'summary');
  setMeta('meta[name="twitter:title"]', 'content', ogTitle || title);
  setMeta('meta[name="twitter:description"]', 'content', ogDescription || description);
  setMeta('meta[name="twitter:url"]', 'content', ogUrl || canonicalUrl);
  setMeta('meta[name="twitter:image"]', 'content', ogImage);
}
